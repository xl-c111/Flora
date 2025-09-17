# Flora Dev Container Setup

This Dev Container configuration provides a complete development environment for the Flora marketplace project.

## 🚀 Quick Start with Dev Container

### Prerequisites

- **VS Code** with **Dev Containers extension** installed
- **Docker Desktop** running

### Getting Started

1. **Open project in VS Code:**

   ```bash
   code flora-dev.code-workspace
   ```

2. **Reopen in Container:**

   - VS Code will show a popup: "Reopen in Container"
   - Click "Reopen in Container"
   - Or use Command Palette: `Dev Containers: Reopen in Container`

3. **Wait for setup:**

   - Container will build and install dependencies
   - Database will be set up automatically
   - This takes 3-5 minutes the first time

4. **Start developing:**

   ```bash
   # Start backend
   cd apps/backend && pnpm dev

   # Start frontend (in new terminal)
   cd apps/frontend && pnpm dev
   ```

## 🎯 Development Modes

### Mode 1: Full Dev Container (Recommended)

Everything runs inside the container:

```bash
# Backend in terminal 1
cd apps/backend && pnpm dev

# Frontend in terminal 2
cd apps/frontend && pnpm dev
```

### Mode 2: Hybrid with existing Docker services

Use your existing Docker setup with Dev Container IDE:

```bash
# Start your existing services
./dev.sh start

# Develop with Dev Container VS Code environment
```

## 🔧 What's Included

### Pre-installed Tools

- ✅ Node.js 18
- ✅ pnpm package manager
- ✅ Docker CLI (for managing external containers)
- ✅ Git and GitHub CLI
- ✅ PostgreSQL client tools

### VS Code Extensions

- ✅ TypeScript support
- ✅ Prisma extension
- ✅ ESLint & Prettier
- ✅ Thunder Client (API testing)
- ✅ Docker extension
- ✅ GitLens

### Port Forwarding

- **3001** → Backend API
- **5173** → Frontend (Vite)
- **5432** → PostgreSQL Database

## 🗃️ Database Access

The Dev Container automatically connects to your PostgreSQL database:

```bash
# Database is accessible at:
postgresql://flora_user:flora_password@postgres:5432/flora_db

# Or use psql directly:
psql -h postgres -U flora_user -d flora_db
```

## 🆘 Troubleshooting

### Container won't start

```bash
# Rebuild container
Cmd/Ctrl + Shift + P → "Dev Containers: Rebuild Container"
```

### Database connection issues

```bash
# Check if database is running
docker ps

# Restart database
./dev.sh restart
```

### TypeScript errors

```bash
# Regenerate Prisma client
cd apps/backend && pnpm db:generate
```

### Port conflicts

- Check if ports 3001, 5173, or 5432 are in use
- Stop existing services: `./dev.sh stop`

## 🔄 Switching Between Modes

### From Hybrid to Dev Container:

1. Stop local services: `./dev.sh stop`
2. Open in Dev Container: Command Palette → "Reopen in Container"
3. Start services inside container

### From Dev Container to Hybrid:

1. Close Dev Container: Command Palette → "Reopen Folder Locally"
2. Install dependencies: `pnpm install`
3. Start Docker services: `./dev.sh start`

## 💡 Pro Tips

- **Terminal multiplexing**: Use VS Code's split terminal feature
- **Database management**: Use Thunder Client extension for API testing
- **Git integration**: GitLens provides excellent Git workflow
- **Docker management**: Use Docker extension to manage containers
- **Hot reload**: Both frontend and backend support hot reload in Dev Container

## 🎯 Benefits

✅ **Consistent Environment**: Everyone has the same development setup
✅ **No Local Dependencies**: No need to install Node.js, pnpm, or PostgreSQL locally
✅ **Isolated Development**: Won't conflict with other projects
✅ **Full VS Code Integration**: All extensions and settings pre-configured
✅ **Easy Onboarding**: New team members get started in minutes
