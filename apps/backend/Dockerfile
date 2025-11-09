# Backend Dockerfile
# syntax=docker/dockerfile:1.4
FROM node:20-alpine AS base

WORKDIR /app

# Install pnpm and OpenSSL (required for Prisma)
RUN npm install -g pnpm && apk add --no-cache openssl

# Leverage build cache by installing only backend deps first
# Copy workspace files and backend manifests only
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/backend/package.json apps/backend/
COPY apps/backend/tsconfig.json apps/backend/
COPY apps/backend/prisma apps/backend/prisma

# Install only backend workspace deps using cache mounts
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store/v3 \
    pnpm install --filter ./apps/backend... --frozen-lockfile

# Now copy the rest of the workspace (source changes won’t invalidate deps)
COPY apps ./apps

WORKDIR /app/apps/backend

# Generate Prisma client and build
RUN pnpm prisma generate && pnpm run build

EXPOSE 3001

CMD ["pnpm", "start:prod"]
