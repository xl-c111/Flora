# 🌸 Flora - Flowers & Plants Marketplace

**Team:** Anthony, Bevan, Xiaoling, and Lily | **Timeline:** 5-6 weeks | **Holberton Final Project**

**Built with ❤️ and lots of learning** 🌸

_Flora - Where every purchase blooms into joy_

Flora is a modern flowers and plants marketplace featuring flexible purchasing options including one-time purchases and subscription services. Built with React + TypeScript, Node.js/Express, Prisma, PostgreSQL, and Docker.

## 🎯 Project Features

✅ **Product browsing** with search/filter \
✅ **Guest checkout** (no account required) \
✅ **User authentication** (Auth0) \
✅ **Subscription system** (recurring + spontaneous deliveries) \
✅ **Melbourne delivery** with flat-rate pricing \
✅ **Order processing** & email confirmations \
✅ **Automated testing** with CI/CD

---

## 🚀 Quick Start Guide

### 📥 **Step 1: Get the Code**
```bash
git clone https://github.com/Aldore-88/holbertonschool-final_project.git
cd holbertonschool-final_project
```

### 🐳 **Step 2: First-Time Setup (Docker - Recommended)**
```bash
# Build containers and setup database (first time only)
pnpm docker:dev:build    # Build containers with dependencies
pnpm docker:setup        # Setup database (migrations + seeding)
```

### 🎯 **Step 3: Daily Development**
```bash
# Start development (every day)
pnpm docker:dev:bg       # Start in background
```
#### Frontend check:

1. Check frontend logs: `docker logs flora-frontend` or `pnpm docker:logs frontend --tail 10`
2. Open http://localhost:5173
3. Check browser console for errors (F12)
4. Test user interactions (clicking, typing)

#### Backend check:

1. Check backend logs:
`docker logs flora-backend --tail 10` or `pnpm docker:logs backend --tail 5`
1. Check http://localhost:3001/api/health
3. Use browser or Postman to test API endpoints

```bash
# Test subscription system
docker exec flora-backend pnpm test:subscriptions

# Test delivery endpoints
curl http://localhost:3001/api/delivery/info
```

4. Check all logs together: `pnpm docker:logs --tail 5` (add --tail 10 => to see 10 most recent logs)

#### Database Testing:

1. Check data with Prisma Studio: `npx prisma studio`
2. Verify API responses return correct data

---

## 🔄 **When Do I Need to Rebuild vs Restart?**

### **📦 Package.json Changes (Added/Updated Dependencies)**
```bash
# Need full rebuild when you add/update dependencies
pnpm docker:dev:build    # Rebuild containers with new dependencies
pnpm docker:dev:bg       # Start with new dependencies
```

### **💻 Code Changes (TypeScript, React, CSS)**
```bash
# Just restart - hot reload handles code changes
pnpm docker:dev:bg       # Start containers (code changes auto-reload)
```

### **🗃️ Database Schema Changes (Prisma schema.prisma)**
```bash
# Backend restart + database update
pnpm docker:restart-backend    # Restart backend to reload Prisma
pnpm docker:setup             # Apply schema changes + reseed
```

### **🌱 Want Fresh Test Data Only**
```bash
# No restart needed - just reseed
docker exec flora-backend pnpm db:seed    # Fresh sample data
```

---

## 📋 **Essential Commands Reference**

### **🚀 Development Commands**
```bash
# First time setup
pnpm docker:dev:build         # Build containers
pnpm docker:setup             # Setup database

# Daily development
pnpm docker:dev:bg            # Start in background
pnpm docker:logs              # View logs
pnpm docker:stop              # Stop all containers

# Individual service restarts
pnpm docker:restart-backend   # Restart backend only
pnpm docker:restart-frontend  # Restart frontend only
```
**Troubleshooting Commands**

```bash
# Check what's running
docker ps                                    # Show running containers

# View logs
docker logs flora-backend                    # Backend logs only
docker logs flora-frontend                   # Frontend logs only
pnpm docker:logs                             # All logs together
```


```bash
# Database updated
pnpm docker:seed          # Re-seed database with fresh sample data
pnpm db:reset             # Reset database (WARNING: deletes all data!)

# 🔧 Maintenance & Debugging
pnpm docker:stop          # Stop all containers
pnpm docker:build         # Rebuild containers without starting them
pnpm docker:clean         # Remove containers and volumes (fresh start, keep images)
pnpm docker:clean-project # Full cleanup: remove containers, images, and volumes
pnpm docker:dev:build     # Full rebuild

# 🎯 Production
pnpm docker:prod          # Run production build
```

