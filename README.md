# Bloggy

A full-stack blog: React + Vite frontend, Express + MongoDB API, JWT auth in an
httpOnly cookie, and Cloudinary cover images.

## Structure

- `frontend/` — React 19 + Vite 8 + Tailwind 4 SPA (Redux Toolkit, React Router, TinyMCE)
- `backend/` — Express 4 + Mongoose API (`/api/posts`, `/api/users`, `/api/cloudinary`)
- `src/`, `conf/`, root `package.json` — legacy Appwrite version kept for reference only;
  it is not part of the running app.

## Run locally

1. Backend (port 8000):

```bash
cd backend
npm install
npm start          # or: npm run dev  (node --watch)
```

`backend/.env` must define:

```env
PORT=8000
MONGODB_URI=mongodb://127.0.0.1:27017/bloggy
JWT_SECRET=change-me
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_FOLDER=bloggy/posts
```

2. Frontend (Vite dev server):

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173 (or 5174 if 5173 is taken)
```

`frontend/.env` only needs the API URL:

```env
VITE_API_URL=http://localhost:8000/api
```

Use the same hostname (`localhost` or `127.0.0.1`) for both servers — the JWT
cookie is scoped to the backend host, so mixing them signs you out on writes.

## API contract

- Posts are addressed by `slug`: `GET/PUT/DELETE /api/posts/:slug`
- `GET /api/posts?page=1&limit=12&search=term` returns `{ rows, page, pages, total }`
- `GET /api/posts/me` lists the signed-in user's posts
- `featuredImage` is `{ url, publicId }` from `POST /api/cloudinary/upload`

## Scripts (`frontend/`)

- `npm run dev` — Vite dev server
- `npm run build` — production bundle
- `npm run preview` — preview the build
- `npm run lint` — ESLint (`src/`; `dist` and `public` are ignored)
