#!/bin/bash

# Memory Garden Development Setup Script

echo "🌱 Setting up Memory Garden for local development..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

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

# Clean up any existing build artifacts
clean_build() {
    print_status "Cleaning build artifacts..."
    rm -rf .next
    rm -rf node_modules/.cache
    print_success "Build artifacts cleaned"
}

# Install dependencies
install_deps() {
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
}

# Generate Prisma client
generate_prisma() {
    print_status "Generating Prisma client..."
    npx prisma generate
    print_success "Prisma client generated"
}

# Setup environment file
setup_env() {
    if [ ! -f .env.local ]; then
        print_status "Creating .env.local file..."
        cp env.local.example .env.local
        print_warning "Please edit .env.local with your actual values"
        print_status "For local development, you can use placeholder values for now"
    else
        print_success ".env.local already exists"
    fi
}

# Start development server
start_dev() {
    print_status "Starting development server..."
    print_success "Memory Garden will be available at http://localhost:3000"
    print_warning "Note: Some features (database, file upload, AI) will need proper configuration"
    npm run dev
}

# Main setup process
main() {
    clean_build
    install_deps
    generate_prisma
    setup_env
    start_dev
}

main "$@" 