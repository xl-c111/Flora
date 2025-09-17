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
    echo "⚠️  IMPORTANT DOCKER SAFETY WARNING ⚠️"
    echo "========================================="
    echo "❌ NEVER run 'docker system prune' or 'docker system prune -a' manually!"
    echo "❌ This will DELETE ALL your Docker projects (including school projects)!"
    echo "✅ Use './dev.sh clean' instead - it's safe and Flora-specific only"
    echo ""
    echo "Usage: ./dev.sh [command]"
    echo ""
    echo "🚀 Getting Started Commands:"
    echo "  setup     - Initial setup (build containers and setup database)"
    echo "  start     - Start development environment"
    echo "  help      - Show this help message"
    echo ""
    echo "📋 Daily Development Commands:"
    echo "  start     - Start development environment"
    echo "  stop      - Stop all containers"
    echo "  restart   - Restart all containers (if something breaks)"
    echo "  logs      - Show logs from all services (for debugging)"
    echo "  status    - Show container status and health checks"
    echo ""
    echo "🔧 Advanced Commands:"
    echo "  rebuild   - Rebuild containers with new dependencies"
    echo "  db-reset  - Reset database (DESTRUCTIVE - deletes all data)"
    echo "  db-seed   - Seed database with sample data"
    echo ""
    echo "🧹 Cleanup Commands (BE CAREFUL!):"
    echo "  clean     - ✅ SAFE: Clean up Flora containers/volumes only"
    echo "  deep-clean- ❌ DANGER: Clean up ALL Docker resources system-wide"
    echo ""
    echo "💡 Pro Tips:"
    echo "  • Use 'clean' to free up Flora space safely"
    echo "  • Never use 'deep-clean' unless you're 100% sure"
    echo "  • Always check 'status' if something isn't working"
    echo "  • Use 'logs' to see what's happening when debugging"
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
    print_warning "This will remove Flora containers and volumes!"
    print_warning "NOTE: This will NOT affect other Docker projects"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleaning up Flora project..."
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v

        # Remove only Flora images (safer approach)
        print_status "Removing Flora images..."
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml down --rmi all

        print_success "Flora cleanup complete."
        print_status "Other Docker projects were not affected."
    else
        print_status "Cleanup cancelled."
    fi
}

# Deep clean (system-wide) - separate command for safety
deep_clean() {
    print_error "🚨 EXTREME DANGER ZONE 🚨"
    print_error "This command will DESTROY ALL Docker resources on your computer!"
    print_error "This includes:"
    print_error "  ❌ ALL other Docker projects (school projects, personal projects)"
    print_error "  ❌ ALL Docker images (you'll have to re-download everything)"
    print_error "  ❌ ALL Docker volumes (all database data from other projects)"
    print_error "  ❌ ALL Docker networks"
    print_error "  ❌ ALL build cache"
    echo ""
    print_warning "If you have school projects or other work in Docker, they WILL BE DELETED!"
    print_warning "Only use this if you're 100% sure you want to delete EVERYTHING!"
    echo ""
    print_status "💡 Tip: Use './dev.sh clean' instead - it's safe and only affects Flora"
    echo ""
    read -p "🔥 Type 'I UNDERSTAND THE RISKS' to continue (or anything else to cancel): " -r
    echo
    if [[ $REPLY == "I UNDERSTAND THE RISKS" ]]; then
        print_error "Last chance! This will delete ALL Docker data on your computer!"
        read -p "Type 'DELETE EVERYTHING' to confirm: " -r
        echo
        if [[ $REPLY == "DELETE EVERYTHING" ]]; then
            print_status "💥 Deep cleaning entire Docker system..."
            docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v
            docker system prune -a -f --volumes
            print_success "💀 Deep cleanup complete - ALL Docker data deleted!"
            print_warning "You'll need to rebuild/redownload everything from scratch!"
        else
            print_success "✅ Smart choice! Deep cleanup cancelled."
        fi
    else
        print_success "✅ Smart choice! Deep cleanup cancelled."
        print_status "💡 Use './dev.sh clean' for safe Flora-only cleanup"
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
    deep-clean)
        deep_clean
        ;;
    status)
        status
        ;;
    help|*)
        show_help
        ;;
esac
