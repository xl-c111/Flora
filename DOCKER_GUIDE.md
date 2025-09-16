# 🐳 Docker Guide for Flora Marketplace

This guide covers everything you need to know about running the Flora Marketplace using Docker containers.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Docker Commands](#docker-commands)
- [Development Workflow](#development-workflow)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)
- [Useful Commands](#useful-commands)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone https://github.com/Aldore-88/holbertonschool-final_project.git
cd holbertonschool-final_project
```

### 2. Start Development Environment (EASY WAY! 🎉)

**Using pnpm scripts (Recommended)**

```bash
# First time or when Dockerfiles change
pnpm docker:first        # Build and start (first time)
pnpm docker:build        # Just build images

# Daily development
pnpm docker:dev          # Start (shows logs)
pnpm docker:dev:bg       # Start (background)
pnpm docker:dev:build    # Rebuild and start (when Dockerfiles change)

# Management
pnpm docker:stop         # Stop everything
pnpm docker:logs         # View logs
pnpm docker:clean        # Clean reset (nuclear option)
```

**Full Docker commands (in case you need)**

```bash
# Start all services (database, backend, frontend)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Or run in background (detached mode)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### 3. Access Your Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001
- **Database**: localhost:5432

### 4. Stop Services

```bash
# Easy way
pnpm docker:stop
# OR
docker-compose down
```

## 📋 Prerequisites

- **Docker Desktop**: Install from [docker.com](https://www.docker.com/products/docker-desktop/)
- **Docker Compose**: Included with Docker Desktop
- **Git**: For cloning the repository

### Verify Installation

```bash
docker --version
docker-compose --version
```

## 🏗️ Project Structure

```
holbertonschool-final_project/
├── docker-compose.yml           # Base Docker Compose configuration
├── docker-compose.dev.yml       # Development overrides
├── docker-compose.prod.yml      # Production configuration
├── apps/
│   ├── backend/
│   │   ├── Dockerfile           # Backend container definition
│   │   ├── src/                 # Backend source code
│   │   └── prisma/              # Database schema and migrations
│   └── frontend/
│       ├── Dockerfile           # Frontend container definition
│       └── src/                 # Frontend source code
└── DOCKER_GUIDE.md             # This guide
```

## 🐳 Docker Commands

### Basic Operations

#### Start Services

```bash
# Build and start (first time or when Dockerfile changes)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Development mode with hot reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Production mode
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up

# Start in background
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

#### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clears database data)
docker-compose down -v

# Force stop
docker-compose down --remove-orphans
```

#### View Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f

# Last 50 lines
docker-compose logs --tail=50
```

#### Container Management

```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Execute command in running container
docker exec -it flora-backend sh
docker exec -it flora-frontend sh
docker exec -it flora-postgres psql -U flora_user -d flora_db
```

## 💻 Development Workflow

### 1. First Time Setup

```bash
# Clone repository
git clone https://github.com/Aldore-88/holbertonschool-final_project
cd holbertonschool-final_project

# Start services
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Wait for database to be ready, then run migrations
docker exec -it flora-backend pnpm db:migrate

# Seed the database
docker exec -it flora-backend pnpm db:seed
```

### 2. Daily Development

```bash
# Start your development environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Your code changes will automatically reload thanks to volume mounts!
# Frontend: Hot reload with Vite
# Backend: Hot reload with tsx watch

# View logs if needed
docker-compose logs -f

# Stop when done
docker-compose down
```

### 3. Database Operations

```bash
# Run database migrations
docker exec -it flora-backend pnpm db:migrate

# Reset database (careful - deletes all data!)
docker exec -it flora-backend pnpm db:reset

# Seed database with sample data
docker exec -it flora-backend pnpm db:seed

# Access database directly
docker exec -it flora-postgres psql -U flora_user -d flora_db
```

### 4. Package Management

```bash
# Install new backend package
docker exec -it flora-backend pnpm add <package-name>

# Install new frontend package
docker exec -it flora-frontend pnpm add <package-name>

# Install dev dependencies
docker exec -it flora-backend pnpm add -D <package-name>
```

## 🚀 Production Deployment

### Build for Production

```bash
# Build production images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Start production environment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Environment Variables

Create a `.env` file for production:

```env
NODE_ENV=production
DATABASE_URL=postgresql://flora_user:flora_password@postgres:5432/flora_db
VITE_API_URL=http://your-domain.com/api
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Check what's using the port
lsof -i :3001  # or :5173, :5432

# Kill process using port
kill -9 <PID>

# Or use different ports in docker-compose.yml
```

#### 2. Database Connection Issues

```bash
# Check if postgres container is running
docker ps | grep postgres

# Check postgres logs
docker logs flora-postgres

# Reset database
docker-compose down -v
docker-compose up -d postgres
# Wait for postgres to be ready
docker exec -it flora-backend pnpm db:migrate
```

#### 3. Node Modules Issues

```bash
# Clear node_modules and reinstall
docker-compose down
docker-compose build --no-cache
docker-compose up
```

#### 4. Prisma Issues

```bash
# Regenerate Prisma client
docker exec -it flora-backend pnpm prisma generate

# Push schema changes
docker exec -it flora-backend pnpm db:push
```

#### 5. Frontend Not Loading

```bash
# Check if frontend container is running
docker logs flora-frontend

# Verify API connection
curl http://localhost:3001/api/products

# Check network connectivity between containers
docker exec -it flora-frontend ping backend
```

### Clean Reset

If everything is broken, start fresh:

```bash
# Stop everything
docker-compose down -v

# Remove all images
docker system prune -a

# Rebuild everything
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

## 📚 Useful Commands

### Docker System Management

```bash
# View disk usage
docker system df

# Clean up unused containers, networks, images
docker system prune

# Clean up everything (careful!)
docker system prune -a --volumes

# View all images
docker images

# Remove specific image
docker rmi <image-name>
```

### Development Helpers

```bash
# View environment variables in container
docker exec -it flora-backend env

# Copy files from container
docker cp flora-backend:/app/package.json ./

# Copy files to container
docker cp ./file.txt flora-backend:/app/

# Monitor container resource usage
docker stats
```

### Database Helpers

```bash
# Backup database
docker exec flora-postgres pg_dump -U flora_user flora_db > backup.sql

# Restore database
docker exec -i flora-postgres psql -U flora_user -d flora_db < backup.sql

# Connect to database with GUI tool
# Host: localhost, Port: 5432, User: flora_user, Password: flora_password
```

## 🎯 Quick Reference

### Service URLs

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **Database**: localhost:5432

### Container Names

- **Frontend**: `flora-frontend`
- **Backend**: `flora-backend`
- **Database**: `flora-postgres`

### Key Directories

- **Backend Code**: `./apps/backend` (mounted to `/app/apps/backend`)
- **Frontend Code**: `./apps/frontend` (mounted to `/app/apps/frontend`)
- **Database Data**: `postgres_data` volume

### Common Workflows

```bash
# Start development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f

# Run backend commands
docker exec -it flora-backend pnpm <command>

# Stop everything
docker-compose down
```

## 👥 Team Collaboration

### Onboarding New Developers

1. Install Docker Desktop
2. Clone the repository
3. Run: `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up`
4. Access http://localhost:5173

### Sharing Changes

- Code changes are automatically reflected (volume mounts)
- Dockerfile changes require `--build` flag
- Database schema changes need migration: `docker exec -it flora-backend pnpm db:migrate`

---

## 🆘 Need Help?

- **Docker Issues**: Check [Docker Documentation](https://docs.docker.com/)
- **Application Issues**: Check container logs with `docker-compose logs`
- **Database Issues**: Access postgres directly with `docker exec -it flora-postgres psql -U flora_user -d flora_db`

---

**Happy Coding! 🌸**
