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

### 🍎 Mac/Linux Users (Recommended - Hybrid Approach)

```bash
git clone https://github.com/Aldore-88/holbertonschool-final_project.git
cd holbertonschool-final_project
```

**Option 1: Using dev.sh script (Recommended for teams)**

```bash
# First time setup (new teammates)
./dev.sh setup            # Builds containers + starts services + sets up database

# Daily development commands
./dev.sh start            # Start services (after initial setup)
./dev.sh stop             # Clean shutdown
./dev.sh status           # Check what's running
./dev.sh restart          # Restart services
./dev.sh logs             # View logs
./dev.sh help             # See all commands
```

**Option 2: Using pnpm directly**

```bash
pnpm docker:dev:build     # Force rebuild containers
pnpm docker:dev           # Run in foreground (see logs)
pnpm docker:dev:bg        # Run in background
pnpm docker:setup         # Runs migrations + seeding
pnpm docker:stop          # Stop containers
```

**💡 Pro Tip for TypeScript Developers:**
If you get TypeScript errors in VS Code when using Docker-only approach:

```bash
# Install dependencies locally for VS Code IntelliSense
pnpm install

# Then run Docker services (hybrid approach)
pnpm docker:dev:bg
```

This gives you the best of both worlds: local TypeScript support + consistent Docker runtime.

```bash
### Production
pnpm docker:prod          # Production deployment
```

```bash
### Other Useful Commands
pnpm docker:logs          # View all container logs
pnpm docker:clean         # Clean up volumes (careful!)
pnpm start:db             # Start only database
```

### 🪟 Windows Users (Full Docker with Volume Sync)

**For Windows team members who want to avoid Node.js/pnpm setup issues:**

```bash
git clone https://github.com/Aldore-88/holbertonschool-final_project.git
cd holbertonschool-final_project

# Start everything in Docker
./dev-windows.sh bg

# Check status
./dev-windows.sh status
```

**📖 Detailed Windows Setup:** See [WINDOWS_SETUP.md](./WINDOWS_SETUP.md) for complete instructions.

**Benefits for Windows:**

- ✅ No Node.js installation needed
- ✅ No Windows path/permission issues
- ✅ VS Code IntelliSense still works
- ✅ Same database as Mac teammates

---

## 📁 Project Structure Explained (First-Time React Guide)

This is a **monorepo** (multiple apps in one repository) using **pnpm workspaces**:

### 🏗️ Root Level Structure

```
holbertonschool-final_project/           # 📁 Main project folder
├── 🐳 Docker & Development
│   ├── dev.sh                           # 🛠️ Development helper script (start/stop services)
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

1. Open http://localhost:5173
2. Check browser console for errors (F12)
3. Test user interactions (clicking, typing)

### Backend Testing:

1. Check http://localhost:3001/api/health
2. Use browser or Postman to test API endpoints
3. Check logs with `./dev.sh logs`

### Database Testing:

1. Check data with Prisma Studio: `npx prisma studio`
2. Verify API responses return correct data

---

## 🆘 Common Issues & Solutions

### 🔧 Development Issues:

- **Services won't start**: Run `./dev.sh restart`
- **Database connection error**: Run `./dev.sh db-reset` (loses data!)
- **Frontend won't load**: Check if backend is running
- **API returns errors**: Check backend logs

### 📝 Code Issues:

- **TypeScript errors**: Fix type mismatches
- **React component not updating**: Check useState/useEffect
- **API call failing**: Verify URL and request format

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

## 🎯 API Endpoints Overview

### Products & Search

```
GET    /api/products              # Browse with filters
GET    /api/products/:id          # Product details
GET    /api/products/search       # Search functionality
GET    /api/categories            # Category list
```

### Authentication (Supabase)

```
POST   /api/auth/register         # User registration
POST   /api/auth/login            # User login
GET    /api/auth/profile          # User profile
```

### Orders & Checkout

```
POST   /api/orders                # Create order (guest or user)
GET    /api/orders/:id            # Order details
POST   /api/orders/:id/confirm    # Confirm payment
```

### Subscriptions

```
POST   /api/subscriptions         # Create subscription
GET    /api/subscriptions         # User's subscriptions
PUT    /api/subscriptions/:id     # Update subscription
DELETE /api/subscriptions/:id     # Cancel subscription
```

## 👥 Team

Created by the Holberton team:

- **Anthony**
- **Bevan**
- **Xiaoling**
- **Lily**

## 📄 License

MIT License - feel free to use this project for learning and demonstration purposes.
