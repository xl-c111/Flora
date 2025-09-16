# 🌸 Flora - Flowers & Plants Marketplace

This is the Holberton demo project of **Anthony**, **Bevan**, **Xiaoling**, and **Lily**.

Flora is a modern flowers and plants marketplace built with React + TypeScript, Node.js/Express, Prisma, and PostgreSQL.

## 🏗️ Architecture

This is a **monorepo** using **pnpm workspaces** with the following structure:

```
flora-holberton-demo-project/
│
├── apps/
│   ├── frontend/                          # Next.js + Tailwind frontend
│   │   ├── Dockerfile                     # Container definition for frontend
│   │   ├── package.json                   # Frontend dependencies & scripts
│   │   ├── next.config.js                 # Next.js config (rewrites, proxy to backend)
│   │   ├── public/                        # Static assets (logos, images, icons)
│   │   └── src/
│   │       ├── pages/                     # Next.js page routes
│   │       │   ├── index.js               # Homepage (browse flowers)
│   │       │   ├── product/[id].js        # Product detail page
│   │       │   ├── checkout.js            # Checkout page (Stripe)
│   │       │   ├── login.js               # Login (Auth0)
│   │       │   └── history.js             # Purchase history page
│   │       ├── components/                # Reusable UI components
│   │       │   ├── Navbar.js
│   │       │   ├── Footer.js
│   │       │   ├── FilterBar.js           # Search & filter options
│   │       │   ├── ProductCard.js         # Flower product card
│   │       │   ├── CalendarPicker.js      # Subscription calendar
│   │       │   ├── Modal.js               # Popup for product details
│   │       │   ├── VoiceInput.js          # Voice-to-text input
│   │       │   └── ChatWithAI.js          # OpenAI chat/recommendations
│   │       ├── styles/                    # Tailwind/global styles
│   │       │   └── globals.css
│   │       ├── utils/
│   │       │   └── apiClient.js           # Wrapper for backend API calls
│   │       └── hooks/
│   │           └── useAuth.js             # Manage Auth0 login state
│   │
│   └── backend/                           # Node.js + Express backend
│       ├── Dockerfile                     # Container definition for backend
│       ├── package.json                   # Backend dependencies & scripts
│       ├── prisma/
│       │   ├── schema.prisma              # Database schema for PostgreSQL
│       │   └── migrations/                # Prisma migration files
│       └── src/
│           ├── index.js                   # Entry point (Express server)
│           ├── routes/                    # API endpoints
│           │   ├── auth.routes.js         # Auth0 endpoints
│           │   ├── product.routes.js      # Products, filters, search
│           │   ├── order.routes.js        # Checkout & subscriptions
│           │   ├── delivery.routes.js     # Delivery tracking
│           │   └── email.routes.js        # Email notifications
│           ├── controllers/               # Route handlers
│           │   ├── auth.controller.js
│           │   ├── product.controller.js
│           │   ├── order.controller.js
│           │   ├── delivery.controller.js
│           │   └── email.controller.js
│           ├── services/                  # Business logic
│           │   ├── auth.service.js        # Auth0 integration
│           │   ├── product.service.js     # Product DB queries
│           │   ├── order.service.js       # Stripe payment + subscriptions
│           │   ├── delivery.service.js    # Simulated delivery status
│           │   └── email.service.js       # Nodemailer/SendGrid
│           ├── config/                    # Configuration files
│           │   ├── auth0.js               # Auth0 setup
│           │   ├── stripe.js              # Stripe API setup
│           │   ├── email.js               # Email setup
│           │   └── db.js                  # Prisma client for PostgreSQL
│           ├── utils/
│           │   └── logger.js              # Logging utility
│           └── jobs/
│               └── delivery.cron.js       # Background job to simulate delivery
│
├── docker-compose.yml                     # Orchestrates frontend, backend, postgres
├── package.json                           # Root scripts for monorepo
├── pnpm-workspace.yaml                    # Defines frontend + backend workspaces
├── pnpm-lock.yaml                         # Locks dependency versions (auto-generated)
├── README.md                              # Project documentation
└── .gitignore                             # Files ignored by Git

```

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Axios
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Package Manager**: pnpm (workspaces)
- **DevOps**: Docker Compose for local development

