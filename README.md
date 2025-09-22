# 🌸 Flora - Flowers & Plants Marketplace

**Team:** Anthony, Bevan, Xiaoling, and Lily | **Timeline:** 5-6 weeks | **Holberton Final Project**

**Built with ❤️ and lots of learning** 🌸

_Flora - Where every purchase blooms into joy_

Flora is a modern flowers and plants marketplace featuring flexible purchasing options including one-time purchases and subscription services. Built with React + TypeScript, Node.js/Express, Prisma, PostgreSQL, and Docker.

## 🎯 Project Vision

**Core Customer Flow:** Browse → Filter/Search → Product Detail → Purchase → Email Confirmation

### Purchase Options:

- **One-time Purchase:** Buy flowers/plants immediately
- **Subscription Service:** Recurring deliveries (weekly/monthly)
- **Guest Checkout:** No account required for quick purchases

## 🚀 Quick Start for Team Development

### 🖥️ All Platforms (Mac/Linux/Windows)

```bash
git clone https://github.com/Aldore-88/holbertonschool-final_project.git
cd holbertonschool-final_project
```

**Choose your setup method:**

#### 🚀 Method 1: Standard Docker (Recommended for Mac/Linux)

```bash
# 🚀 Initial Setup (first time)
pnpm docker:dev:build     # Force rebuild containers
pnpm docker:dev           # Start services (run in foreground, see logs)
pnpm docker:setup         # Set up database (migrations + seeding) - run in another terminal

# 📊 Daily Development
pnpm docker:dev:bg        # Run services in background (preferred for daily work)
pnpm docker:logs          # View all container logs
pnpm docker:restart-backend # Restart backend (useful when Prisma schema changes)
pnpm docker:restart-frontend # Restart frontend
docker ps # Checking working containers

docker logs flora-backend # View backend logs and backend preview (link)
docker logs flora-frontend # View frontend logs and frontend preview (link)
```

#### 🪟 Method 2: Windows-Optimized Docker (for Window users)

If you're on Windows and experiencing file sync issues, use this optimized setup:

```bash
# � Windows Setup (first time)
docker-compose -f docker-compose.yml -f docker-compose.windows.yml build
docker-compose -f docker-compose.yml -f docker-compose.windows.yml up -d
pnpm docker:setup         # Set up database (migrations + seeding)

# 📊 Daily Development (Windows)
pnpm docker:windows           # Start services
pnpm docker:windows:logs      # View logs

# 🔧 Windows Maintenance
pnpm docker:windows:stop              # Stop all containers
pnpm docker:windows:restart-backend   # Restart backend only
pnpm docker:windows:restart-frontend  # Restart frontend only
```

**Windows Benefits:**
- ✅ Better file watching and hot reload
- ✅ Proper node_modules sync for VS Code IntelliSense
- ✅ No permission issues with volumes
- ✅ Optimized for Windows Docker Desktop
- ✅ **NEW: Convenient pnpm shortcuts!**

**🔧 Windows-Specific Optimizations Explained:**
- **Named Volumes**: `backend_node_modules` & `frontend_node_modules` avoid Windows path issues
- **Proper Commands**: Uses `sh -c` instead of direct commands for better Windows compatibility
- **Volume Mounting**: Separates source code from node_modules to prevent permission conflicts
- **TTY Support**: `stdin_open: true` & `tty: true` enable proper debugging on Windows

#### 💻 Method 3: Local Development (Alternative - Requires More Setup)

**⚠️ Important: Don't mix this with Docker methods above!**

If you prefer running services locally instead of Docker:

```bash
# 🛠️ Prerequisites (one-time setup)
npm install -g pnpm          # Install pnpm globally
pnpm install                 # Install all dependencies

# 🗃️ Database Setup (still uses Docker for PostgreSQL)
pnpm start:db                # Start PostgreSQL container only
pnpm db:setup                # Run migrations + seeding

# 🚀 Start Development (runs locally, not in containers)
pnpm dev                     # Starts both backend + frontend locally
# Backend: http://localhost:3001
# Frontend: http://localhost:5173

# 🔧 Database Operations (same as Docker)
pnpm db:seed                 # Re-seed with fresh data
pnpm db:reset                # Reset database (⚠️ deletes all data)
pnpm stop:db                 # Stop PostgreSQL when done
```

