# 🐳 Docker Quick Guide for Flora

**Simple guide to get Flora running with Docker - no confusion!**

## � Important Warnings

**DANGEROUS commands that affect your ENTIRE system:**
```bash
# ⚠️  NEVER USE THESE - They delete ALL Docker stuff on your computer:
# docker system prune
# docker system prune -a
# docker system prune -f
```

**SAFE commands for this project only:**
```bash
pnpm docker:clean        # ✅ Safe - only this project's containers
pnpm docker:clean-project # ✅ Safe - only this project's images
```

## 🚀 Quick Start

### 1. Setup

```bash
git clone https://github.com/Aldore-88/holbertonschool-final_project.git
cd holbertonschool-final_project
```

### 2. Run Flora

**First Time Setup:**
```bash
# Build images and start (first time ever)
pnpm docker:dev:build
```

**Daily Development (images already exist):**
```bash
# Start everything (see logs)
pnpm docker:dev

# OR start in background (free terminal)
pnpm docker:dev:bg

# Stop everything (keeps images)
pnpm docker:stop
```

**When You Need Fresh Start:**
```bash
# Remove ONLY this project's containers and rebuild
pnpm docker:clean-project
pnpm docker:dev:build

# ⚠️  DANGER: Removes ALL Docker images on your computer
# docker system prune -f  # DON'T USE THIS!
```

### 3. Access Your App

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **Database**: localhost:5432

## 🗄️ Database Commands

```bash
# Set up database first time
docker exec -it flora-backend pnpm db:migrate

# Add sample data
docker exec -it flora-backend pnpm db:seed

# Reset database (deletes everything!)
docker exec -it flora-backend pnpm db:reset

# Connect to database directly
docker exec -it flora-postgres psql -U flora_user -d flora_db
```

## 📦 Add Packages

```bash
# Backend packages
docker exec -it flora-backend pnpm add <package-name>

# Frontend packages
docker exec -it flora-frontend pnpm add <package-name>
```

## 🔧 When Things Break

### Containers won't start

```bash
# Stop everything and start fresh
pnpm docker:stop
pnpm docker:dev
```

### Database issues

```bash
# Reset database completely
docker-compose down -v
pnpm docker:dev:bg
docker exec -it flora-backend pnpm db:migrate
docker exec -it flora-backend pnpm db:seed
```

### Still broken?

```bash
# Nuclear option - rebuild everything
docker-compose down -v
docker system prune -f
pnpm docker:dev:build
```

## 📋 Quick Reference

### Your Commands

```bash
### Your Commands
```bash
# First time setup
pnpm docker:dev:build    # Build and start

# Daily development
pnpm docker:dev          # Start (shows logs)
pnpm docker:dev:bg       # Start (background)

# Management
pnpm docker:stop         # Stop (keeps images)
pnpm docker:logs         # View logs
pnpm docker:clean        # Remove containers & volumes
pnpm docker:fresh        # Nuclear option (remove everything & rebuild)
```
```

### Container Names

- Frontend: `flora-frontend`
- Backend: `flora-backend`
- Database: `flora-postgres`

### View Logs

```bash
# All logs
pnpm docker:logs

# Specific container
docker logs flora-backend
docker logs flora-frontend
```

## 🆘 Need Help?

1. **Can't access frontend?** Check http://localhost:5173
2. **API not working?** Check http://localhost:3001/api/products
3. **Database problems?** Run the database reset commands above
4. **Still stuck?** Check `pnpm docker:logs` for errors

---

**Happy coding! 🌸**
