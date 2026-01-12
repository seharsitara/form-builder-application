# Form Builder Workspace

## Structure
- api/ — NestJS backend
- web/ — Next.js frontend

## Prerequisites
- Node.js 18+
- npm

## Setup
1) Install deps
```
cd api && npm install
cd ../web && npm install
```

2) Env files
- Copy api/.env.example to api/.env and adjust.
- Copy web/.env.local.example to web/.env.local and adjust.

3) Database
- Requires Postgres. Update `DATABASE_URL` in `api/.env`.
- After setting the URL, generate Prisma client and apply migrations:
```
cd api
npx prisma generate
npx prisma migrate dev --name init
```

4) Run backend (default port 8000)
```
cd api
npm run start:dev
```

5) Run frontend (default port 3000)
```
cd web
npm run dev
```

## API URL
Frontend expects `NEXT_PUBLIC_API_URL` (see web/.env.local.example) pointing at the backend. If you keep backend on 8000, set `NEXT_PUBLIC_API_URL=http://localhost:8000`.

### Backend env
- `PORT` default 8000
- `JWT_SECRET` secret key for signing tokens
- `JWT_EXPIRES_IN` token lifetime (e.g., 1h)

## Notes
- CORS is enabled in the backend for local dev.
- Change ports by editing api/.env and the frontend env.
