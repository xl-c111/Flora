# Frontend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy all apps
COPY apps ./apps

# Install dependencies
RUN pnpm install

# Set working directory to frontend
WORKDIR /app/apps/frontend

# Build production bundle (compile TypeScript + Vite build)
RUN pnpm run build

# Expose port
EXPOSE 5173

# Start command - serve production build
CMD ["pnpm", "preview", "--host", "0.0.0.0", "--port", "5173"]