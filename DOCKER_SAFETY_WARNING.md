# 🚨 CRITICAL DOCKER SAFETY WARNING 🚨

**READ THIS BEFORE USING DOCKER COMMANDS**

## ❌ NEVER RUN THESE COMMANDS MANUALLY:

```bash
# 💀 THESE WILL DELETE ALL YOUR DOCKER PROJECTS:
docker system prune          # Deletes ALL unused containers, networks, images
docker system prune -a       # Deletes ALL containers, networks, images
docker system prune --volumes # Deletes ALL data including databases
docker volume prune          # Deletes ALL volume data
docker image prune -a        # Deletes ALL images

# 🔥 THESE ARE ALSO DANGEROUS:
docker rm $(docker ps -aq)   # Removes ALL containers
docker rmi $(docker images -q) # Removes ALL images
```

## 😱 What Happened to Our Teammate:

One of our team members accidentally ran `docker system prune` thinking it would only clean Flora project files. **IT DELETED ALL THEIR SCHOOL DOCKER PROJECTS!** They lost hours of work and had to rebuild everything from scratch.

## ✅ SAFE COMMANDS TO USE:

### For Flora Project:

```bash
./dev.sh clean        # ✅ SAFE: Only removes Flora containers/volumes
./dev.sh start         # ✅ SAFE: Start Flora development
./dev.sh stop          # ✅ SAFE: Stop Flora containers
./dev.sh restart       # ✅ SAFE: Restart Flora if stuck
./dev.sh status        # ✅ SAFE: Check what's running
./dev.sh logs          # ✅ SAFE: Debug Flora issues
```

### If You Need System-Wide Cleanup:

```bash
./dev.sh deep-clean    # ⚠️  EXTREME CAUTION: Has multiple safety warnings
```

## 🛡️ Safety Rules:

1. **NEVER copy/paste Docker commands from Google** without understanding them
2. **ALWAYS use `./dev.sh` commands** instead of raw Docker commands
3. **Ask teammates before running unfamiliar commands**
4. **Read all warnings carefully** - they're there for a reason!
5. **When in doubt, use `./dev.sh help`** to see safe options

## 🆘 If You Accidentally Deleted Everything:

Don't panic! Here's how to recover:

1. **For School Projects:**

   ```bash
   # Re-clone your repositories
   git clone [your-school-project-repo]

   # Rebuild Docker containers (will take time to download)
   # Follow the original setup instructions for each project
   ```

2. **For Flora Project:**
   ```bash
   ./dev.sh setup        # This will rebuild everything
   ```

## 💡 Pro Tips:

- **Before cleaning:** Always run `docker ps -a` to see what containers exist
- **Check images:** Run `docker images` to see what you have
- **List volumes:** Run `docker volume ls` to see data volumes
- **When stuck:** Use `./dev.sh status` to diagnose Flora issues

## 🎯 Remember:

> **"With great Docker power comes great responsibility"**
>
> Always think twice before running cleanup commands!

---

**Team Flora Development Guide**
_Protecting your Docker environment since 2025_ 🌸
