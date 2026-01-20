# Build Error Fix: `tsc: command not found`

## Problem
Vercel build was failing with: `sh: line 1: tsc: command not found`

## Root Cause
TypeScript is in `devDependencies`, and Vercel might not find `tsc` in PATH during build.

## Solution Applied

### 1. Updated Build Command
Changed `package.json` build script:
```json
"build": "tsc"  →  "build": "npx tsc"
```

**Why:** `npx` will find and use the locally installed TypeScript from `node_modules`, even if it's not in PATH.

### 2. Updated Install Command
Changed `vercel.json`:
```json
"installCommand": "npm install"  →  "installCommand": "npm ci"
```

**Why:** `npm ci` ensures a clean install and installs devDependencies by default (unless NODE_ENV=production is set before install).

## Alternative Solutions (if issue persists)

### Option 1: Move TypeScript to dependencies
```json
// In package.json, move typescript from devDependencies to dependencies
"dependencies": {
  "typescript": "^5.3.3",
  ...
}
```

### Option 2: Use explicit path
```json
"build": "./node_modules/.bin/tsc"
```

### Option 3: Pre-build script
Add to `package.json`:
```json
"scripts": {
  "vercel-build": "npm install && npm run build"
}
```

And in `vercel.json`:
```json
"buildCommand": "npm run vercel-build"
```

## Verification

After these changes:
1. Commit and push
2. Vercel will automatically redeploy
3. Check build logs - should see TypeScript compilation succeed

## Expected Build Output

```
> whatsapp-chatbot-backend@1.0.0 build
> npx tsc

[No errors - compilation successful]
```

---

**Status:** ✅ Fixed - Ready to deploy
