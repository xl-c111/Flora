#!/bin/bash

# Flora Dev Container Setup Script
# This script sets up the development environment inside the Dev Container

set -e

echo "🌸 Flora Dev Container Setup Starting..."

# Install pnpm globally if not present
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

# Install all dependencies
echo "📦 Installing project dependencies..."
pnpm install

# Setup environment files if they don't exist
echo "⚙️ Setting up environment files..."

if [ ! -f "apps/backend/.env" ]; then
    echo "Creating backend .env file..."
    cat > apps/backend/.env << EOF
DATABASE_URL="postgresql://flora_user:flora_password@postgres:5432/flora_db"
PORT=3001
NODE_ENV=development
EOF
fi

if [ ! -f "apps/frontend/.env" ]; then
    echo "Creating frontend .env file..."
    cat > apps/frontend/.env << EOF
VITE_API_URL=http://localhost:3001/api
EOF
fi

# Wait for database to be ready
echo "🗃️ Waiting for database to be ready..."
until pg_isready -h postgres -p 5432 -U flora_user; do
    echo "Waiting for postgres..."
    sleep 2
done

# Setup database
echo "🗃️ Setting up database..."
cd apps/backend
pnpm db:generate
pnpm db:push
pnpm db:seed
cd ../..

echo "✅ Flora Dev Container setup complete!"
echo ""
echo "🚀 You can now:"
echo "   • Start backend: cd apps/backend && pnpm dev"
echo "   • Start frontend: cd apps/frontend && pnpm dev"
echo "   • Or use ./dev.sh commands for Docker services"
echo ""
echo "🌐 Access points:"
echo "   • Frontend: http://localhost:5173"
echo "   • Backend API: http://localhost:3001"
echo "   • API Health: http://localhost:3001/api/health"