**When to use Local Development:**
- ✅ You want faster startup times
- ✅ You prefer debugging locally
- ✅ You have Node.js 18+ installed
- ⚠️ **But**: Docker is more consistent across team environments

### 🤔 **Which Method Should I Choose?**

| Method | Best For | Pros | Cons |
|--------|----------|------|------|
| **Docker (Method 1 & 2)** | Most people | ✅ Consistent environment<br>✅ No local setup issues<br>✅ Same as production | ⚠️ Slightly slower startup |
| **Local (Method 3)** | Advanced users | ✅ Faster startup<br>✅ Direct debugging | ⚠️ Requires Node.js setup<br>⚠️ Environment differences |

**👥 Team Recommendation: Use Docker (Method 1 or 2) to avoid "works on my machine" issues!**

---

## 🔄 **Complete Docker Workflow Guide**

### 🚀 **New Team Member Setup (Do This Once)**

```bash
# Step 1: Get the code
git clone https://github.com/Aldore-88/holbertonschool-final_project.git
cd holbertonschool-final_project

# Step 2: Choose your method
# Mac/Linux users:
pnpm docker:dev:build && pnpm docker:setup

# Windows users:
pnpm docker:windows:build && pnpm docker:setup

# Step 3: Verify everything works
# Frontend: http://localhost:5173
# Backend: http://localhost:3001/api/health
```

### 🔁 **Daily Development Workflow**

```bash
# Mac/Linux:
pnpm docker:dev:bg        # Start in background
pnpm docker:logs          # View logs when needed

# Windows:
pnpm docker:windows       # Start in background
pnpm docker:windows:logs  # View logs when needed
```

### 🗃️ **Database Operations (When Do You Need Them?)**

| Operation | Command | When to Use | Restart Needed? |
|-----------|---------|-------------|-----------------|
| **Fresh sample data** | `pnpm docker:seed` | Want new test data | ❌ **No restart!** |
| **Schema changed** | `pnpm docker:restart-backend` | Prisma schema.prisma modified | ✅ Backend only |
| **Environment changed** | `pnpm docker:restart-backend` | .env files modified | ✅ Backend only |
| **Nuclear reset** | `pnpm db:reset && pnpm docker:restart-backend` | Database corrupted | ✅ Backend only |
| **First time setup** | `pnpm docker:setup` | New team member | ❌ **No restart!** |

### 🤔 **Important Clarifications**

**Q: Does `docker:setup` include seeding?**
✅ **YES!** `docker:setup` = migrations + seeding (everything!)

**Q: When do I NOT need to restart anything?**
- ✅ Code changes (hot reload handles it)
- ✅ Adding new data with `docker:seed`
- ✅ Running `docker:setup` (if containers already running)

**Q: When DO I need to restart backend?**
- ⚠️ Environment variables changed (.env files)
- ⚠️ Prisma schema changed (schema.prisma)
- ⚠️ Backend configuration changes
- ⚠️ After `pnpm db:reset` (NOTE: it will clear all data)

### 🚨 **Troubleshooting Decision Tree**

```bash
# 🐛 Problem: Frontend not loading
→ Check: Is backend running? `docker ps`
→ Fix: `pnpm docker:restart-backend`

# 🐛 Problem: Database connection error
→ Check: Is postgres healthy? `docker ps` (should show "healthy")
→ Fix: `pnpm docker:stop && pnpm docker:dev:bg`

# 🐛 Problem: "Module not found" errors
→ Fix: `pnpm docker:build` (rebuild with fresh dependencies)

# 🐛 Problem: Old data showing up
→ Fix: `pnpm docker:seed` (refresh sample data)

# 🐛 Problem: Everything is broken
→ Nuclear option: `pnpm docker:clean-project && pnpm docker:dev:build`
```

