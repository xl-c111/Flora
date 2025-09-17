# Flora Development Environment - VS Code Dev Containers

## 🚀 Quick Start for Team Members

### Prerequisites
- **VS Code** with the **Dev Containers extension** installed
- **Docker Desktop** running on your machine
- **Git** for cloning the repository

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Aldore-88/holbertonschool-final_project.git
   cd holbertonschool-final_project
   ```

2. **Open in VS Code:**
   ```bash
   code .
   ```

3. **Start Dev Container:**
   - VS Code will detect the `.devcontainer` configuration
   - Click "Reopen in Container" when prompted
   - OR press `Cmd+Shift+P` → "Dev Containers: Reopen in Container"

4. **Wait for automatic setup:**
   - Container builds (first time only)
   - Dependencies install automatically
   - Database starts and seeds with sample data

5. **Start development:**
   ```bash
   # Already in the container terminal
   pnpm dev
   ```

## 🎯 What You Get

### ✅ Automatic Setup
- ✅ Node.js 20 with pnpm
- ✅ All dependencies installed
- ✅ PostgreSQL database running
- ✅ TypeScript configured
- ✅ VS Code extensions for the project

### 🌐 Access Points
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Database:** localhost:5432 (from VS Code extensions)

### 🔧 Development Tools
- **TypeScript:** Full IntelliSense and error checking
- **Prisma:** Database schema management and client
- **ESLint:** Code quality and consistency
- **Prettier:** Automatic code formatting
- **Thunder Client:** API testing (REST client)

## 🛠️ Common Development Tasks

### Database Operations
```bash
# Generate Prisma client (after schema changes)
pnpm prisma:generate

# Run database migrations
pnpm prisma:migrate

# Seed database with sample data
pnpm prisma:seed

# Open Prisma Studio (database GUI)
pnpm prisma:studio
```

### Testing API Endpoints
- Use **Thunder Client** extension in VS Code
- Or test in browser: http://localhost:3001/api/products

### Package Management
```bash
# Install new dependencies
pnpm add <package-name>

# Install dev dependencies
pnpm add -D <package-name>

# Update all dependencies
pnpm update
```

## 🔍 Troubleshooting

### Container Issues
```bash
# Rebuild container completely
Cmd+Shift+P → "Dev Containers: Rebuild Container"

# View container logs
Docker Desktop → Containers → holbertonschool-final_project
```

### Database Issues
```bash
# Reset database completely
pnpm prisma:reset

# Check database connection
pnpm prisma:studio
```

### Port Conflicts
- Ensure ports 3001, 5173, and 5432 are free
- Stop other local services if needed

## 📝 Development Workflow

1. **Pull latest changes:** `git pull origin main`
2. **Create feature branch:** `git checkout -b feature/your-feature`
3. **Start development:** `pnpm dev`
4. **Make changes and test**
5. **Commit and push:** Standard Git workflow
6. **Create Pull Request**

## 🎯 Benefits for Our Team

### ✅ Consistency
- Same Node.js version for everyone
- Same dependencies and versions
- Same database schema and data
- Same VS Code configuration

### ✅ Zero Local Setup
- No need to install Node.js locally
- No PostgreSQL installation required
- No version conflicts between projects

### ✅ Instant Onboarding
- New team members productive in minutes
- No "it works on my machine" issues
- Consistent development experience

---

**Need help?** Ask in the team chat or check Docker Desktop logs.