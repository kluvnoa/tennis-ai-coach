# syntax=docker/dockerfile:1

FROM node:20-alpine AS base

RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps

WORKDIR /app/backend

COPY backend/package.json backend/pnpm-lock.yaml ./
COPY packages/api-contracts ../packages/api-contracts
RUN pnpm install --frozen-lockfile

FROM base AS builder

WORKDIR /app
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY backend ./backend
COPY packages ./packages

WORKDIR /app/backend
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" pnpm prisma generate
RUN pnpm build

FROM base AS runner

ENV NODE_ENV=production
WORKDIR /app/backend

COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./
COPY --from=builder /app/backend/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/main"]
