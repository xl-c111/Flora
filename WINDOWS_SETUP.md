# 🪟 Windows Development Setup

**For Windows team members who want a fully containerized development environment**

This setup runs everything in Docker containers, avoiding Node.js/pnpm installation issues on Windows while still providing VS Code IntelliSense support.

## 🚀 Quick Start for Windows

### Prerequisites
- **Docker Desktop for Windows** (with WSL2 backend recommended)
- **VS Code** with Docker extension
- **Git for Windows** or **WSL2**

### Setup Steps

1. **Clone the repository:**
```bash
git clone https://github.com/Aldore-88/holbertonschool-final_project.git
cd holbertonschool-final_project
```

2. **Start everything in background:**
```bash
./dev-windows.sh bg
```

3. **Check if everything is working:**
```bash
./dev-windows.sh status
```

4. **Access the applications:**
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **API Health Check:** http://localhost:3001/api/health

## 🛠️ Available Commands

```bash
./dev-windows.sh bg          # Start in background (recommended)
./dev-windows.sh start       # Start with logs (foreground)
./dev-windows.sh stop        # Stop all services
./dev-windows.sh restart     # Restart everything
./dev-windows.sh logs        # View live logs
./dev-windows.sh status      # Check service health
./dev-windows.sh db-setup    # Setup database (if needed)
./dev-windows.sh help        # Show all commands
```

## 💡 How This Works

### Volume Sync Magic
```yaml
# Your code is mounted for editing
- ./apps/frontend:/app/apps/frontend
- ./apps/backend:/app/apps/backend

# node_modules are synced for VS Code IntelliSense
- frontend_node_modules:/app/apps/frontend/node_modules
- backend_node_modules:/app/apps/backend/node_modules
```

### What Happens When You Start
1. **Containers build** with Node.js 18 environment
2. **Dependencies install** automatically (`pnpm install`)
3. **Services start** with hot reload enabled
4. **node_modules sync** to your Windows filesystem
5. **VS Code can see** dependencies for IntelliSense

## ✅ Benefits for Windows Users

- **No Node.js installation** required on Windows
- **No pnpm setup** or version conflicts
- **No Windows path issues** (everything runs in Linux containers)
- **Same environment** as Mac/Linux teammates
- **VS Code IntelliSense** works perfectly
- **Hot reload** for development
- **Easy debugging** with container support

## 🔧 VS Code Setup

### Recommended Extensions
1. **Docker** - Manage containers from VS Code
2. **Prisma** - Database schema support
3. **ES7+ React/Redux/React-Native snippets** - React development
4. **TypeScript Importer** - Auto import management
5. **Prettier** - Code formatting
6. **ESLint** - Code linting

### IntelliSense Setup
After starting containers, VS Code should automatically detect the synced `node_modules` and provide full TypeScript support. If not:

1. Open Command Palette (`Ctrl+Shift+P`)
2. Run `TypeScript: Restart TS Server`
3. Open any `.ts` or `.tsx` file to verify IntelliSense works

## 🐛 Troubleshooting

### Services Won't Start
```bash
# Check Docker is running
docker --version

# Check for port conflicts
./dev-windows.sh stop
./dev-windows.sh bg
```

### VS Code Can't Find Types
```bash
# Restart TypeScript server in VS Code
Ctrl+Shift+P -> "TypeScript: Restart TS Server"

# Or restart containers to refresh sync
./dev-windows.sh restart
```

### Slow Performance
- **Enable WSL2** in Docker Desktop settings
- **Move project to WSL2** filesystem for better performance:
  ```bash
  # In WSL2 terminal
  cd /home/yourusername
  git clone https://github.com/Aldore-88/holbertonschool-final_project.git
  ```

### Database Issues
```bash
# Reset and setup database
./dev-windows.sh stop
./dev-windows.sh bg
./dev-windows.sh db-setup
```

## 🆚 Windows vs Mac Workflows

| Task | Mac (Hybrid) | Windows (Full Docker) |
|------|-------------|----------------------|
| **Start Development** | `./dev.sh start` | `./dev-windows.sh bg` |
| **Install Dependencies** | `pnpm install` | *Automatic in containers* |
| **Database Setup** | `./dev.sh db-seed` | `./dev-windows.sh db-setup` |
| **View Logs** | `./dev.sh logs` | `./dev-windows.sh logs` |
| **Stop Services** | `./dev.sh stop` | `./dev-windows.sh stop` |

## 🤝 Team Collaboration

### Same Database, Different Approaches
- **Mac users** run `./dev.sh start` (hybrid approach)
- **Windows users** run `./dev-windows.sh bg` (full Docker)
- **Both connect** to the same database schema
- **All APIs work** identically between approaches

### Code Sharing
- **Git workflow** is identical for everyone
- **File editing** works the same in VS Code
- **TypeScript/React** development is consistent
- **No platform-specific code** needed

## 📞 Getting Help

If you run into issues:

1. **Check service status:** `./dev-windows.sh status`
2. **View logs:** `./dev-windows.sh logs`
3. **Ask the team** - Mac users can help troubleshoot API issues
4. **Restart everything:** `./dev-windows.sh restart`

## 🎯 Success Checklist

After setup, you should have:
- ✅ Frontend loading at http://localhost:5173
- ✅ Backend API responding at http://localhost:3001/api/health
- ✅ VS Code showing TypeScript IntelliSense
- ✅ Hot reload working (save file → browser refreshes)
- ✅ Database seeded with sample products

**Happy coding! 🌸**
