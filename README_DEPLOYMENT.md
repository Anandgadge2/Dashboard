# 🚀 Quick Deployment Guide

## Check Current Deployment

### Method 1: Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Find your project
3. Check latest deployment status

### Method 2: CLI
```bash
# List all deployments
vercel ls

# View project details
vercel inspect [project-name]
```

### Method 3: Automated Check
```bash
# Update URLs in check-deployment.js first
node check-deployment.js
```

---

## Deploy Your Branch

### Quick Deploy (All)
```bash
# Make script executable (first time only)
chmod +x deploy.sh

# Deploy everything
./deploy.sh all
```

### Deploy Separately
```bash
# Backend only
./deploy.sh backend

# Frontend only
./deploy.sh frontend
```

### Manual Deploy
```bash
# Backend
cd backend
vercel --prod

# Frontend
cd frontend
vercel --prod
```

---

## First Time Setup

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login
```bash
vercel login
```

### 3. Link Projects (Optional)
```bash
cd backend
vercel link

cd ../frontend
vercel link
```

### 4. Set Environment Variables
```bash
# In Vercel Dashboard:
# Project Settings → Environment Variables
# Add all variables from .env file
```

---

## Environment Variables Checklist

### Backend (Required):
- ✅ MONGODB_URI
- ✅ JWT_SECRET
- ✅ JWT_REFRESH_SECRET
- ✅ WHATSAPP_PHONE_NUMBER_ID
- ✅ WHATSAPP_ACCESS_TOKEN
- ✅ SMTP_HOST, SMTP_USER, SMTP_PASS
- ✅ NODE_ENV=production

### Frontend (Required):
- ✅ NEXT_PUBLIC_API_URL

---

## Test Deployment

```bash
# Run automated checks
node check-deployment.js

# Or test manually:
curl https://your-backend.vercel.app/api/health
```

---

## Common Issues

### Build Fails?
```bash
# Test locally first
cd backend && npm run build
cd ../frontend && npm run build
```

### Environment Variables Not Working?
- Check in Vercel Dashboard
- Redeploy after adding variables
- Verify variable names match exactly

### API Not Responding?
- Check Vercel function logs
- Verify MongoDB connection
- Check CORS settings

---

## Useful Commands

```bash
# View deployments
vercel ls

# View logs
vercel logs --follow

# Open dashboard
vercel open

# Remove deployment
vercel remove
```
