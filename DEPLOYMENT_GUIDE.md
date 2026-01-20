# Deployment Guide - Dashboard Project

## Overview

This guide covers how to check and deploy your Dashboard project branch to production.

## Current Setup

Based on your project structure:
- **Frontend**: Next.js application (ready for Vercel)
- **Backend**: Node.js/Express API (ready for Vercel)
- **Database**: MongoDB (cloud-hosted)
- **Deployment Platform**: Vercel (based on `vercel.json` files)

---

## Pre-Deployment Checklist

### ✅ 1. Environment Variables

Ensure all environment variables are set in your deployment platform:

#### Backend Environment Variables:
```env
# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# WhatsApp API
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_VERIFY_TOKEN=your_verify_token

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM_NAME=Zilla Parishad Amravati

# Server
NODE_ENV=production
PORT=5000

# Cloudinary (if using media uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Frontend Environment Variables:
```env
NEXT_PUBLIC_API_URL=https://your-backend-api.vercel.app
NEXT_PUBLIC_APP_NAME=Zilla Parishad Dashboard
```

---

## Deployment Methods

### Method 1: Vercel Deployment (Recommended)

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```

#### Step 3: Deploy Backend
```bash
cd backend
vercel --prod
```

#### Step 4: Deploy Frontend
```bash
cd frontend
vercel --prod
```

#### Step 5: Link Projects (if needed)
```bash
# In backend directory
vercel link

# In frontend directory
vercel link
```

---

### Method 2: Vercel Dashboard (Web UI)

#### Backend Deployment:
1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your Git repository
4. Select the **backend** folder
5. Configure:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
   - **Root Directory**: `backend`
6. Add all environment variables
7. Click **"Deploy"**

#### Frontend Deployment:
1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your Git repository
4. Select the **frontend** folder
5. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build` (auto)
   - **Output Directory**: `.next` (auto)
   - **Install Command**: `npm install` (auto)
   - **Root Directory**: `frontend`
6. Add environment variables
7. Click **"Deploy"**

---

### Method 3: Git-Based Auto-Deployment

#### Setup Auto-Deploy from Branch:

1. **Connect Repository to Vercel:**
   - Go to Vercel Dashboard
   - Click **"Add New Project"**
   - Import from GitHub/GitLab/Bitbucket
   - Select your repository

2. **Configure Project Settings:**
   - **Production Branch**: `main` or `master`
   - **Framework**: Auto-detect
   - **Root Directory**: `backend` or `frontend`

3. **Set Environment Variables:**
   - Add all required environment variables
   - Mark sensitive ones as "Encrypted"

4. **Auto-Deploy:**
   - Every push to `main` branch = Auto-deploy
   - Pull requests = Preview deployments

---

## Checking Deployment Status

### 1. Check Vercel Dashboard
- Go to [vercel.com/dashboard](https://vercel.com/dashboard)
- View deployment status
- Check build logs
- Monitor function logs

### 2. Check Deployment URLs
```bash
# Backend API
https://your-backend-project.vercel.app

# Frontend
https://your-frontend-project.vercel.app
```

### 3. Test API Endpoints
```bash
# Health check
curl https://your-backend-project.vercel.app/api/health

# Test login
curl -X POST https://your-backend-project.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@platform.com","password":"111111"}'
```

### 4. Test Frontend
- Open frontend URL in browser
- Check console for errors
- Test login functionality
- Verify API connectivity

---

## Post-Deployment Verification

### ✅ Backend Checks:

1. **API Health:**
   ```bash
   GET https://your-api.vercel.app/api/health
   ```

2. **Database Connection:**
   - Check Vercel function logs
   - Verify MongoDB connection

3. **WhatsApp Webhook:**
   - Update webhook URL in Meta Business Manager
   - Test webhook verification
   - Send test message

4. **Email Service:**
   - Test email sending
   - Check SMTP configuration

### ✅ Frontend Checks:

1. **Build Success:**
   - Check Vercel build logs
   - Verify no build errors

2. **API Connection:**
   - Check browser console
   - Verify API calls work
   - Test authentication

3. **Environment Variables:**
   - Verify `NEXT_PUBLIC_API_URL` is set
   - Check API calls use correct URL

---

## Deployment Commands Reference

### Local Testing (Before Deployment):
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

### Vercel CLI Commands:
```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# View deployments
vercel ls

