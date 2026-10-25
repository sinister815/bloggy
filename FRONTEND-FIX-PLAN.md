# Bloggy — Frontend Fix Plan (analysis only, kuch bhi implement nahi kiya)

Date: 2026-10-17 · Target: `frontend/` (React + Vite) ↔ `backend/` (Express + Mongo, port 8000)

## 0. Diagnosis summary

`frontend/` me `src/` ka code Appwrite se Node/Express API pe port kiya gaya hai — copy mostly theek hai,
lekin **do cheezein poori app ko tod rahi hain**:

1. **Tailwind purge ho gaya** → UI poori tarah unstyled (aapke screenshot wala look).
2. **`_id` vs `slug` mismatch** → kisi bhi post card pe click karne se page blank ho jata hai.

Aur ek backend contract gap hai: **cover image save hi nahi hoti**.

### Evidence (maine chala ke dekha, guess nahi)

| Check | Command | Result |
|---|---|---|
| Built CSS me utilities? | `cd frontend && npm run build` | CSS sirf **5.13 kB**, `.sticky`/`.grid`/`.rounded-2xl`/`.text-slate-500` = **0 matches** |
| Same build without `src/` ignore | `.gitignore` se `src/` hataya, build | `.sticky` 1, `.grid` 1, `.rounded-2xl` 1, `.text-slate-500` 1 → **utilities aa gaye** |
| Browser | `localhost:5174` pe fresh render | `header` `position: static`, grid `display: block` → Tailwind load hi nahi hua |
| Click-through | post card click | URL `/post/6ac008953dc87bc217475d01` pe ruka, `article`/`h1` = **null**, blank page |
| API by id | `GET /api/posts/<_id>` | **404** |
| API by slug | `GET /api/posts/<slug>` | **200** |
| Create with image | `POST /api/posts` + `featuredImage` | response me `featuredImage` **nahi** aaya → image store nahi hoti |
| `frontend/src` git? | `git check-ignore -v frontend/src/App.jsx` | `.gitignore:28:src/` → **ignored** (commit hi nahi ho sakta) |
| Lint | `npx eslint .` | 1739 problems, jisme ~1700 `public/tinymce/*` (vendored) se; `npx eslint src` = **1 error + 1 warning** |

---

## 1. Blocking bug — `.gitignore` ne Tailwind maar diya

