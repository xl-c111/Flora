# 🌸 Flora Team Setup Guide

**THE ONLY SETUP GUIDE YOU NEED**

Welcome to the Flora marketplace project! This guide will get you up and running in 5 minutes.

## ✅ Prerequisites (Install These First)

1. **Install Docker Desktop**

   - Download: https://www.docker.com/products/docker-desktop
   - **IMPORTANT:** Start Docker Desktop after installation (check system tray/menu bar)

2. **Install Git**

   - Download: https://git-scm.com/downloads

3. **Install VS Code** (recommended)
   - Download: https://code.visualstudio.com/

## 🚀 NEW PERSON SETUP (Do This Once)

1. **Clone the repository**

   ```bash
   git clone https://github.com/Aldore-88/holbertonschool-final_project.git
   cd holbertonschool-final_project
   ```

2. **ONE COMMAND SETUP** 🎯

   ```bash
   ./dev.sh setup
   ```

   This automatically:

   - ✅ Creates your environment files
   - ✅ Builds all Docker containers
   - ✅ Sets up the database
   - ✅ Adds sample data

3. **Start working**

   ```bash
   ./dev.sh start
   ```

4. **Open your browser**
   - **Frontend:** http://localhost:5173 (the Flora website)
   - **Backend API:** http://localhost:3001 (for testing)

## ✅ Test Your Setup

After running `./dev.sh setup`, check these work:

1. **Frontend:** http://localhost:5173

   - Should show Flora homepage (even if empty)

2. **Backend API:** http://localhost:3001

   - Should show welcome message with API info

3. **Check status:**
   ```bash
   ./dev.sh status
   ```
   - All services should show ✓ Running

**If something doesn't work:** Run `./dev.sh logs` to see what's wrong.

## 🛠️ Daily Development Commands

| Command            | Description                   |
| ------------------ | ----------------------------- |
| `./dev.sh start`   | Start all services            |
| `./dev.sh stop`    | Stop all services             |
| `./dev.sh status`  | Check if services are running |
| `./dev.sh logs`    | View logs from all services   |
| `./dev.sh restart` | Restart all services          |

## 🔧 Advanced Commands

| Command             | Description                                  |
| ------------------- | -------------------------------------------- |
| `./dev.sh rebuild`  | Rebuild containers after adding dependencies |
| `./dev.sh db-seed`  | Add sample data to database                  |
| `./dev.sh db-reset` | Reset database (⚠️ destroys all data)        |
| `./dev.sh clean`    | Clean up all containers and data             |

## 🐛 Troubleshooting

### "Docker not running"

- Make sure Docker Desktop is started
- Check Docker icon in system tray/menu bar

### "Port already in use"

- Stop other services using ports 3001, 5173, or 5432
- Or use `./dev.sh stop` then `./dev.sh start`

### "Database connection error"

- Run `./dev.sh restart` to restart all services
- Check `./dev.sh status` to verify database is healthy

### "New dependencies not working"

- Run `./dev.sh rebuild` after adding packages to package.json

## 📝 Environment Variables

Your `.env` files are created automatically from templates. Update them if needed:

- `apps/backend/.env` - Backend configuration
- `apps/frontend/.env` - Frontend configuration

## 🎯 Project Structure

```
apps/
├── backend/     # Express.js API (port 3001)
└── frontend/    # React app (port 5173)
```

## 🤝 Team Workflow

1. **Always pull latest changes** before starting work
2. **Run `./dev.sh start`** to begin development
3. **Check `./dev.sh status`** if something isn't working
4. **Use `./dev.sh logs`** to debug issues

## 📚 Documentation

- [Team Workflow](TEAM_WORKFLOW.md) - Sprint planning and assignments
- [Supabase Setup](docs/SUPABASE_SETUP.md) - Authentication setup

Happy coding! 🌸
