# 🏭 Production Deployment Guide

## Table of Contents
1. [Quick Start](#quick-start)
2. [Port Conflict Resolution](#port-conflict-resolution)
3. [Production Scripts](#production-scripts)
4. [Monitoring & Health Checks](#monitoring--health-checks)
5. [Troubleshooting](#troubleshooting)
6. [Best Practices](#best-practices)

---

## Quick Start

### Option 1: Automated Production Start (Recommended)
```bash
cd backend
npm run dev:prod
```

This script automatically:
- ✅ Detects and resolves port conflicts
- ✅ Cleans up zombie processes
- ✅ Retries on failure (up to 3 attempts)
- ✅ Provides detailed error messages

### Option 2: Manual Start
```bash
cd backend

# Kill any processes on port 5000
npm run kill:port 5000

# Start server
npm run dev
```

---

## Port Conflict Resolution

### Problem: `EADDRINUSE: address already in use`

This happens when port 5000 is occupied by another process.

### Automated Solution
```bash
npm run dev:prod
```

The script will automatically detect and kill conflicting processes.

### Manual Solutions

#### Windows

**Option 1: Kill specific port**
```bash
npm run kill:port 5000
```

**Option 2: Kill all Node processes**
```bash
taskkill /F /IM node.exe /T
```

**Option 3: Find and kill manually**
```bash
# Find process using port
netstat -ano | findstr :5000

# Kill specific PID
taskkill /F /PID [PID_NUMBER]
```

#### Linux/Mac
```bash
# Find and kill process on port 5000
lsof -ti :5000 | xargs kill -9

# Or use the npm script
npm run kill:port 5000
```

---

## Production Scripts

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Standard development server |
| **`npm run dev:prod`** | **Production-grade start with auto-recovery** |
| `npm run kill:port [port]` | Kill process on specific port (default: 5000) |
| `npm run health` | Check if server is healthy |
| `npm run build` | Build for production |
| `npm start` | Run built production code |

### Script Details

#### `dev:prod` - Production Development Mode
```bash
npm run dev:prod
```

**Features:**
- Automatic port conflict detection
- Process cleanup (kills zombie processes)
- Retry logic (3 attempts with 2s delay)
- Detailed error reporting
- Graceful shutdown handling

**When to use:**
- Production testing
- After crashes or unclean shutdowns
- When encountering port conflicts
- CI/CD pipelines

#### `kill:port` - Port Cleanup
```bash
# Kill default port (5000)
npm run kill:port

# Kill custom port
npm run kill:port 8080
```

#### `health` - Health Check
```bash
npm run health
```

Checks:
- ✅ Health endpoint (`/health`)
- ✅ API health (`/api/health`)
- ✅ Webhook endpoint (`/webhook`)

---

## Monitoring & Health Checks

### Health Endpoints

#### 1. Basic Health Check
```bash
GET /health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2026-01-27T12:54:02.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

#### 2. Detailed API Health
```bash
GET /api/health
```

Response includes:
- Database connection status
- Redis connection status
- System metrics

### Automated Health Check
```bash
npm run health
```

Example output:
```
🏥 Health Check: http://localhost:5000
==================================================
✅ Health Endpoint: 200 OK
✅ API Health: 200 OK
✅ Webhook (GET): 200 OK
==================================================
✅ All systems operational
```

### Continuous Monitoring

Add to your monitoring tool (e.g., PM2, Docker healthcheck):
```bash
# Simple
curl http://localhost:5000/health

# Detailed
npm run health
```

---

## Troubleshooting

### Issue 1: Port Already in Use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Automated
npm run dev:prod

# Manual
npm run kill:port 5000
npm run dev
```

**Prevention:**
- Always use `Ctrl+C` to stop the server (graceful shutdown)
- Use `npm run dev:prod` which handles this automatically

---

### Issue 2: Multiple Node Processes Running

**Symptoms:**
- Server won't start
- Port conflicts even after killing processes
- Multiple terminals show running servers

**Solution:**
```bash
# Windows: Kill ALL Node processes
taskkill /F /IM node.exe /T

# Then start fresh
npm run dev:prod
```

**Prevention:**
- Close terminals properly
- Use production scripts that handle cleanup
- Monitor running processes

---

### Issue 3: Server Crashes Silently

**Symptoms:**
- No error messages
- Process exits without logs
- Webhook requests fail

**Solution:**
1. Check logs in `c:\Users\[username]\.cursor\projects\c-Dashboard\terminals\`
2. Look for uncaught exceptions
3. Verify environment variables in `.env`

**Debug mode:**
```bash
# Set debug logging
set DEBUG=*
npm run dev
```

---

### Issue 4: WhatsApp Webhook Errors

**Symptoms:**
```
❌ System Error
We could not process your request at this moment
```

**Solution:**
1. **Check server is running:**
   ```bash
   npm run health
   ```

2. **Check server logs for actual error:**
   ```bash
   # Windows
   Get-Content "c:\Users\[username]\.cursor\projects\c-Dashboard\terminals\[terminal_id].txt" -Tail 100
   ```

3. **Common causes:**
   - Database not connected
   - Missing environment variables
   - Port conflicts (server not actually running)
   - Null/undefined data in session

**Prevention:**
- Use `npm run dev:prod` for reliable startup
- Monitor health endpoints
- Check logs regularly

---

## Best Practices

### 1. Starting the Server

**❌ Don't:**
```bash
npm run dev  # May fail if port is occupied
```

**✅ Do:**
```bash
npm run dev:prod  # Handles conflicts automatically
```

### 2. Stopping the Server

**❌ Don't:**
- Close terminal window directly
- Kill process manager
- Force shutdown without cleanup

**✅ Do:**
- Press `Ctrl+C` for graceful shutdown
- Wait for "Shutting down gracefully..." message
- Verify port is freed: `npm run kill:port`

### 3. Deployment Checklist

Before deploying to production:

- [ ] Run `npm run health` to verify all endpoints
- [ ] Check `.env` file has all required variables
- [ ] Verify MongoDB connection string
- [ ] Test WhatsApp webhook integration
- [ ] Confirm Cloudinary credentials
- [ ] Run `npm run build` successfully
- [ ] Test with `npm start` (production mode)
- [ ] Set up monitoring/health checks
- [ ] Configure process manager (PM2/Docker)

### 4. Environment Variables

Required for production:
```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://...

# WhatsApp
WHATSAPP_PHONE_NUMBER_ID=944323278765424
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_BUSINESS_ACCOUNT_ID=...
WHATSAPP_VERIFY_TOKEN=...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# JWT
JWT_SECRET=...
JWT_EXPIRES_IN=7d

# Optional
REDIS_HOST=...
REDIS_PORT=6379
REDIS_PASSWORD=...
```

### 5. Process Management

#### Using PM2 (Recommended for production)
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start npm --name "dashboard-backend" -- run start

# Monitor
pm2 status
pm2 logs dashboard-backend

# Auto-restart on crash
pm2 startup
pm2 save
```

#### Using Docker
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node scripts/health-check.js || exit 1
CMD ["npm", "start"]
```

---

## Quick Reference

### Common Commands
```bash
# Start (production-grade)
npm run dev:prod

# Kill port conflicts
npm run kill:port

# Health check
npm run health

# View logs (Windows)
Get-Content "path\to\terminals\12.txt" -Tail 50 -Wait

# Emergency: Kill all Node
taskkill /F /IM node.exe /T
```

### Success Indicators
```
✅ Cloudinary configured successfully
✅ ID counters initialized
🚀 Server running on port 5000
```

### Error Indicators
```
❌ Port 5000 is already in use
❌ Failed to connect to MongoDB
❌ WHATSAPP_PHONE_NUMBER_ID not set
```

---

## Support

For issues:
1. Check this guide
2. Run `npm run health`
3. Check server logs
4. Verify `.env` configuration
5. Try `npm run dev:prod` for auto-recovery

**Pro Tip:** Always use `npm run dev:prod` for production testing to avoid 90% of common issues!
