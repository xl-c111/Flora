#!/bin/bash

# Windows Development Script for Flora
# This script helps Windows users run the full Docker setup with volume sync

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop first."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to start services
start_services() {
    print_status "Starting Flora in full Docker mode for Windows..."
    print_status "This will:"
    echo "  • Run all services in containers"
    echo "  • Install dependencies automatically"
    echo "  • Sync node_modules for VS Code IntelliSense"
    echo "  • Enable hot reload for development"
    echo ""
    
    # Use the Windows-specific compose file
    docker-compose -f docker-compose.yml -f docker-compose.windows.yml up --build
}

# Function to start services in background
start_bg() {
    print_status "Starting Flora in background mode..."
    docker-compose -f docker-compose.yml -f docker-compose.windows.yml up --build -d
    
    print_success "Services started in background!"
    print_status "Access points:"
    echo "  • Frontend: http://localhost:5173"
    echo "  • Backend API: http://localhost:3001"
    echo "  • API Health: http://localhost:3001/api/health"
    echo ""
    echo "Use './dev-windows.sh logs' to see what's happening"
    echo "Use './dev-windows.sh stop' to stop services"
}

# Function to stop services
stop_services() {
    print_status "Stopping Flora services..."
    docker-compose -f docker-compose.yml -f docker-compose.windows.yml down
    print_success "All services stopped"
}

# Function to restart services
restart_services() {
    print_status "Restarting Flora services..."
    stop_services
    sleep 2
    start_bg
}

# Function to show logs
show_logs() {
    print_status "Showing service logs (Ctrl+C to exit)..."
    docker-compose -f docker-compose.yml -f docker-compose.windows.yml logs -f
}

# Function to check service status
check_status() {
    print_status "Checking service status..."
    docker-compose -f docker-compose.yml -f docker-compose.windows.yml ps
    
    echo ""
    print_status "Testing API health..."
    if curl -f -s http://localhost:3001/api/health >/dev/null 2>&1; then
        print_success "✅ Backend API is healthy"
    else
        print_warning "❌ Backend API is not responding"
    fi
    
    if curl -f -s http://localhost:5173 >/dev/null 2>&1; then
        print_success "✅ Frontend is running"
    else
        print_warning "❌ Frontend is not responding"
    fi
}

# Function to clean up everything
clean_all() {
    print_warning "This will remove all containers, volumes, and images!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleaning up..."
        docker-compose -f docker-compose.yml -f docker-compose.windows.yml down -v --rmi all
        print_success "Cleanup complete"
    else
        print_status "Cleanup cancelled"
    fi
}

# Function to setup database
setup_db() {
    print_status "Setting up database..."
    docker-compose -f docker-compose.yml -f docker-compose.windows.yml exec backend sh -c "npx prisma migrate deploy && npx prisma db seed"
    print_success "Database setup complete"
}

# Function to show help
show_help() {
    echo "Flora Windows Development Helper"
    echo ""
    echo "Usage: ./dev-windows.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start       Start all services (foreground with logs)"
    echo "  bg          Start all services in background"
    echo "  stop        Stop all services"
    echo "  restart     Restart all services"
    echo "  logs        Show service logs"
    echo "  status      Check service status and health"
    echo "  db-setup    Setup database (migrations + seed)"
    echo "  clean       Remove all containers and volumes"
    echo "  help        Show this help message"
    echo ""
    echo "Quick start:"
    echo "  ./dev-windows.sh bg      # Start everything in background"
    echo "  ./dev-windows.sh status  # Check if everything is working"
    echo ""
    echo "Access points:"
    echo "  Frontend: http://localhost:5173"
    echo "  Backend:  http://localhost:3001"
    echo "  API Health: http://localhost:3001/api/health"
}

# Main script logic
case "${1:-help}" in
    start)
        check_docker
        start_services
        ;;
    bg|background)
        check_docker
        start_bg
        ;;
    stop)
        stop_services
        ;;
    restart)
        check_docker
        restart_services
        ;;
    logs)
        show_logs
        ;;
    status)
        check_status
        ;;
    db-setup)
        setup_db
        ;;
    clean)
        clean_all
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
