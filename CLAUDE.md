# Flora - Flowers & Plants Marketplace

**Team:** Anthony, Bevan, Xiaoling, and Lily | **Timeline:** 5-6 weeks | **Holberton Final Project**

Flora is a modern flowers and plants marketplace featuring flexible purchasing options including one-time purchases and subscription services. Built with React + TypeScript, Node.js/Express, Prisma, PostgreSQL, and Docker.

## Project Structure

This is a **monorepo** using **pnpm workspaces**:

```
holbertonschool-final_project/
├── apps/
│   ├── frontend/          # React + TypeScript + Vite
│   └── backend/           # Node.js + Express + TypeScript + Prisma
├── docker-compose*.yml    # Docker configurations
├── package.json           # Root workspace config
└── pnpm-workspace.yaml    # pnpm workspace config
```

## Tech Stack

### Frontend (`apps/frontend/`)
- **React 19** with TypeScript
- **Vite** for fast development and building
- **Auth0** for authentication
- Custom CSS styling
- Key features: Product browsing, search/filter, checkout, subscriptions

### Backend (`apps/backend/`)
- **Node.js + Express** with TypeScript
- **Prisma ORM** with PostgreSQL
- **Auth0** for authentication
- RESTful API with comprehensive endpoints
- Email service integration
- Payment processing (Stripe planned)

## Development Commands

### Docker Development (Recommended)
```bash
# Initial setup
pnpm docker:dev:build     # Build containers
pnpm docker:setup         # Setup database (migrations + seeding)

# Daily development
pnpm docker:dev:bg        # Run in background
pnpm docker:logs          # View logs

# Database operations
pnpm docker:seed          # Refresh sample data
pnpm docker:restart-backend  # Restart after schema changes
```

### Local Development
```bash
pnpm dev                  # Start both frontend + backend locally
pnpm build               # Build both apps
pnpm db:setup            # Setup database
pnpm db:seed             # Seed with sample data
```

## Key Features

### Implemented ✅
- Product browsing with search/filter
- Product detail modals
- Guest checkout (one-time purchases)
- User authentication (Auth0)
- Subscription system (recurring deliveries)
- Order processing & email confirmations
- **Simple delivery system with flat-rate pricing** (Melbourne coverage)

### Planned 📋
- Order tracking & status updates
- Product bundles & gift options
- Advanced UI/UX polish
- Enhanced email templates

### Delivery System Status ✅

**Current Implementation: Simple & Production-Ready**
- **Flat-rate pricing**: $8.99 AUD standard, $15.99 AUD express delivery
- **Coverage area**: Melbourne metro area (100+ postcodes supported)
- **Integration**: Fully integrated with orders and subscriptions
- **API endpoints**: `/api/delivery/info` and `/api/delivery/validate/:postcode`

**Architecture Decision**:
The team chose a simple flat-rate delivery system over complex zone-based pricing to meet project timeline while maintaining professional quality. This approach provides:
- Predictable costs for customers
- Simple integration with payment processing
- Easy maintenance and testing
- Professional demo experience

**Future Enhancement Capability**:
Database schema includes delivery zone tables for future zone-based pricing if needed, but current simple system is production-ready and sufficient for graduation project scope.

## Database Schema

Key entities managed by Prisma:
- **Users**: Customer accounts and authentication
- **Products**: Flowers, plants, and bundles
- **Orders**: Purchase transactions with delivery fees
- **Subscriptions**: Recurring delivery schedules
- **Delivery System**: Zone tables available for future enhancement (currently using simple config)

## Current Development Status

- **Branch**: li-dev (current working branch)
- **Main Branch**: main (for PRs)
- **Auth**: ✅ **Auth0 fully configured and working**
  - Audience configuration fixed (`https://flora-api.com`)
  - JWT validation working for protected routes
  - Frontend/backend token flow verified
- **Payment**: Basic structure in place, Stripe integration pending

## Environment Setup

```bash
# Backend (.env)
DATABASE_URL="postgresql://flora_user:YOUR_DB_PASSWORD@localhost:5432/flora_db"  # ⚠️ NEVER COMMIT PASSWORD
AUTH0_DOMAIN="dev-ijvur34mojpovh8e.us.auth0.com"  # ✅ Safe to document
AUTH0_CLIENT_ID="tegmEuc40IvXfYFDLIRnJmbsa1izkTVL"  # ✅ Safe to document (public)
AUTH0_CLIENT_SECRET="YOUR_CLIENT_SECRET"  # ⚠️ NEVER COMMIT THIS SECRET
AUTH0_AUDIENCE="https://flora-api.com"  # ⚠️ CRITICAL: Must match frontend
STRIPE_SECRET_KEY="YOUR_STRIPE_SECRET"  # ⚠️ NEVER COMMIT THIS SECRET

# Frontend (.env)
VITE_API_URL="http://localhost:3001/api"
VITE_AUTH0_DOMAIN="dev-ijvur34mojpovh8e.us.auth0.com"  # ✅ Safe to document
VITE_AUTH0_CLIENT_ID="tegmEuc40IvXfYFDLIRnJmbsa1izkTVL"  # ✅ Safe to document (public)
VITE_AUTH0_AUDIENCE="https://flora-api.com"  # ⚠️ CRITICAL: Must match backend
```

