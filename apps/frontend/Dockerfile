# Frontend Dockerfile
# syntax=docker/dockerfile:1.4
FROM node:20-alpine as base

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy only manifests first for better cache
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/frontend/package.json apps/frontend/
COPY apps/frontend/tsconfig.json apps/frontend/

# Install only frontend deps with cache mount
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store/v3 \
    pnpm install --filter ./apps/frontend... --frozen-lockfile

# Copy the rest of the source after deps are cached
COPY apps/frontend ./apps/frontend

WORKDIR /app/apps/frontend

# Build production bundle
RUN pnpm run build

EXPOSE 5173

CMD ["pnpm", "preview", "--host", "0.0.0.0", "--port", "5173"]
