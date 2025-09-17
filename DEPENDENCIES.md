# Flora Project Dependencies

## 📁 Where to Find All Dependencies

Your friend can check these files to see all project dependencies:

### **Main Dependency Files:**

1. **`package.json`** (root) - Main project & scripts
2. **`apps/backend/package.json`** - Backend API dependencies
3. **`apps/frontend/package.json`** - Frontend React app dependencies
4. **`pnpm-lock.yaml`** - Lock file with exact versions (like package-lock.json)
5. **`pnpm-workspace.yaml`** - Workspace configuration

---

## 🔧 **Root Project** (`package.json`)

### Runtime Dependencies:

- **None** (just orchestrates the workspace)

### Development Dependencies:

- `concurrently: ^8.2.2` - Run multiple commands simultaneously

### System Requirements:

- `Node.js: >=18.0.0`
- `pnpm: >=8.0.0`

---

## 🔙 **Backend Dependencies** (`apps/backend/package.json`)

### Runtime Dependencies:

```json
"@prisma/client": "^5.7.0",    // Database ORM client
"express": "^4.18.2",          // Web framework
"cors": "^2.8.5",              // Cross-origin requests
"dotenv": "^16.3.1"            // Environment variables
```

### Development Dependencies:

```json
"@types/express": "^4.17.21",  // TypeScript types for Express
"@types/cors": "^2.8.17",      // TypeScript types for CORS
"@types/node": "^20.10.0",     // TypeScript types for Node.js
"prisma": "^5.7.0",            // Database toolkit
"tsx": "^4.6.0",               // TypeScript execution
"typescript": "^5.3.0"         // TypeScript compiler
```

---

## 🎨 **Frontend Dependencies** (`apps/frontend/package.json`)

### Runtime Dependencies:

```json
"react": "^19.1.1",            // React framework
"react-dom": "^19.1.1",        // React DOM rendering
"axios": "^1.6.2",             // HTTP client
"react-router-dom": "^6.21.0"  // React routing
```

### Development Dependencies:

```json
"@eslint/js": "^9.33.0",                    // ESLint core
"@types/react": "^19.1.10",                 // React TypeScript types
"@types/react-dom": "^19.1.7",              // React DOM TypeScript types
"@vitejs/plugin-react": "^5.0.0",           // Vite React plugin
"eslint": "^9.33.0",                        // Code linting
"eslint-plugin-react-hooks": "^5.2.0",      // React hooks linting
"eslint-plugin-react-refresh": "^0.4.20",   // React fast refresh
"globals": "^16.3.0",                       // Global variables
"typescript": "~5.8.3",                     // TypeScript compiler
"typescript-eslint": "^8.39.1",             // TypeScript ESLint
"vite": "^7.1.2"                            // Build tool
```

---

## 🐳 **Docker Dependencies**

### System Requirements:

- **Docker Desktop** (includes Docker Engine + Docker Compose)
- **No local Node.js/npm/pnpm installation needed** (runs in container)

### Container Images:

- `node:20-alpine` - Base Node.js image
- `postgres:15` - PostgreSQL database

---

## 📦 **Package Manager Setup**

This project uses **pnpm** (performant npm) with workspaces:

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
```

### **Why pnpm?**

- Faster than npm/yarn
- Saves disk space (shared dependencies)
- Better monorepo support
- Strict dependency resolution

---

## 🚀 **Quick Team Setup Commands**

### For teammates using Docker (Recommended):

```bash
# 1. Clone the repo
git clone https://github.com/Aldore-88/holbertonschool-final_project.git
cd holbertonschool-final_project

# 2. Run setup script
./setup-devcontainer.sh

# 3. Open in VS Code Dev Container
code .
# Click "Reopen in Container"
```

### For teammates using local setup:

```bash
# 1. Install pnpm globally
npm install -g pnpm

# 2. Install all dependencies
pnpm install

# 3. Setup database (requires Docker for PostgreSQL)
docker-compose up -d postgres
pnpm --filter backend db:setup

# 4. Start development
pnpm dev
```

---

## 🎯 **What Your Team Gets**

### ✅ Consistent Environment:

- Same Node.js version (20)
- Same package versions (locked in pnpm-lock.yaml)
- Same database schema (PostgreSQL 15)
- Same development tools (TypeScript, ESLint, Prisma)

### ✅ Zero Local Setup (with Docker):

- No Node.js installation needed
- No PostgreSQL installation needed
- No version conflicts between projects
- Instant onboarding for new team members

### 🌐 **Access Points:**

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Database:** localhost:5432
- **Prisma Studio:** http://localhost:5555

---

## 📋 **For Your Friend to Review**

Tell your friend to check these specific files:

1. **`package.json`** (root) - Main project info
2. **`apps/backend/package.json`** - Backend API stack
3. **`apps/frontend/package.json`** - Frontend React stack
4. **`docker-compose.yml`** - Production setup
5. **`docker-compose.dev.yml`** - Development setup
6. **`.devcontainer/devcontainer.json`** - VS Code container config

**Total Dependencies:** ~40 packages (including dev dependencies)
**Main Tech Stack:** React + TypeScript + Express + PostgreSQL + Prisma
