#!/bin/bash

# Memory Garden Production Build Script

set -e

echo "🏗️  Memory Garden Production Build"
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check environment
check_env() {
    print_status "Checking environment..."
    
    if [ ! -f .env.local ]; then
        print_error ".env.local not found. Please create it from env.example"
        exit 1
    fi
    
    # Check required environment variables
    source .env.local
    
    required_vars=("DATABASE_URL" "NEXTAUTH_SECRET" "NEXTAUTH_URL")
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            print_error "Required environment variable $var is not set"
            exit 1
        fi
    done
    
    print_success "Environment check passed"
}

# Clean previous builds
clean_build() {
    print_status "Cleaning previous builds..."
    rm -rf .next
    rm -rf node_modules/.cache
    print_success "Clean completed"
}

# Install dependencies
install_deps() {
    print_status "Installing dependencies..."
    npm ci --only=production
    print_success "Dependencies installed"
}

# Generate Prisma client
generate_prisma() {
    print_status "Generating Prisma client..."
    npx prisma generate
    print_success "Prisma client generated"
}

# Build application
build_app() {
    print_status "Building application..."
    npm run build
    print_success "Application built successfully"
}

# Create deployment package
create_package() {
    print_status "Creating deployment package..."
    
    # Create dist directory
    mkdir -p dist
    
    # Copy necessary files
    cp -r .next dist/
    cp -r public dist/
    cp -r node_modules dist/
    cp package.json dist/
    cp next.config.ts dist/
    cp -r prisma dist/
    cp .env.local dist/
    
    # Create start script
    cat > dist/start.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
npm start
EOF
    chmod +x dist/start.sh
    
    print_success "Deployment package created in dist/"
}

# Main build process
main() {
    check_env
    clean_build
    install_deps
    generate_prisma
    build_app
    create_package
    
    echo ""
    print_success "Production build completed!"
    echo ""
    echo "📦 Deployment package is ready in the 'dist' directory"
    echo "🚀 To deploy:"
    echo "   1. Copy the 'dist' directory to your server"
    echo "   2. Run: cd dist && ./start.sh"
    echo ""
    echo "🌐 Or deploy to Vercel:"
    echo "   vercel --prod"
}

main "$@" 