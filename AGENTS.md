# Repository Guidelines

## Project Structure & Module Organization
- `frontend/`: Next.js app. Source lives in `frontend/src/app`, shared API helpers in `frontend/src/lib`, and static assets in `frontend/public`.
- `backend/`: NestJS app. Source lives in `backend/src` with `*.module.ts`, `*.service.ts`, and `*.controller.ts` (see `backend/src/consult`). Prisma schema and migrations are in `backend/prisma` and `backend/prisma/migrations`.
- Tests: unit tests in `backend/src/**/*.spec.ts`, end-to-end tests in `backend/test`.

## Build, Test, and Development Commands
Run commands from each subdirectory:

Frontend (`frontend/`):
- `pnpm install`: install dependencies.
- `pnpm dev`: run the Next.js dev server at `http://localhost:3000`.
- `pnpm build` / `pnpm start`: build and run the production server.
- `pnpm lint`: run ESLint.

Backend (`backend/`):
- `pnpm install`: install dependencies.
- `pnpm run start:dev`: run NestJS in watch mode.
- `pnpm run build` / `pnpm run start:prod`: build and run production output.
- `pnpm run lint`: run ESLint (auto-fix enabled).
- `pnpm run test`, `pnpm run test:e2e`, `pnpm run test:cov`: Jest unit, e2e, and coverage.

Local stack:
- `docker compose up --build` in `backend/` starts Postgres and the backend using the compose `DATABASE_URL`.

## Coding Style & Naming Conventions
- TypeScript across frontend and backend; keep patterns consistent with Next.js and NestJS.
- Frontend components: PascalCase where applicable; route files remain `page.tsx`, `layout.tsx`, and `providers.tsx`.
- Backend: follow Nest naming (`*.module.ts`, `*.service.ts`, `*.controller.ts`).
- Lint/format: `pnpm lint` in both projects; backend formatting via `pnpm format` (Prettier).

## Testing Guidelines
- Jest for backend unit and e2e tests. Place new unit tests in `*.spec.ts` under `backend/src` and e2e tests in `backend/test`.
- No frontend test harness is defined yet; add one only when a change requires it.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `type(scope): summary` (for example, `feat(frontend): add advice page` or `fix(backend): handle empty consult`).
- Allowed types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `build`, `ci`.
- PRs should include a concise summary, testing notes, and screenshots for UI changes. Link related issues when available and keep the PR title aligned with the commit convention.

## Security & Configuration
- Use environment variables for secrets; Prisma expects `DATABASE_URL`.
- Do not commit local `.env` files or credentials.
