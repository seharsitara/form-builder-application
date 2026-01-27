# Form Builder Application

Next.js frontend and NestJS backend for building forms/quizzes, collecting submissions, and reviewing scores/answers. The frontend uses a shared `API_BASE` config; the backend uses Prisma with Postgres.

## Project layout
- `api/` — NestJS API (Prisma, Postgres, JWT auth)
- `web/` — Next.js app (form builder, quiz mode, responses workspace)

## Prerequisites
- Node.js 18+
- npm
- Postgres (Supabase works; use direct connection for migrations if pooler blocks DDL)

## Setup

### Backend (api)
1) Install deps
```
cd api
npm install
```
2) Create `api/.env` (example keys)
```
DATABASE_URL=postgresql://user:pass@host:port/db
DIRECT_URL=postgresql://user:pass@host:5432/db  # optional, use for migrations if pooler blocks
JWT_SECRET=change-me
JWT_EXPIRES_IN=1h
PORT=8000
```
3) Generate Prisma client and apply schema
```
npx prisma generate
npx prisma migrate dev --name init
# If migrate fails on a pooled URL, use DIRECT_URL or apply SQL manually, then prisma generate
```
4) Run the API (dev)
```
npm run start:dev
```

### Frontend (web)
1) Install deps
```
cd web
npm install
```
2) Create `web/.env.local`
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```
3) Run the app (dev)
```
npm run dev
```

## Running both
- Terminal 1: `cd api && npm run start:dev`
- Terminal 2: `cd web && npm run dev`
- Default ports: API 8000, Web 3000. Adjust envs if you change ports.

## Key features
- Form/quiz builder with correct answers and scoring
- Response submission and storage (Postgres via Prisma)
- Admin dashboard with totals and a dedicated responses workspace (`/dashboard/responses`) to paste a form link/ID and review answers/scores/correct answers
- JWT auth for admins

## Useful scripts

### API
- `npm run start:dev` — dev server (watch)
- `npm run build` — compile to `dist`
- `npm run test` — Jest tests
- `npm run lint` — ESLint
- `npm run prisma:generate` — regenerate Prisma client

### Web
- `npm run dev` — Next dev server
- `npm run build` — production build
- `npm run start` — start production build
- `npm run lint` — ESLint

## Notes
- The frontend shares API base URL via `web/src/lib/config.ts`; set `NEXT_PUBLIC_API_BASE_URL` in `.env.local`.
- Build outputs (`dist/`, `.next/`) are ignored via `.gitignore`; keep them untracked.