### Auth0 Dashboard Configuration
- **API Identifier**: `https://flora-api.com`
- **Signing Algorithm**: RS256
- **Allow Offline Access**: Enabled (for refresh tokens)

## Testing

### Frontend Testing
- **Frontend**: http://localhost:5173
- **Subscriptions Page**: http://localhost:5173/subscriptions (requires login)
- **Database**: Use `npx prisma studio` for GUI

### Backend API Testing

**Public Endpoints (No Auth Required):**
```bash
# API Documentation & Health
curl http://localhost:3001/
curl http://localhost:3001/api/health

# Public test routes
curl http://localhost:3001/api/auth-test/public
curl http://localhost:3001/api/auth-test/optional
```

**Protected Endpoints (Require JWT Token):**
```bash
# Get fresh token: Login at frontend → Check browser console → Copy token

# Auth test routes
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/auth-test/protected
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/auth-test/verify-token

# Business endpoints
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/subscriptions
```

**Expected Responses:**
- **Protected routes with valid token**: `{"success": true, "data": [...]}`
- **Protected routes without token**: `{"error": "Missing or invalid authorization header"}`
- **Protected routes with expired token**: `{"error": "Invalid token"}`

## Architecture Patterns

- **Frontend**: Component-based with React hooks, Context API for state
- **Backend**: MVC pattern with controllers, services, and middleware
- **Database**: Prisma schema-first approach with migrations
- **Authentication**: JWT tokens via Auth0

## Testing & CI/CD

### **Local Testing Commands**

Run tests inside Docker containers for consistency:

```bash
# Run all tests with coverage
docker exec flora-backend pnpm test

# Run specific test suites
docker exec flora-backend pnpm test:auth        # Authentication tests
docker exec flora-backend pnpm test:order       # Order processing tests
docker exec flora-backend pnpm test:payment     # Payment & Stripe tests
docker exec flora-backend pnpm test:email       # Email service tests
docker exec flora-backend pnpm test:integration # Full integration tests

# Development testing commands
docker exec flora-backend pnpm test:watch       # Watch mode for development
docker exec flora-backend pnpm test:coverage    # Generate coverage reports

# Manual testing tools
docker exec flora-backend pnpm test:live-email  # Test real email sending
docker exec flora-backend pnpm get-token        # Get Auth0 token for API testing
```

### **Test Command Explanations**

- **`jest`**: Core test runner that finds and executes `.test.ts` files
- **`--watch`**: Automatically re-runs tests when files change (for development)
- **`--coverage`**: Generates code coverage reports showing which code is tested
- **`--testPathPatterns=auth`**: Only runs test files containing "auth" in the path
- **`tsx src/test/...`**: Runs TypeScript files directly (for utility scripts)

### **CI/CD Pipeline**

**Automated testing runs on:**
- ✅ All team member branches: `main`, `li-dev`, `anth-branch`, `bevan-branch`, `xiaoling`
- ✅ Pull requests to `main` branch

**Three parallel jobs:**
1. **Backend Tests** - All Jest tests with coverage reporting
2. **Frontend Tests** - Build and lint checks
3. **Type Checking** - TypeScript compilation validation

**GitHub Actions Files:**
- `.github/workflows/test.yml` - Main testing pipeline
- `.github/workflows/security.yml` - Security scanning and dependency audits

### **CI/CD Best Practices Implemented**

- ✅ **Branch Protection**: Tests must pass before merging
- ✅ **Parallel Execution**: Fast feedback with concurrent jobs
- ✅ **Real Database Testing**: PostgreSQL in CI matches production
- ✅ **Code Coverage**: Tracks test coverage over time
- ✅ **Security Scanning**: Weekly dependency audits
- ✅ **Type Safety**: TypeScript compilation in CI

## Team Development Notes

- Use Docker for consistent development environment
- Follow existing code conventions and patterns
- Test changes with both Docker logs and browser dev tools
- All major features should include proper TypeScript types
- Database changes require backend restart: `pnpm docker:restart-backend`
- **Run tests locally before pushing** to catch issues early
- **All tests must pass** before code can be merged to main
