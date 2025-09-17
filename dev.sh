#!/bin/bash

# Flora Development Helper Script
# This script provides common Docker development commands for the team

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[Flora]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[Flora]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[Flora]${NC} $1"
}

print_error() {
    echo -e "${RED}[Flora]${NC} $1"
}

# Help function
show_help() {
    echo "Flora Marketplace Development Helper"
    echo ""
    echo "Usage: ./dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  setup     - Initial setup (build containers and setup database)"
    echo "  start     - Start development environment"
    echo "  stop      - Stop all containers"
    echo "  restart   - Restart all containers"
    echo "  rebuild   - Rebuild containers with new dependencies"
    echo "  logs      - Show logs from all services"
    echo "  db-reset  - Reset database (DESTRUCTIVE)"
    echo "  db-seed   - Seed database with sample data"
    echo "  clean     - Clean up containers and volumes"
    echo "  status    - Show container status"
    echo "  help      - Show this help message"
}

# Setup function for initial development environment
setup() {
    print_status "Setting up Flora development environment..."

    # Create .env files if they don't exist
    if [ ! -f "./apps/backend/.env" ]; then
        print_warning "Creating backend .env file from template..."
        cp ./apps/backend/.env.example ./apps/backend/.env
    fi

    if [ ! -f "./apps/frontend/.env" ]; then
        print_warning "Creating frontend .env file from template..."
        cp ./apps/frontend/.env.example ./apps/frontend/.env
    fi

    print_status "Building containers..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml build

    print_status "Starting all services..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

    print_status "Waiting for services to be ready..."
    sleep 15

    print_status "Setting up database..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec backend pnpm db:setup

    print_success "Setup complete! Flora is ready to use:"
    print_status "Frontend: http://localhost:5173"
    print_status "Backend API: http://localhost:3001"
    print_status "Database: localhost:5432"
}

# Start development environment
start() {
    print_status "Starting Flora development environment..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

    print_success "Services started!"
    print_status "Frontend: http://localhost:5173"
    print_status "Backend API: http://localhost:3001"
    print_status "Database: localhost:5432"

    echo ""
    print_status "Use './dev.sh logs' to view logs"
    print_status "Use './dev.sh stop' to stop services"
}

# Stop all containers
stop() {
    print_status "Stopping all containers..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
    print_success "All containers stopped."
}

# Restart all containers
restart() {
    print_status "Restarting containers..."
    stop
    start
}

# Rebuild containers
rebuild() {
    print_status "Rebuilding containers with new dependencies..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml build --no-cache
    print_success "Rebuild complete! Use './dev.sh start' to start."
}

# Show logs
logs() {
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f
}

# Reset database
db_reset() {
    print_warning "This will DESTROY all data in the database!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Resetting database..."
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec backend pnpm db:reset
        print_success "Database reset complete."
    else
        print_status "Database reset cancelled."
    fi
}

# Seed database
db_seed() {
    print_status "Seeding database with sample data..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec backend pnpm db:seed
    print_success "Database seeded successfully."
}

# Clean up
clean() {
    print_warning "This will remove all containers and volumes!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleaning up..."
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v
        docker system prune -f
        print_success "Cleanup complete."
    else
        print_status "Cleanup cancelled."
    fi
}

# Show container status
status() {
    print_status "Container status:"
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps

    echo ""
    print_status "Service health:"

    # Check frontend
    if curl -s -f http://localhost:5173 > /dev/null 2>&1; then
        print_success "Frontend: ✓ Running (http://localhost:5173)"
    else
        print_error "Frontend: ✗ Not responding"
    fi

    # Check backend
    if curl -s -f http://localhost:3001/api/health > /dev/null 2>&1; then
        print_success "Backend: ✓ Running (http://localhost:3001)"
    else
        print_error "Backend: ✗ Not responding"
    fi

    # Check database
    if docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec postgres pg_isready -U flora_user -d flora_db > /dev/null 2>&1; then
        print_success "Database: ✓ Running"
    else
        print_error "Database: ✗ Not responding"
    fi
}

# Main script logic
case "${1:-help}" in
    setup)
        setup
        ;;
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    rebuild)
        rebuild
        ;;
    logs)
        logs
        ;;
    db-reset)
        db_reset
        ;;
    db-seed)
        db_seed
        ;;
    clean)
        clean
        ;;
    status)
        status
        ;;
    help|*)
        show_help
        ;;
esac