#### 🔄 **Database Workflow (Important for Team)**

**After Re-seeding Data:**
```bash
pnpm docker:seed          # ✅ No restart needed - data changes immediately!
# Your API calls will see new data right away
```

**After Schema Changes (Prisma):**
```bash
# Schema changed? Restart backend to reload Prisma client:
pnpm docker:restart-backend
```

**After Full Database Reset:**
```bash
pnpm db:reset             # ⚠️ Deletes everything
pnpm docker:restart-backend  # Required: Backend needs to reconnect
```
#### �🗃️ Database Operations (All Platforms)

```bash
pnpm docker:seed          # Re-seed database with fresh sample data
pnpm db:reset             # Reset database (WARNING: deletes all data!)

# 🔧 Maintenance & Debugging
pnpm docker:stop          # Stop all containers
pnpm docker:build         # Rebuild containers without starting them
pnpm docker:clean         # Remove containers and volumes (fresh start, keep images)
pnpm docker:clean-project # Full cleanup: remove containers, images, and volumes

# 🎯 Production
pnpm docker:prod          # Run production build
```

---

---

## 📁 Project Structure Explained (First-Time React Guide)

This is a **monorepo** (multiple apps in one repository) using **pnpm workspaces**:

### 🏗️ Root Level Structure

```
holbertonschool-final_project/           # 📁 Main project folder
├── 🐳 Docker & Development
│   ├── docker-compose.yml               # 🐳 Main Docker services configuration
│   ├── docker-compose.dev.yml           # 🐳 Development-specific Docker settings
│   └── docker-compose.prod.yml          # 🐳 Production Docker settings
├── 📦 Package Management
│   ├── package.json                     # 📦 Root package.json (workspace config)
│   ├── pnpm-workspace.yaml              # 📦 pnpm workspace configuration
│   └── pnpm-lock.yaml                   # 🔒 Lock file for dependency versions
├── 📚 Documentation
│   ├── README.md                        # 📖 This file - main project documentation
│   ├── SETUP.md                         # 🚀 Detailed setup instructions
│   ├── TEAM_WORKFLOW.md                 # 👥 Team collaboration guide
│   └── docs/                            # 📁 Additional documentation
└── 🚀 Applications
    └── apps/                            # 📁 Contains frontend & backend applications
        ├── frontend/                    # ⚛️ React TypeScript app
        └── backend/                     # 🔧 Node.js Express API
```

---

## ⚛️ Frontend Structure (React + TypeScript)

