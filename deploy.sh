#!/bin/bash

# Deployment Script for Dashboard Project
# Usage: ./deploy.sh [backend|frontend|all]

set -e

DEPLOY_TARGET=${1:-all}

echo "🚀 Starting Deployment Process..."
echo "Target: $DEPLOY_TARGET"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

deploy_backend() {
    echo -e "${BLUE}📦 Deploying Backend...${NC}"
    cd backend
    
    echo "   ✓ Building backend..."
    npm run build
    
    echo "   ✓ Deploying to Vercel..."
    vercel --prod
    
    cd ..
    echo -e "${GREEN}✅ Backend deployed!${NC}"
}

deploy_frontend() {
    echo -e "${BLUE}📦 Deploying Frontend...${NC}"
    cd frontend
    
    echo "   ✓ Building frontend..."
    npm run build
    
    echo "   ✓ Deploying to Vercel..."
    vercel --prod
    
    cd ..
    echo -e "${GREEN}✅ Frontend deployed!${NC}"
}

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

# Deploy based on target
case $DEPLOY_TARGET in
    backend)
        deploy_backend
        ;;
    frontend)
        deploy_frontend
        ;;
    all)
        deploy_backend
        echo ""
        deploy_frontend
        ;;
    *)
        echo "Usage: ./deploy.sh [backend|frontend|all]"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Check deployment status: vercel ls"
echo "2. View logs: vercel logs --follow"
echo "3. Test deployment: node check-deployment.js"
