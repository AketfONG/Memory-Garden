#!/bin/bash

# Memory Garden Deployment Script
# This script helps set up and deploy the Memory Garden application

set -e

echo "🌱 Memory Garden Deployment Script"
echo "=================================="

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

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js $(node -v) is installed"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "npm $(npm -v) is installed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed successfully"
}

# Setup environment file
setup_env() {
    if [ ! -f .env.local ]; then
        print_status "Creating .env.local file..."
        cp env.example .env.local
        print_warning "Please edit .env.local with your actual configuration values"
        print_status "Required environment variables:"
        echo "  - DATABASE_URL"
        echo "  - NEXTAUTH_SECRET"
        echo "  - CLOUDINARY_* (for file uploads)"
        echo "  - HUGGING_FACE_API_KEY (for AI generation)"
        echo "  - GOOGLE_CLIENT_* (optional, for OAuth)"
    else
        print_success ".env.local already exists"
    fi
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Check if DATABASE_URL is set
    if [ -z "$DATABASE_URL" ] && [ -f .env.local ]; then
        export $(grep -v '^#' .env.local | xargs)
    fi
    
    if [ -z "$DATABASE_URL" ]; then
        print_warning "DATABASE_URL not found. Please set it in .env.local"
        return
    fi
    
    # Generate Prisma client
    print_status "Generating Prisma client..."
    npx prisma generate
    
    # Push database schema
    print_status "Pushing database schema..."
    npx prisma db push
    
    print_success "Database setup completed"
}

# Setup sample data
setup_sample_data() {
    print_status "Setting up sample data..."
    if [ -f scripts/setup-db.js ]; then
        node scripts/setup-db.js
        print_success "Sample data created"
    else
        print_warning "Sample data script not found"
    fi
}

# Build application
build_app() {
    print_status "Building application..."
    npm run build
    print_success "Application built successfully"
}

# Start development server
start_dev() {
    print_status "Starting development server..."
    print_success "Memory Garden is running at http://localhost:3000"
    npm run dev
}

# Docker deployment
docker_deploy() {
    print_status "Setting up Docker deployment..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Starting services with Docker Compose..."
    docker-compose up -d
    
    print_success "Docker services started"
    print_status "Memory Garden is running at http://localhost:3000"
    print_status "Database is running at localhost:5432"
}

# Main deployment function
main() {
    case "${1:-dev}" in
        "dev")
            print_status "Setting up development environment..."
            check_node
            check_npm
            install_dependencies
            setup_env
            setup_database
            setup_sample_data
            start_dev
            ;;
        "docker")
            print_status "Setting up Docker deployment..."
            check_node
            check_npm
            install_dependencies
            setup_env
            docker_deploy
            ;;
        "prod")
            print_status "Setting up production build..."
            check_node
            check_npm
            install_dependencies
            setup_env
            setup_database
            build_app
            print_success "Production build completed"
            print_status "Run 'npm start' to start the production server"
            ;;
        *)
            echo "Usage: $0 {dev|docker|prod}"
            echo "  dev   - Setup and start development environment"
            echo "  docker - Setup and start with Docker Compose"
            echo "  prod  - Setup and build for production"
            exit 1
            ;;
    esac
}

# Run main function
main "$@" 