```
apps/frontend/                           # 📁 React Application Root
├── 📦 Configuration Files
│   ├── package.json                     # 📦 Frontend dependencies & scripts
│   ├── vite.config.ts                   # ⚡ Vite bundler configuration
│   ├── tsconfig.json                    # 📝 TypeScript configuration
│   ├── eslint.config.js                 # 🔍 Code linting rules
│   └── Dockerfile                       # 🐳 Docker container setup
├── 🌐 Public Assets
│   └── public/                          # 📁 Static files (images, icons)
└── 💻 Source Code
    └── src/                             # 📁 All React source code
        ├── 🎨 Styling
        │   ├── App.css                  # 🎨 Main application styles
        │   └── index.css                # 🎨 Global styles
        ├── 📄 Entry Points
        │   ├── main.tsx                 # 🚪 App entry point (React.render)
        │   ├── App.tsx                  # 🏠 Main App component
        │   └── vite-env.d.ts            # 📝 Vite TypeScript definitions
        ├── 📁 Core Architecture
        │   ├── components/              # 🧩 Reusable UI Components
        │   │   ├── ui/                  # 🎨 Basic UI elements (Button, Input, Modal)
        │   │   ├── auth/                # 🔐 Authentication components (Login, Register)
        │   │   ├── product/             # 🛍️ Product-related components (ProductCard, ProductGrid)
        │   │   ├── checkout/            # 💳 Shopping cart & checkout components
        │   │   └── layout/              # 📋 Page layout components (Header, Footer, Sidebar)
        │   ├── pages/                   # 📄 Full Page Components
        │   │   ├── HomePage.tsx         # 🏠 Main page with product grid
        │   │   ├── ProductPage.tsx      # 📦 Individual product details
        │   │   ├── CheckoutPage.tsx     # 💳 Shopping cart & payment
        │   │   ├── LoginPage.tsx        # 🔐 User login/register
        │   │   └── ProfilePage.tsx      # 👤 User account management
        │   ├── hooks/                   # 🎣 Custom React Hooks
        │   │   ├── useAuth.ts           # 🔐 Authentication state management
        │   │   ├── useCart.ts           # 🛒 Shopping cart logic
        │   │   ├── useProducts.ts       # 📦 Product data fetching
        │   │   └── useLocalStorage.ts   # 💾 Browser storage management
        │   ├── contexts/                # 🌐 React Context (Global State)
        │   │   ├── AuthContext.tsx      # 🔐 User authentication state
        │   │   ├── CartContext.tsx      # 🛒 Shopping cart state
        │   │   └── ThemeContext.tsx     # 🎨 App theme/styling state
        │   ├── services/                # 🔌 External API Communication
        │   │   ├── api.ts               # 🌐 Main API client (axios setup)
        │   │   ├── authService.ts       # 🔐 Authentication API calls
        │   │   ├── productService.ts    # 📦 Product API calls
        │   │   └── orderService.ts      # 📋 Order & checkout API calls
        │   ├── types/                   # 📝 TypeScript Type Definitions
        │   │   ├── index.ts             # 📝 Main type exports
        │   │   ├── api.ts               # 🌐 API response types
        │   │   ├── product.ts           # 📦 Product data types
        │   │   └── user.ts              # 👤 User data types
        │   └── assets/                  # 🖼️ Images, icons, fonts
```

### 🧩 React Concepts Explained:

**🧩 Components**: Reusable pieces of UI (like LEGO blocks)

- `ProductCard.tsx` - Shows one product with image, name, price
- `Button.tsx` - Reusable button with different styles
- `Header.tsx` - Top navigation bar

**🎣 Hooks**: Functions that let you "hook into" React features

- `useState` - Store data that can change (like cart items)
- `useEffect` - Run code when component loads or updates
- `useAuth` - Custom hook for login/logout logic

**🌐 Context**: Share data between components without passing props

- `AuthContext` - User login status available everywhere
- `CartContext` - Shopping cart accessible from any page

**📄 Pages**: Full screen components that represent different URLs

- Each page is like a different screen in the app

---

## 🔧 Backend Structure (Node.js + Express + TypeScript)