---

## 🧪 **Testing & Quality Assurance**

### **Local Testing Commands**

Always test inside Docker containers to match the CI environment:

```bash
# 🔍 Run All Tests
docker exec flora-backend pnpm test                 # All tests with coverage

# 🎯 Run Specific Test Suites
docker exec flora-backend pnpm test:auth            # Authentication & JWT tests
docker exec flora-backend pnpm test:order           # Order creation & processing tests
docker exec flora-backend pnpm test:payment         # Stripe payment & refund tests
docker exec flora-backend pnpm test:email           # Email service & templates tests
docker exec flora-backend pnpm test:integration     # Full end-to-end integration tests

# 🔄 Development Testing
docker exec flora-backend pnpm test:watch           # Auto-rerun tests on file changes
docker exec flora-backend pnpm test:coverage        # Generate detailed coverage reports

# 🛠️ Manual Testing Tools
docker exec flora-backend pnpm test:live-email      # Send real test emails
docker exec flora-backend pnpm get-token            # Get Auth0 JWT for API testing
```

### **Test Command Breakdown**

| Command | What It Does | When To Use |
|---------|--------------|-------------|
| `jest` | Runs all `.test.ts` files using Jest test runner | Standard test execution |
| `jest --watch` | Continuously runs tests when files change | Active development |
| `jest --coverage` | Generates HTML/text coverage reports | Quality checks before commits |
| `jest --testPathPatterns=auth` | Only runs tests with "auth" in the filename | Testing specific features |
| `tsx src/test/script.ts` | Runs TypeScript files directly | Utility scripts & manual testing |

### **Understanding Test Output**

```bash
# ✅ Success Example
PASS src/test/auth.test.ts (12.5s)
  ✓ should authenticate valid user (145ms)
  ✓ should reject invalid token (89ms)

# ❌ Failure Example
FAIL src/test/payment.test.ts
  ✗ should process payment (234ms)
    Error: Stripe API connection failed

# 📊 Coverage Summary
Coverage: 85.2% of statements
         83.1% of branches
         91.7% of functions
         85.2% of lines
```

---

## 🚀 **CI/CD Pipeline**

### **Automated Testing**

**Triggers:** Every push to any team branch + all pull requests to `main`

**Supported Branches:**
- `main` (production)
- `li-dev` (integration)
- `anth-branch`, `bevan-branch`, `xiaoling` (team member branches)

**Current CI Configuration (Simplified for Development):**

1. **🧪 Backend Tests** ✅ ACTIVE
   - All Jest test suites (64/64 passing)
   - Code coverage reporting
   - PostgreSQL database tests
   - Delivery endpoint validation

2. **🎨 Frontend Tests** ⏸️ DISABLED (Runs locally only)
   - Reason: CI environment setup issues
   - Local verification: `docker exec flora-frontend pnpm build`
   - Re-enable after graduation: See `.github/workflows/test.yml`

3. **🔍 Type Checking** ⏸️ DISABLED (Runs locally only)
   - Reason: Warnings allowed in development
   - Local verification: `docker exec flora-frontend pnpm type-check`
   - Re-enable after graduation: See `.github/workflows/test.yml`

> **Note for Team:** All tests pass locally! CI is simplified to backend tests only.
> Before pushing, always run the **Pre-Commit Checklist** below to ensure quality.

### **GitHub Actions Workflow Files**

```bash
.github/workflows/test.yml       # Main CI/CD testing pipeline
.github/workflows/security.yml   # Weekly security & dependency audits
```

### **CI/CD Best Practices We Follow**

- ✅ **Branch Protection:** All tests must pass before merging
- ✅ **Parallel Execution:** 3 concurrent jobs for fast feedback
- ✅ **Real Database:** PostgreSQL in CI matches production environment
- ✅ **Code Coverage:** Tracks test coverage trends over time
- ✅ **Security Scanning:** Automated dependency vulnerability checks
- ✅ **Type Safety:** Compilation errors fail the build

### **Monitoring CI/CD Status**

```bash
# 📊 Check GitHub Actions Status
# Go to: https://github.com/your-repo/actions

# 🔍 View CI Logs Locally
git push origin your-branch
# Then visit GitHub Actions tab to see real-time results
```

### **Before You Push - Pre-Commit Checklist** ✅

**Run these commands locally to ensure CI/CD will pass:**