## 📋 Prerequisites

- **Node.js** 18+
- **pnpm** 8+
- **Docker** and **Docker Compose**

## 🚀 Quick Start

### 1. Install dependencies

```bash
pnpm install:all
```

### 2. Set up environment files

Copy the example environment files to create your local configuration:

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

### 3. Start the database

```bash
pnpm start:db
```

### 4. Set up the database schema and seed data

```bash
pnpm db:setup
```

### 5. Start the development servers

#### For fullstack:
```bash
pnpm dev
```
This will start:

- **Backend API**: http://localhost:3001
- **Frontend**: http://localhost:5173
- **PostgreSQL**: localhost:5432

#### For the Backend only:
```bash
pnpm --filter backtend dev
```

#### For the frontend only:
```bash
pnpm --filter frontend dev
```


## 📊 Database Schema

### Product Enums (Filters)

- **Occasions**: Birthday, Anniversary, Wedding, Valentine's Day, Mother's Day, etc.
- **Seasons**: Spring, Summer, Fall, Winter, All Season
- **Moods**: Romantic, Cheerful, Elegant, Peaceful, Vibrant, etc.
- **Colors**: Red, Pink, White, Yellow, Orange, Purple, Blue, Green, Mixed, Pastel
- **Types**: Bouquet, Arrangement, Plant, Succulent, Orchid, Rose, Lily, Tulip, Sunflower, Mixed Flowers
- **Price Ranges**: Under $25, $25-50, $50-75, $75-100, Over $100

### Models

- **Product**: Main product entity with all filter properties
- **Category**: Product categories (Bouquets, Plants, Arrangements, Seasonal)

## 🎯 API Endpoints

### Products

- `GET /api/products` - Get products (with filtering)
- `GET /api/products/:id` - Get single product
- `GET /api/products/filters/options` - Get all filter options

### Categories

- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category

### Health

- `GET /api/health` - Health check

## 📱 Available Scripts

### Root Scripts

- `pnpm dev` - Start both frontend and backend in development mode
- `pnpm build` - Build both applications for production
- `pnpm db:setup` - Generate Prisma client, push schema, and seed database
- `pnpm db:seed` - Seed database with sample data
- `pnpm db:reset` - Reset database (careful: deletes all data!)
- `pnpm start:db` - Start PostgreSQL with Docker Compose
- `pnpm stop:db` - Stop PostgreSQL container

### Backend Scripts (from /apps/backend)

- `pnpm dev` - Start backend in development mode
- `pnpm build` - Build backend for production
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:push` - Push schema changes to database
- `pnpm db:migrate` - Run database migrations

### Frontend Scripts (from /apps/frontend)

- `pnpm dev` - Start frontend development server
- `pnpm build` - Build frontend for production
- `pnpm preview` - Preview production build

## 🔧 Environment Variables

### Backend (.env)

```bash
DATABASE_URL="postgresql://flora_user:flora_password@localhost:5432/flora_db"
PORT=3001
NODE_ENV=development
```

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:3001/api
```

## 🌱 Sample Data

The seed script creates:

- **8 sample products** including roses, tulips, orchids, sunflowers, succulents, etc.
- **4 categories** (Bouquets, Plants, Arrangements, Seasonal)
- Products with realistic **prices**, **descriptions**, and **filter tags**
- **Images from Unsplash** for visual appeal

## 🔍 Features

### Backend Features

- **RESTful API** with Express.js
- **Type-safe database** queries with Prisma
- **Advanced filtering** by occasion, season, mood, color, type, price range
- **Pagination** support
- **Search functionality**
- **Health check endpoint**
- **Error handling middleware**

### Frontend Features

- **Modern React 19** with TypeScript
- **Responsive design** with CSS Grid
- **Product catalog** with filtering capabilities
- **API integration** with Axios
- **Loading states** and error handling
- **Clean, marketplace-style UI**

## 🐳 Docker Services

The `docker-compose.yml` provides:

- **PostgreSQL 15** database
- **Persistent volume** for data
- **Health checks**
- **Environment variables** for connection

## 👥 Team

Created by the Holberton team:

- **Anthony**
- **Bevan**
- **Xiaoling**
- **Lily**

## 📄 License

MIT License - feel free to use this project for learning and demonstration purposes.
