# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install pnpm and OpenSSL (required for Prisma)
RUN npm install -g pnpm && \
    apk add --no-cache openssl

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy all apps
COPY apps ./apps

# Install dependencies
RUN pnpm install

# Set working directory to backend
WORKDIR /app/apps/backend

# Generate Prisma client
RUN pnpm prisma generate

# Build TypeScript (compile src/ to dist/)
RUN pnpm run build

# Expose port
EXPOSE 3001

# Start command - runs migrations, seeds DB, then starts server
CMD ["pnpm", "start:prod"]