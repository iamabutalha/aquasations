# Aquasations Docker setup (Neon Local for development, Neon Cloud for production)

This project is dockerized with separate development and production flows:

- Development uses `neondatabase/neon_local` in Docker Compose and routes the app to `postgres://neon:npg@neon-local:5432/neondb`.
- Production connects directly to Neon Cloud using `DATABASE_URL` and does not run Neon Local.

## Files added

- `Dockerfile`
- `docker-compose.dev.yml`
- `docker-compose.prod.yml`
- `.env.development`
- `.env.production`

## 1) Development (local) with Neon Local

Neon Local acts as a proxy and can automatically create ephemeral branches per container run.

### Configure environment

Edit `.env.development` and set:

- `NEON_API_KEY`
- `NEON_PROJECT_ID`
- `PARENT_BRANCH_ID` (optional; if omitted, Neon uses project default branch)
- `JWT_SECRET`
- `ARCJET_KEY`

The app DB URL in dev is:

- `DATABASE_URL=postgres://neon:npg@neon-local:5432/neondb?sslmode=require`

### Start development stack

```bash
docker compose -f docker-compose.dev.yml up --build
```

This starts:

- `neon-local` (Neon Local proxy)
- `app` (Express API in watch mode)

App is available at:

- `http://localhost:3000`

Stop stack:

```bash
docker compose -f docker-compose.dev.yml down
```

When `DELETE_BRANCH=true`, Neon Local deletes ephemeral branches when the container stops.

## 2) Production with Neon Cloud

In production, use Neon Cloud URL directly via environment variables.

### Configure environment

Edit `.env.production` and set:

- `DATABASE_URL` (your Neon Cloud `postgres://...neon.tech...` URL)
- `JWT_SECRET`
- `ARCJET_KEY`

### Start production stack

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

This starts:

- `app` only

The serverless Neon database runs on Neon Cloud (managed service), so no Neon Local container is used in production.

## 3) How env switching works

- `docker-compose.dev.yml` loads `.env.development` and points app traffic to `neon-local`.
- `docker-compose.prod.yml` loads `.env.production` and points app traffic to Neon Cloud.
- App database configuration checks `NEON_LOCAL_SQL_ENDPOINT`:
  - Set in development to use Neon Local HTTP endpoint (`http://neon-local:5432/sql`).
  - Unset in production, so app uses Neon Cloud normally.
