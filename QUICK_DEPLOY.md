# Quick Deployment Guide

## 🚀 Fast Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Login with your account

2. **Check Existing Projects:**
   - Look for your Dashboard project
   - Check deployment status
   - View recent deployments

3. **Deploy New Branch:**
   - Click "Add New Project"
   - Import from Git (GitHub/GitLab/Bitbucket)
   - Select your repository
   - Choose the branch you want to deploy
   - Configure:
     - **Root Directory**: `backend` or `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist` (backend) or `.next` (frontend)
   - Add environment variables
   - Click "Deploy"

---

### Option 2: Deploy via CLI (Fastest)

```bash
# 1. Install Vercel CLI (if not installed)
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy Backend
cd backend
vercel --prod

# 4. Deploy Frontend (in new terminal or after backend)
cd frontend
vercel --prod
```

---

## ✅ Check Current Deployment

### 1. Check Vercel Dashboard
```bash
# Open in browser
https://vercel.com/dashboard
```

### 2. Check via CLI
```bash
# List all deployments
vercel ls

# View specific project
vercel inspect [project-name]
```

### 3. Test Deployment URLs
```bash
# Backend Health Check
curl https://your-backend.vercel.app/api/health

# Frontend
# Open in browser: https://your-frontend.vercel.app
```

---

## 🔧 Environment Variables Setup

### In Vercel Dashboard:
1. Go to Project Settings
2. Click "Environment Variables"
3. Add all required variables (see DEPLOYMENT_GUIDE.md)
4. Select environments (Production, Preview, Development)
5. Redeploy after adding variables

### Via CLI:
```bash
# Add environment variable
vercel env add VARIABLE_NAME production

# List environment variables
vercel env ls

# Pull environment variables (for local testing)
vercel env pull .env.local
```

---

## 🧪 Test Deployment

### Test Backend:
```bash
# 1. Health Check
curl https://your-api.vercel.app/api/health

# 2. Test Login
curl -X POST https://your-api.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@platform.com","password":"111111"}'

# 3. Test WhatsApp Webhook
curl -X GET "https://your-api.vercel.app/webhook?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=test"
```

### Test Frontend:
1. Open URL in browser
2. Check browser console (F12)
3. Test login
4. Verify API calls work

---

## 📋 Pre-Deployment Checklist

- [ ] All code committed and pushed to Git
- [ ] Environment variables ready
- [ ] Database accessible from Vercel
- [ ] MongoDB IP whitelist updated
- [ ] WhatsApp webhook URL updated
- [ ] Build passes locally (`npm run build`)
- [ ] Tests pass (if any)

---

## 🔍 Troubleshooting

### Build Fails?
```bash
# Test build locally first
cd backend
npm run build

cd ../frontend
npm run build
```

### Environment Variables Not Working?
- Check variable names (case-sensitive)
- Verify they're set for correct environment
- Redeploy after adding variables

### API Not Responding?
- Check Vercel function logs
- Verify MongoDB connection
- Check CORS settings

---

## 📞 Quick Commands

```bash
# Deploy everything
cd backend && vercel --prod && cd ../frontend && vercel --prod

# Check status
vercel ls

# View logs
vercel logs --follow

# Open dashboard
vercel open
```