```
apps/backend/                            # 📁 API Server Root
├── 📦 Configuration Files
│   ├── package.json                     # 📦 Backend dependencies & scripts
│   ├── tsconfig.json                    # 📝 TypeScript configuration
│   └── Dockerfile                       # 🐳 Docker container setup
├── 🗃️ Database
│   └── prisma/                          # 🗃️ Database configuration
│       ├── schema.prisma                # 📋 Database structure definition
│       ├── seed.ts                      # 🌱 Sample data for development
│       └── migrations/                  # 📁 Database version history
└── 💻 Source Code
    └── src/                             # 📁 All backend source code
        ├── 🚪 Entry Point
        │   └── index.ts                 # 🚪 Server startup file
        ├── 📁 Core Architecture (MVC Pattern)
        │   ├── controllers/             # 🎮 Request Handlers (Handle HTTP requests)
        │   │   ├── ProductController.ts # 📦 Handle product requests (GET /api/products)
        │   │   ├── UserController.ts    # 👤 Handle user requests (POST /api/auth/login)
        │   │   ├── OrderController.ts   # 📋 Handle order requests (POST /api/orders)
        │   │   ├── PaymentController.ts # 💳 Handle payment requests
        │   │   └── DeliveryController.ts # 🚚 Handle shipping requests (planned)
        │   ├── services/                # 🔧 Business Logic Layer
        │   │   ├── ProductService.ts    # 📦 Product business logic (search, filter)
        │   │   ├── UserService.ts       # 👤 User management logic
        │   │   ├── OrderService.ts      # 📋 Order processing logic
        │   │   ├── PaymentService.ts    # 💳 Payment processing logic
        │   │   ├── EmailService.ts      # 📧 Email notifications
        │   │   └── DeliveryService.ts   # 🚚 Shipping calculations (planned)
        │   ├── routes/                  # 🛤️ API Endpoints (URL definitions)
        │   │   ├── products.ts          # 📦 Product URLs (/api/products/*)
        │   │   ├── users.ts             # 👤 User URLs (/api/auth/*)
        │   │   ├── orders.ts            # 📋 Order URLs (/api/orders/*)
        │   │   ├── payments.ts          # 💳 Payment URLs (/api/payments/*)
        │   │   └── delivery.ts          # 🚚 Shipping URLs (/api/delivery/*) [planned]
        │   ├── middleware/              # 🔒 Request Processing
        │   │   ├── auth.ts              # 🔐 Check if user is logged in
        │   │   ├── validation.ts        # ✅ Validate request data
        │   │   └── errorHandler.ts      # ❌ Handle errors gracefully
        │   ├── config/                  # ⚙️ Configuration
        │   │   ├── database.ts          # 🗃️ Database connection setup
        │   │   ├── auth.ts              # 🔐 Authentication configuration
        │   │   └── payment.ts           # 💳 Payment provider setup
        │   ├── types/                   # 📝 TypeScript Type Definitions
        │   │   ├── index.ts             # 📝 Main type exports
        │   │   ├── api.ts               # 🌐 API request/response types (includes delivery types)
        │   │   └── database.ts          # 🗃️ Database model types
        │   └── utils/                   # 🛠️ Helper Functions
        │       ├── validation.ts        # ✅ Data validation helpers
        │       ├── encryption.ts        # 🔒 Password hashing
        │       └── formatting.ts       # 📝 Data formatting utilities
```

### 🔧 Backend Concepts Explained:

**🎮 Controllers**: Handle incoming HTTP requests

- Receive requests from frontend
- Call services to do the work
- Send responses back to frontend

**🔧 Services**: Business logic (the "brain" of operations)

- `ProductService.getProducts()` - Get products with filters
- `OrderService.createOrder()` - Process a new order
- `EmailService.sendConfirmation()` - Send order confirmation email

**🛤️ Routes**: Define which URL calls which controller

- `GET /api/products` → `ProductController.getProducts()`
- `POST /api/orders` → `OrderController.createOrder()`

**🔒 Middleware**: Functions that run before controllers

- Check if user is authenticated
- Validate request data
- Handle errors

**🗃️ Prisma**: Database toolkit

- `schema.prisma` - Defines database tables (includes comprehensive delivery system)
- Generates TypeScript types automatically
- Makes database queries type-safe

---

## 🛠️ Tech Stack Explained

### Frontend Technologies:

- **⚛️ React 19**: JavaScript library for building user interfaces
- **📝 TypeScript**: JavaScript with types (catches errors early)
- **⚡ Vite**: Fast build tool and development server
- **🎨 CSS**: Styling (custom CSS, not a framework)

### Backend Technologies:

- **🟢 Node.js**: JavaScript runtime for servers
- **🚀 Express**: Web framework for Node.js (handles HTTP requests)
- **📝 TypeScript**: Type-safe JavaScript
- **🗃️ Prisma**: Database toolkit and ORM
- **🐘 PostgreSQL**: Relational database

### Development Tools:

- **📦 pnpm**: Fast package manager (alternative to npm)
- **🐳 Docker**: Containerization (consistent environment)
- **📁 Monorepo**: Multiple apps in one repository

---

## 🧪 Testing Your Changes

### Frontend Testing:

1. Check frontend logs: `docker logs flora-frontend`
2. Open http://localhost:5173
3. Check browser console for errors (F12)
4. Test user interactions (clicking, typing)

### Backend Testing:

1. Check http://localhost:3001/api/health
2. Use browser or Postman to test API endpoints
3. Check backend logs:
`docker logs flora-backend --tail 10`
or:
`pnpm docker:logs backend --tail 5`

4. Check all logs together: `pnpm docker:logs --tail 5` (if needed)

### Database Testing:

1. Check data with Prisma Studio: `npx prisma studio`
2. Verify API responses return correct data

---

## 🎯 Feature Implementation Plan

### Must-Haves (Weeks 1-4)

- ✅ Product browsing with search/filter
- ✅ Product detail modals
- ✅ Guest checkout (one-time purchases)
- ✅ User authentication (Supabase)
- ✅ Subscription system (recurring + spontaneous)
- ✅ Order processing & email confirmations

### Could-Haves (Weeks 5-6)

- 📦 Product bundles
- 🔔 Price alerts & notifications
- � **Delivery Management System** (planned - see below)
- �📍 Order tracking with real-time updates
- 🎨 Advanced UI/UX polish

### 🚚 Planned Delivery Feature (Future Implementation)

**Comprehensive shipping system** designed for real e-commerce functionality:

#### Database Schema (Already Designed)

- **DeliveryZone**: Zip code mapping with pricing per zone
- **DeliveryMethod**: Standard/Express/Same-day options
- **DeliveryTracking**: Real-time order tracking system
- **DeliveryWindow**: Time slot selections for customers

#### Backend Services (Ready to Implement)

- **DeliveryService.ts**: Shipping cost calculation engine
- **DeliveryController.ts**: API endpoints for shipping options
- **Routes**: `/api/delivery/*` for all shipping functionality

#### Frontend Components (Planned)

- **ShippingSelector**: Choose delivery method during checkout
- **DeliveryCostBreakdown**: Show shipping costs with explanations
- **OrderTracking**: Customer order status page
- **AddressValidation**: Verify delivery availability

#### Key Features

- **Smart Pricing**: Zone-based shipping with free delivery thresholds
- **Real-time Calculation**: Dynamic shipping costs based on location
- **Delivery Windows**: Morning/afternoon/evening slot booking
- **Order Tracking**: From "preparing" to "delivered" with updates
- **Validation**: Check zip code coverage before checkout

#### Why This Matters for E-commerce Learning

- **Real-world complexity**: Understanding shipping logistics
- **Business logic**: Complex pricing rules and zone management
- **Customer experience**: Transparent delivery expectations
- **Integration challenges**: Connecting checkout flow with shipping

> **Team Note**: All delivery types and interfaces are documented in `types/api.ts`. The database schema includes comprehensive delivery tables. This feature showcases how modern e-commerce platforms handle shipping complexity while maintaining user-friendly experiences.

### Environment Configuration

Copy example environment files:

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

Required environment variables:

```bash
# Backend (.env)
DATABASE_URL="postgresql://flora_user:flora_password@localhost:5432/flora_db"
SUPABASE_URL="your-supabase-url"
SUPABASE_ANON_KEY="your-supabase-anon-key"
STRIPE_SECRET_KEY="sk_test_..."
EMAIL_SERVICE_API_KEY="your-email-api-key"

# Frontend (.env)
VITE_API_URL="http://localhost:3001/api"
VITE_SUPABASE_URL="your-supabase-url"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
```
---
## 👥 Team

Created by the Holberton team:

- **Anthony**
- **Bevan**
- **Xiaoling**
- **Lily**

## 📄 License

MIT License - feel free to use this project for learning and demonstration purposes.