```bash
# 1️⃣ Run all backend tests (must pass)
docker exec flora-backend pnpm test

# 2️⃣ Run frontend type-check (warnings OK, but script must exist)
docker exec flora-frontend pnpm type-check || echo "Type warnings are OK"

# 3️⃣ Build frontend to catch critical errors
docker exec flora-frontend pnpm build
```

**Quick verification:**
- ✅ All backend tests pass (80/80 tests)
- ✅ Frontend type-check runs (warnings allowed)
- ✅ Frontend builds successfully
- ✅ Docker containers running: `docker ps`

### **Troubleshooting Failed CI/CD**

**Common Issues & Solutions:**

| Error | Cause | Solution |
|-------|-------|----------|
| `Tests failed` | Broken functionality | Run `docker exec flora-backend pnpm test` locally |
| `Build failed` | TypeScript errors | Run `docker exec flora-backend pnpm build` locally |
| `Lint failed` | Code style issues | Run `docker exec flora-frontend pnpm lint --fix` |
| `type-check script not found` | Missing script in package.json | Rebuild: `pnpm docker:dev:build` |

**Development Workflow:**
1. 🔧 Make changes locally
2. 🧪 Run pre-push checklist (see above)
3. 📤 Push to your branch
4. 👀 Monitor GitHub Actions results
5. 🔄 Fix any failures and repeat

---

## 🛠️ **Tech Stack**

### **Frontend**
- ⚛️ **React 19** with TypeScript
- ⚡ **Vite** for fast development
- 🔐 **Auth0** for authentication
- 🎨 **Custom CSS** styling

### **Backend**
- 🟢 **Node.js + Express** with TypeScript
- 🗃️ **Prisma ORM** with PostgreSQL
- 🔐 **Auth0** JWT authentication
- 📧 **Email service** integration
- 💳 **Stripe** payment processing

### **Development**
- 📦 **pnpm** workspaces (monorepo)
- 🐳 **Docker** containerization
- 🧪 **Automated testing** with CI/CD
- 🇦🇺 **Melbourne delivery** system

---

## 📁 **Project Structure**

```
holbertonschool-final_project/
├── apps/
│   ├── frontend/              # React TypeScript app
│   │   ├── src/
│   │   │   ├── components/    # Reusable UI components
│   │   │   ├── pages/         # Page components
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   └── services/      # API communication
│   │   └── package.json
│   └── backend/               # Node.js Express API
│       ├── src/
│       │   ├── controllers/   # HTTP request handlers
│       │   ├── services/      # Business logic
│       │   ├── routes/        # API endpoints
│       │   ├── middleware/    # Auth, validation, etc.
│       │   └── config/        # Database, auth config
│       ├── prisma/
│       │   ├── schema.prisma  # Database schema
│       │   └── seed.ts        # Test data
│       └── package.json
├── docs/                      # Documentation
│   ├── TESTING_GUIDE.md       # Comprehensive testing guide
│   └── SUBSCRIPTIONS.md       # Subscription system docs
├── .github/workflows/         # CI/CD automation
└── docker-compose*.yml       # Docker configuration
```

---

## 🚨 **Common Issues & Solutions**

### **Problem: "Module not found" errors**
```bash
# Solution: Rebuild containers with fresh dependencies
pnpm docker:dev:build
```

### **Problem: Database connection errors**
```bash
# Solution: Restart backend and setup database
pnpm docker:restart-backend
pnpm docker:setup
```

### **Problem: Old data showing up**
```bash
# Solution: Refresh test data (no restart needed)
docker exec flora-backend pnpm db:seed
```

### **Problem: "No products found" in tests**
```bash
# Solution: Make sure database is seeded
docker exec flora-backend pnpm db:seed
```

### **Problem: Everything is broken**
```bash
# Nuclear option: Clean and rebuild everything
pnpm docker:clean-project
pnpm docker:dev:build
pnpm docker:setup
```

---

## 🎯 **Demo Day Ready Features**

- ✅ **Melbourne-focused delivery** (postcodes 3000, 3141, etc.)
- ✅ **AUD pricing** ($8.99 standard, $15.99 express)
- ✅ **Auth0 authentication** (email/password + Google login)
- ✅ **Subscription management** (pause, resume, cancel)
- ✅ **Automated testing** (6/6 tests passing)
- ✅ **Email confirmations** (order confirmations)
- ✅ **Real order integration** (subscriptions create actual orders)

---

## 👥 **Team**

Created by the Holberton team:
- **Anthony**
- **Bevan**
- **Xiaoling**
- **Lily**

## 📄 **License**

MIT License - feel free to use this project for learning and demonstration purposes.
