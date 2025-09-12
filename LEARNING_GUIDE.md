# 🎓 Fullstack Development Learning Guide

## How to Build This React + Node.js App From Scratch

This guide will teach you to build a complete fullstack application like Flora from zero. Perfect for learning!

---

## 📋 Prerequisites You Need

Before starting, install these on your computer:

```bash
# Node.js (includes npm)
# Download from: https://nodejs.org/ (choose LTS version)

# pnpm (faster package manager)
npm install -g pnpm

# Docker Desktop (for database)
# Download from: https://www.docker.com/products/docker-desktop/
```

---

## 🏗️ Step-by-Step Build Process

### Step 1: Project Structure Setup

```bash
# 1. Create project folder
mkdir my-fullstack-app
cd my-fullstack-app

# 2. Initialize monorepo
pnpm init

# 3. Create workspace structure
mkdir apps
mkdir apps/backend
mkdir apps/frontend
```

### Step 2: Setup Package Manager (pnpm workspaces)

Create `pnpm-workspace.yaml`:

```yaml
# This tells pnpm to treat folders under 'apps/*' as separate packages
packages:
  - 'apps/*'
```

Create root `package.json`:

```json
{
  "name": "my-fullstack-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "concurrently \"pnpm --filter backend dev\" \"pnpm --filter frontend dev\"",
    "install:all": "pnpm install",
    "start:db": "docker-compose up -d postgres",
    "db:setup": "pnpm --filter backend db:setup"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

---

## 🗄️ Step 3: Database Setup (PostgreSQL + Docker)

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    container_name: my-app-postgres
    restart: always
    environment:
      POSTGRES_USER: myapp_user
      POSTGRES_PASSWORD: myapp_password
      POSTGRES_DB: myapp_db
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## 🔧 Step 4: Backend Setup (Node.js + Express + TypeScript)

### 4.1 Initialize Backend

```bash
cd apps/backend
pnpm init
```

### 4.2 Install Backend Dependencies

```bash
# Production dependencies
pnpm add express cors dotenv @prisma/client

# Development dependencies
pnpm add -D typescript @types/node @types/express @types/cors tsx prisma
```

### 4.3 Setup TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 4.4 Create Backend Package.json Scripts

Add to `apps/backend/package.json`:

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts",
    "db:setup": "pnpm db:generate && pnpm db:push && pnpm db:seed"
  }
}
```

### 4.5 Setup Prisma (Database ORM)

```bash
# Initialize Prisma
npx prisma init
```

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Product {
  id          String   @id @default(cuid())
  name        String
  description String
  price       Float
  imageUrl    String?
  inStock     Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("products")
}
```

### 4.6 Create Environment File

Create `apps/backend/.env`:

```bash
DATABASE_URL="postgresql://myapp_user:myapp_password@localhost:5432/myapp_db"
PORT=3001
NODE_ENV=development
```

### 4.7 Create Main Server File

Create `apps/backend/src/index.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app: express.Application = express();
const port = process.env.PORT || 3001;
export const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Simple route
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', message: 'API is running!' });
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
```

---

## ⚛️ Step 5: Frontend Setup (React + TypeScript + Vite)

### 5.1 Create React App with Vite

```bash
cd apps/frontend

# Create Vite React app with TypeScript
pnpm create vite . --template react-ts
```

### 5.2 Install Additional Dependencies

```bash
pnpm add axios  # For API calls
```

### 5.3 Create Environment File

Create `apps/frontend/.env`:

```bash
VITE_API_URL=http://localhost:3001/api
```

### 5.4 Create API Service

Create `apps/frontend/src/services/api.ts`:

```typescript
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const apiService = {
  getProducts: async () => {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  healthCheck: async () => {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  },
};
```

### 5.5 Create Main App Component

Replace `apps/frontend/src/App.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { apiService } from './services/api';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await apiService.getProducts();
      setProducts(data.products);
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>My Fullstack App</h1>
      <div>
        {products.map((product) => (
          <div key={product.id}>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
```

---

## 🚀 Step 6: Running Everything

### 6.1 Start Database

```bash
docker-compose up -d
```

### 6.2 Setup Backend Database

```bash
cd apps/backend
pnpm db:setup
```

### 6.3 Start Backend

```bash
pnpm dev  # Runs on http://localhost:3001
```

### 6.4 Start Frontend (in new terminal)

```bash
cd apps/frontend
pnpm dev  # Runs on http://localhost:5173
```

---

## 🎯 Key Learning Concepts

### Backend Concepts:

- **Express.js**: Web framework for Node.js
- **Middleware**: Functions that run before route handlers
- **Prisma ORM**: Type-safe database operations
- **Environment Variables**: Configuration management
- **CORS**: Cross-Origin Resource Sharing
- **REST API**: HTTP methods (GET, POST, PUT, DELETE)

### Frontend Concepts:

- **React Hooks**: useState, useEffect
- **TypeScript**: Type safety for JavaScript
- **Vite**: Fast build tool
- **API Integration**: Fetching data from backend
- **Component-based Architecture**: Reusable UI pieces

### DevOps Concepts:

- **Docker**: Containerization for databases
- **Monorepo**: Multiple packages in one repository
- **Environment Files**: Separating config from code
- **Package Manager**: pnpm for dependency management

---

## 📚 Next Steps to Learn

1. **Add Authentication**: JWT tokens, login/signup
2. **State Management**: Redux Toolkit or Zustand
3. **Database Relations**: Foreign keys, joins
4. **Testing**: Jest, React Testing Library
5. **Deployment**: Vercel, Netlify, Railway
6. **UI Libraries**: Tailwind CSS, Material-UI
7. **Advanced React**: Context API, custom hooks

---

## 🔍 Troubleshooting Common Issues

### "Port already in use"

```bash
# Kill process using port
lsof -ti:3001 | xargs kill
```

### "Database connection failed"

```bash
# Check if Docker is running
docker ps

# Restart database
docker-compose restart postgres
```

### "Module not found"

```bash
# Reinstall dependencies
pnpm install
```

---

This guide gives you everything needed to build fullstack applications from scratch! Practice by building different features and exploring the concepts mentioned.
