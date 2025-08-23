#!/bin/bash

# Memory Garden Vercel Deployment Script
# This script helps you deploy to Vercel for FREE

set -e

echo "🚀 Memory Garden Vercel Deployment"
echo "=================================="

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

# Check if Vercel CLI is installed
check_vercel_cli() {
    if ! command -v vercel &> /dev/null; then
        print_status "Installing Vercel CLI..."
        npm install -g vercel
    fi
    print_success "Vercel CLI is ready"
}

# Check if git is initialized
check_git() {
    if [ ! -d ".git" ]; then
        print_status "Initializing git repository..."
        git init
        git add .
        git commit -m "Initial commit - Memory Garden v0.3"
        print_warning "Please add your GitHub remote:"
        echo "  git remote add origin https://github.com/YOUR_USERNAME/memory-garden-v0.3.git"
        echo "  git push -u origin main"
    else
        print_success "Git repository already initialized"
    fi
}

# Build the project
build_project() {
    print_status "Building project..."
    npm run build
    print_success "Project built successfully"
}

# Deploy to Vercel
deploy_to_vercel() {
    print_status "Deploying to Vercel..."
    
    if [ -z "$VERCEL_TOKEN" ]; then
        print_warning "No Vercel token found. You'll need to login manually."
        vercel --prod
    else
        vercel --prod --token $VERCEL_TOKEN
    fi
}

# Setup instructions
show_setup_instructions() {
    echo ""
    print_success "Deployment completed!"
    echo ""
    echo "📋 Next Steps:"
    echo "=============="
    echo ""
    echo "1. 🌐 Set up your database:"
    echo "   - Go to your Vercel project dashboard"
    echo "   - Click 'Storage' → 'Create Database'"
    echo "   - Choose 'Postgres' → 'Hobby' (FREE)"
    echo ""
    echo "2. 🔑 Get your database URL:"
    echo "   - Copy the connection string from your database"
    echo "   - It looks like: postgresql://..."
    echo ""
    echo "3. ☁️ Set up Cloudinary (FREE):"
    echo "   - Go to cloudinary.com and sign up"
    echo "   - Get your Cloud Name, API Key, and API Secret"
    echo ""
    echo "4. 🤖 Set up Hugging Face (FREE):"
    echo "   - Go to huggingface.co and sign up"
    echo "   - Go to Settings → Access Tokens"
    echo "   - Create a new token"
    echo ""
    echo "5. ⚙️ Configure Environment Variables:"
    echo "   - In Vercel dashboard → Settings → Environment Variables"
    echo "   - Add all the variables from env.example"
    echo ""
    echo "6. 🗄️ Initialize Database:"
    echo "   - Visit: https://your-project.vercel.app/api/setup"
    echo "   - This will create your database tables"
    echo ""
    echo "🎉 Your Memory Garden will be live at:"
    echo "   https://your-project-name.vercel.app"
    echo ""
    echo "📖 For detailed instructions, see: VERCEL_DEPLOYMENT.md"
}

# Main deployment process
main() {
    print_status "Starting Vercel deployment..."
    
    check_vercel_cli
    check_git
    build_project
    deploy_to_vercel
    show_setup_instructions
}

# Check if running with --help
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Memory Garden Vercel Deployment Script"
    echo ""
    echo "Usage:"
    echo "  ./scripts/deploy-vercel.sh          # Deploy to Vercel"
    echo "  ./scripts/deploy-vercel.sh --help   # Show this help"
    echo ""
    echo "Prerequisites:"
    echo "  - GitHub account"
    echo "  - Vercel account"
    echo "  - Node.js 18+"
    echo ""
    echo "The script will:"
    echo "  1. Install Vercel CLI if needed"
    echo "  2. Initialize git if needed"
    echo "  3. Build the project"
    echo "  4. Deploy to Vercel"
    echo "  5. Show next steps"
    exit 0
fi

main "$@" 