[.gitignore](.gitignore#L28-L30) ke last me ye lines add hui hain:

```
src/
public/
conf/
```

Tailwind v4 apne source files **automatically** dhundta hai aur `.gitignore` me jo ignore hai use
**skip** kar deta hai. Iska matlab: `frontend/src/**/*.jsx` scan hi nahi hua, CSS me sirf preflight +
`App.css` gaya. Screenshot me nav vertical, bade bina-style image, koi card shadow nahi — sab isi ka result.

Fix: `28-30` lines delete kar do (ya zaroorat ho to `/src/` type scoped pattern, jo `frontend/src` ko na roke).
Yehi line `frontend/src` ko git se bhi chupa rahi hai, to frontend ka koi kaam commit nahi hoga.

## 2. Blocking bug — slug ki jagah `_id` use ho raha hai

Backend routes `:slug` pe hain (`GET/PUT/DELETE /api/posts/:slug`), par frontend har jagah `_id` bhej raha hai:

| File | Line | Ab | Chahiye |
|---|---|---|---|
| [PostCard.jsx](frontend/src/components/PostCard.jsx#L26) | 26 | `/post/${_id}` | `/post/${slug}` |
| [Post.jsx](frontend/src/pages/Post.jsx#L32) | 32 | `deletePost(post._id)` | `deletePost(post.slug)` |
| [Post.jsx](frontend/src/pages/Post.jsx#L52) | 52 | `/edit-post/${post._id}` | `/edit-post/${post.slug}` |
| [PostForm.jsx](frontend/src/components/post-form/PostForm.jsx#L41) | 41 | `updatePost(post._id, …)` | `post.slug` |
| [PostForm.jsx](frontend/src/components/post-form/PostForm.jsx#L43,48) | 43, 48 | `navigate('/post/' + post._id)` | `post.slug` |

Isi ki wajah se: card click → 404 → `Post.jsx` me `.catch()` nahi hai → blank page (URL bhi wahi rehta hai).

## 3. Auth state `_id` ke bajaye `$id` store kar raha hai

[App.jsx](frontend/src/App.jsx#L26), [Login.jsx](frontend/src/components/Login.jsx#L26),
[SignUp.jsx](frontend/src/components/SignUp.jsx#L26) — `userData: { $id: user._id, ... }` (Appwrite ka
leftover). Isse [Post.jsx:14](frontend/src/pages/Post.jsx#L14) ka
`isAuthor = post.userId === userData._id` **kabhi true nahi hota**, kyunki API `userId` ko object
`{_id, name, email}` ke roop me populate karta hai.

Fix: state me `{ _id, name, email, avatar }` rakho aur check `post.userId?._id === userData?._id`.

## 4. Backend contract gap — cover image save nahi hoti

[postController.js](backend/src/controllers/postController.js) ka `createPost` sirf
`title, slug, content, excerpt, tags, category, status` leta hai; `featuredImage` **drop** ho jata hai
(verified: create ke baad doc me `featuredImage` absent, card pe "No image").
`updatePost` bhi `featuredImage` accept nahi karta.

Do options: (a) backend ke dono handlers me `featuredImage` accept karo (chhota patch), ya
(b) frontend se image upload hi hata do. (a) hi sahi hai.

## 5. Baaki real bugs / gaps (functional nahi to bhi user ko dikhenge)

- [Post.jsx:45](frontend/src/pages/Post.jsx#L45) — `<img>` bina condition render hota hai → bina cover wale post pe broken-image icon. PostCard me fallback hai, Post me nahi.
- [Home.jsx:11](frontend/src/pages/Home.jsx#L11), [AllPosts.jsx:9](frontend/src/pages/AllPosts.jsx#L9) — na `loading`, na `.catch()`. API fail hone par chup-chaap "Sign in to start reading…" hero dikhta hai (CORS band karke ye maine reproduce kiya). User ko lagta hai posts hi nahi hain.
- `GET /api/posts/me` (getMyPosts) backend me hai par frontend kahin call nahi karta; AllPosts "All Posts" hi dikhata hai — decide karna hai "My Posts" chahiye ya nahi.
- API paginate karta hai (`page`, `pages`, `total`, `limit`) par UI `getPosts()` bina params call karta hai → sirf pehle 12 posts, na pagination na search, jabki 15 posts already DB me hain.
- [axios.js:13-15](frontend/src/api/axios.js#L13-L15) module load pe ek baar token padhta hai aur 401 pe sirf `localStorage` clear karta hai (default header nahi) → auth state inconsistent. JWT httpOnly cookie se aata hai, to localStorage fallback hata kar cookie-only rakhna saaf hai.
- [App.jsx](frontend/src/App.jsx) bina token ke bhi `getMe()` call karta hai → har page load pe 401 (console me dikh raha tha).
- Delete pe koi confirmation nahi; `deleteHandler` me bhi sirf `console.error`.
- `backend/.env` me `CORS_ORIGIN=http://localhost:5173` — 5173 aapke doosre project (SmartNotes) ka hai, isliye frontend 5174 pe aate hi CORS block (maine reproduce kiya). Ports/ E. env ko align karna hoga.
- `frontend/index.html` ka title abhi bhi `blog-appwrite`; koi 404 route nahi; `frontend/.env` file hi nahi (sirf `.env.example`).
- Root `src/` abhi bhi purana **Appwrite** app hai (root `package.json` me `appwrite` dep, `conf/conf.js`). Purane AI ne root `src/App.jsx`, `PostCard.jsx`, `Post.jsx` me cosmetic edits bhi kiye hain (git diff me M) — ye duplicate kaam hai, migrate hone ke baad root `src/` hatana ya reference ke liye rakhna decide karna hai.

---

## 6. Implementation plan (aapke "haan bolo" ke baad)

**Phase 1 — Blocking (chhota, sabse bada fayda)**
1. `.gitignore` se `src/`, `public/`, `conf/` hatao → Tailwind wapas on.
2. `frontend/eslint.config.js` me `globalIgnores(['dist', 'public'])`.
3. Saare `_id` → `slug` (PostCard, Post, PostForm, EditPost flow).
4. Auth state me `_id` + `avatar`; `isAuthor` fix.
Proof: build CSS ka size 5 kB → ~20 kB+, browser me styled UI, card click → post khulta hai.

**Phase 2 — Correctness**
5. Backend `createPost`/`updatePost` me `featuredImage` accept karo (image persist fix).
6. Home/AllPosts/Post: loading + `.catch()` + error message; Post me `<img>` conditional; delete pe confirm.
7. `frontend/.env` (`.env.example` se) + `CORS_ORIGIN` align (5173/5174), `index.html` title fix.
8. axios: cookie-only auth, 401 pe state clear, interceptor se auth token hatao.

**Phase 3 — Bosch/architecture cleanup (optional)**
9. Pagination + search UI (`page`/`limit`/`search` params already API me hain).
10. `AllPosts` = "My Posts" (getMyPosts) ya dono tabs.
11. Root `src/` (Appwrite app) remove + README me run steps (`backend: npm run dev`, `frontend: npm run dev`).

**Verification (har phase ke baad)**
- `npm run build` (frontend) + `npx eslint src` clean.
- API smoke: register → login → create post (+image) → GET by slug 200 / by _id 404 → update → delete → dusre account se 403.
- Browser click-through: register → Add Post (image ke saath) → card pe image dikhe → post khule → Edit → Update → Delete.
- Dev servers: backend pehle, phir frontend; CORS check console me.

## 7. Aapke decide karne wale 3 points
1. Backend me `featuredImage` patch karne ki permission hai? (warna create pe image kabhi save nahi hogi)
2. Root ka purana Appwrite `src/` delete karna hai ya reference ke liye rakhna hai?
3. `AllPosts` ka matlab "sab posts" rahega ya "mere posts" (getMyPosts)?
