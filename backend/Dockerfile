# syntax=docker/dockerfile:1

FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Dependencies installation stage
FROM base AS deps

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client (using dummy DATABASE_URL to pass schema validation)
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" pnpm prisma generate

# Build the application
RUN pnpm build

# Production stage
FROM base AS runner

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/main"]
