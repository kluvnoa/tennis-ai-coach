# Tennis AI Coach

Public-ready monorepo with a Next.js frontend and a NestJS backend.

## Setup

### Prerequisites
- Node.js 20+
- pnpm 10+
- Docker (for Postgres)

### Backend + database
1. `cd backend`
2. `pnpm install`
3. `cp .env.example .env`
4. Set `DATABASE_URL`, `OPENAI_API_KEY`, and `OPENAI_MODEL` (for example `postgresql://tennis_user:tennis_pass@localhost:5432/tennis_db` with the provided compose file).
5. Start Postgres with `docker compose up -d db` (or run both services with `docker compose up --build`).
6. (Optional) Apply migrations: `pnpm prisma migrate dev`
7. Start the API: `pnpm run start:dev`

### Frontend
1. `cd frontend`
2. `pnpm install`
3. `cp .env.example .env.local`
4. Set `NEXT_PUBLIC_API_URL` (for example `http://localhost:4000`).
5. Start the app: `pnpm dev`

## Environment variables

### Frontend (`frontend/.env.example`)
| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL for the backend API. |

### Backend (`backend/.env.example`)
| Variable | Description |
| --- | --- |
| `POSTGRES_USER` | Username to connect to Postgres. |
| `POSTGRES_PASSWORD` | Password to connect to Postgres. |
| `OPENAI_API_KEY` | OpenAI API key for model access. |
| `OPENAI_MODEL` | OpenAI model identifier (for example `gpt-4o-mini`). |
| `CORS_ORIGINS` | Comma-separated list of allowed origins for CORS (for example `http://localhost:3000,https://example.com`). |

## Security
- Never commit `.env` files, API keys, or private keys. Use the provided `.env.example` files.
- If a secret is exposed, rotate/revoke it immediately, update the deployment environment, and invalidate any affected tokens.
- Install `gitleaks` (for example via Homebrew or GitHub releases) and run: `gitleaks detect --source . --redact --config .gitleaks.toml`.
- If secrets were committed, consider rewriting history with tools like `git filter-repo` or BFG (do not rewrite history without team agreement).
- Gitleaks allowlist entries live in `.gitleaks.toml` for documented false positives.

## License / Third-party notices
- License: `LICENSE` (MIT).
- Third-party notices: `THIRD_PARTY_NOTICES.md`.
- Regenerate notices after installing dependencies in both apps: `node scripts/generate-third-party-notices.mjs`.

## Security Considerations

### CORS Configuration
Set `CORS_ORIGINS` environment variable for production (comma-separated list of allowed origins).

### Third-party Licenses
This project uses `sharp` which depends on `libvips` (LGPL-3.0-or-later).
As we use dynamic linking, no source code disclosure is required. 