# View logs
vercel logs

# Remove deployment
vercel remove
```

### Git Commands (for branch deployment):
```bash
# Create deployment branch
git checkout -b deploy/production

# Push to trigger deployment
git push origin deploy/production

# Merge to main for auto-deploy
git checkout main
git merge deploy/production
git push origin main
```

---

## Troubleshooting

### Issue: Build Fails
**Solution:**
- Check build logs in Vercel
- Verify all dependencies in `package.json`
- Check TypeScript errors: `npm run build` locally
- Ensure Node.js version matches (check `package.json` engines)

### Issue: Environment Variables Not Working
**Solution:**
- Verify variables are set in Vercel dashboard
- Check variable names match exactly
- Redeploy after adding variables
- Use `vercel env pull` to sync locally

### Issue: API Not Responding
**Solution:**
- Check Vercel function logs
- Verify MongoDB connection string
- Check CORS settings
- Verify API routes are correct

### Issue: Frontend Can't Connect to API
**Solution:**
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS on backend
- Verify API is deployed and accessible
- Check browser console for errors

### Issue: Database Connection Fails
**Solution:**
- Verify MongoDB URI is correct
- Check IP whitelist in MongoDB Atlas
- Verify network access settings
- Check connection string format

---

## Production Checklist

Before going live:

- [ ] All environment variables set
- [ ] Database connection working
- [ ] API endpoints tested
- [ ] Frontend builds successfully
- [ ] Authentication working
- [ ] WhatsApp webhook configured
- [ ] Email service tested
- [ ] Error logging configured
- [ ] Monitoring set up
- [ ] Backup strategy in place
- [ ] SSL certificates active
- [ ] CORS configured correctly
- [ ] Rate limiting enabled (if needed)
- [ ] Security headers set

---

## Monitoring & Maintenance

### 1. Vercel Analytics
- Enable Vercel Analytics
- Monitor performance
- Track errors

### 2. Log Monitoring
```bash
# View real-time logs
vercel logs --follow

# View specific deployment logs
vercel logs [deployment-url]
```

### 3. Health Checks
- Set up uptime monitoring
- Configure alerts
- Monitor API response times

---

## Quick Deployment Script

Create `deploy.sh`:
```bash
#!/bin/bash

echo "🚀 Starting deployment..."

# Build backend
echo "📦 Building backend..."
cd backend
npm run build
cd ..

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm run build
cd ..

# Deploy backend
echo "🚀 Deploying backend..."
cd backend
vercel --prod
cd ..

# Deploy frontend
echo "🚀 Deploying frontend..."
cd frontend
vercel --prod
cd ..

echo "✅ Deployment complete!"
```

Make it executable:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## Branch-Specific Deployment

### Deploy Specific Branch:

1. **Create Branch:**
   ```bash
   git checkout -b production
   git push origin production
   ```

2. **Deploy Branch:**
   - In Vercel, create new project
   - Select branch: `production`
   - Configure as above

3. **Or Use Vercel CLI:**
   ```bash
   vercel --prod --branch production
   ```

---

## Next Steps

1. **Set up monitoring** (Vercel Analytics, Sentry, etc.)
2. **Configure custom domain** (if needed)
3. **Set up CI/CD** (GitHub Actions, etc.)
4. **Enable backups** (database, files)
5. **Configure alerts** (errors, downtime)

---

## Support

If you encounter issues:
1. Check Vercel documentation
2. Review build logs
3. Check environment variables
4. Verify database connectivity
5. Test locally first

---

## Quick Commands Summary

```bash
# Deploy everything
cd backend && vercel --prod && cd ../frontend && vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs --follow

# Pull environment variables
vercel env pull

# Test locally (production build)
cd backend && npm run build && npm start
cd frontend && npm run build && npm start
```
