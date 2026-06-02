# Bloggy

A React + Vite blog application built with Appwrite for authentication, database, and storage.

## Features

- Email/password authentication with Appwrite
- CRUD blog post management
- Rich text editing using TinyMCE
- Appwrite database and storage integration
- React Router v7 pages for home, post detail, add/edit post, login, signup
- Redux Toolkit for state management

## Tech stack

- React 19
- Vite 8
- Appwrite 24
- Tailwind CSS 4
- Redux Toolkit
- TinyMCE rich text editor
- ESLint

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root with Appwrite settings:

```env
VITE_APPWRITE_URL=https://[HOSTNAME_OR_IP]/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_TABLE_ID=your_table_id
VITE_APPWRITE_BUCKET_ID=your_bucket_id
```

3. Start the development server:

```bash
npm run dev
```

4. Open the app in your browser at:

```text
http://localhost:5173
```

## Scripts

- `npm run dev` — start the Vite development server
- `npm run build` — build the production bundle
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint across the project

## Environment variables

This project uses `conf/conf.js` to read the following Vite environment variables:

- `VITE_APPWRITE_URL`
- `VITE_APPWRITE_PROJECT_ID`
- `VITE_APPWRITE_DATABASE_ID`
- `VITE_APPWRITE_TABLE_ID`
- `VITE_APPWRITE_BUCKET_ID`

## Project structure

- `src/` — application source code
  - `appwrite/` — Appwrite client and auth helpers
  - `components/` — reusable UI components
  - `pages/` — route page components
  - `store/` — Redux Toolkit store and slices
- `public/` — static assets, including TinyMCE distribution
- `conf/` — Appwrite configuration loader

## Notes

- Keep Appwrite credentials private and do not commit `.env` files.
- `public/tinymce/` is included for the rich text editor assets.
- Adjust your Appwrite project rules and permissions to match the app’s authentication flow.
