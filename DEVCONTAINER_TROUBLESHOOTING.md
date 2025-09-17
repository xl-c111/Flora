# Dev Container Troubleshooting Guide

## 🛠️ Common Issues and Solutions

### Issue 1: "Reopen in Container" prompt doesn't appear

**Solutions:**

1. Make sure the `.devcontainer` folder exists in the root
2. Close VS Code completely and reopen the project
3. Manually trigger: `Cmd+Shift+P` → "Dev Containers: Reopen in Container"

### Issue 2: Container fails to build

**Check Docker:**

```bash
# Ensure Docker is running
docker ps

# Check Docker Compose syntax
docker-compose config
```

**Clean Docker cache:**

```bash
# Remove all containers and images
docker-compose down --rmi all -v
docker system prune -a
```

### Issue 3: VS Code extensions not working in container

**Solution:**

- Extensions are installed automatically via `devcontainer.json`
- If missing, install manually in the container environment
- Check the "Extensions" tab in VS Code

### Issue 4: Database connection issues

**Solutions:**

```bash
# Check if PostgreSQL is running
docker-compose ps

# Reset database
docker-compose down -v
docker-compose up -d postgres

# Check database logs
docker-compose logs postgres
```

### Issue 5: Port conflicts (3001, 5173, 5432 already in use)

**Solutions:**

```bash
# Find processes using the ports
lsof -i :3001
lsof -i :5173
lsof -i :5432

# Kill conflicting processes
sudo kill -9 <PID>

# Or stop local services
brew services stop postgresql  # If you have local PostgreSQL
```

### Issue 6: pnpm commands failing

**Solutions:**

```bash
# Clear pnpm cache
pnpm store prune

# Reinstall dependencies
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Issue 7: File changes not reflecting

**Solution:**

- The dev container now has volume mounts
- Changes should sync automatically
- If not, rebuild the container: `Cmd+Shift+P` → "Dev Containers: Rebuild Container"

## 🔧 Manual Setup (if Dev Container fails)

### 1. Start services manually:

```bash
# Start database only
docker-compose up -d postgres

# Install dependencies
pnpm install

# Setup database
pnpm --filter backend db:generate
pnpm --filter backend db:push
pnpm --filter backend db:seed

# Start development servers
pnpm dev
```

### 2. Access points:

- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Database: localhost:5432

## 🚀 Fresh Start Protocol

If nothing works, try this complete reset:

```bash
# 1. Stop everything
docker-compose down --rmi all -v
docker system prune -a

# 2. Close VS Code completely

# 3. Clear Node modules
rm -rf node_modules apps/*/node_modules
rm -f pnpm-lock.yaml

# 4. Restart Docker Desktop

# 5. Run setup script
./setup-devcontainer.sh

# 6. Open in VS Code and reopen in container
code .
```

## 📞 Getting Help

1. Check Docker Desktop dashboard for container logs
2. Open VS Code Developer Tools: `Help → Toggle Developer Tools`
3. Check the "Dev Containers" output channel in VS Code
4. Share error messages with the team

## 🎯 Success Indicators

✅ You should see:

- VS Code status bar shows "Dev Container: Flora Development Environment"
- Terminal prompt shows you're in `/app`
- Extensions like Prisma, ESLint are working
- `pnpm dev` starts both frontend and backend
- Database accessible via extensions
