# Production Readiness Checklist

This document summarizes the current state of the codebase for production deployment and what should be addressed.

---

## ✅ What’s in good shape

| Area | Status |
|------|--------|
| **Secrets** | `.env` is in `.gitignore`; config uses `process.env` (MongoDB, JWT, Redis, Cloudinary, etc.). |
| **Auth** | JWT access/refresh, bcrypt password hashing, SSO token verification, `authenticate` + RBAC middleware. |
| **Security** | Helmet, CORS, body size limit (10mb). Auth routes protected; role/permission checks on sensitive routes. |
| **Errors** | Global error handler; Mongoose validation/duplicate/cast and JWT errors return proper status and messages. |
| **Logging** | Winston logger with levels; used in server and error handler. |
| **Health** | `/health` and `/api/health` endpoints; DB/Redis connect on startup; index sync (Counter, Grievance, Appointment, ChatbotFlow). |
| **Shutdown** | SIGTERM/SIGINT close DB and Redis. Unhandled rejection and uncaught exception handlers. |
| **API feedback** | Many frontend calls use `error.response?.data?.message` for user-facing toasts; `getErrorMessage` helper exists. |

---

## ⚠️ Gaps and risks (fix before / soon after production)

### 1. **Secrets and `.env` (critical)**

- **Risk:** If `backend/.env` (or any `.env`) was ever committed or is copied around, DB, JWT, Redis, Cloudinary, SMTP, etc. are exposed.
- **Action:**
  - Never commit `.env`. Use platform env vars (Vercel, Railway, etc.) or a secrets manager in production.
  - Rotate any secret that may have been in version history or shared (DB password, JWT secrets, API keys).
  - Add a pre-commit or CI check that fails if `.env` (or `*.env`) is staged.

### 2. **No API rate limiting**

- **Risk:** Brute force on login, DoS, or abuse of public/webhook endpoints.
- **Action:** Apply `express-rate-limit` in `server.ts` (e.g. global limit and stricter limit on `/api/auth/login` and `/api/auth/sso`). Optionally exempt or use a separate limit for WhatsApp webhook if needed.

### 3. **CORS is permissive**

- **Current:** `origin: true` (reflects request origin).
- **Risk:** Any site can call your API if the user has a valid token (e.g. CSRF-style abuse).
- **Action:** In production, set `origin` to your frontend URL(s) from env (e.g. `process.env.FRONTEND_URL`), or a strict allowlist.

### 4. **No automated tests**

- **Risk:** Regressions and refactors are not guarded by tests.
- **Action:** Add at least: (a) health/readiness checks, (b) auth flow tests (login, protected route, invalid token), (c) one critical API path (e.g. create grievance or company). Prefer Jest + Supertest; run in CI.

### 5. **Heavy use of `console.log` / `console.error`**

- **Current:** Hundreds of `console.*` calls in services/routes/scripts.
- **Risk:** No level control; risk of logging sensitive data; harder to ship logs to a service.
- **Action:** Replace with the existing Winston `logger` (e.g. `logger.info`, `logger.error`, `logger.warn`) and remove or gate `console.*` in production.

### 6. **Hardcoded / fallback secrets in scripts**

- **Examples:**  
  - `generateSSOToken.ts`: fallback `JWT_SECRET` (e.g. `'my-super-secret-sso-key-2026'`).  
  - Some seed scripts: fallback `MONGODB_URI` with credentials, or default passwords (`Admin@123`, `111111`).
- **Risk:** If a script is run in production or env is missing, weak or default secrets may be used.
- **Action:** Remove fallback secrets; require env (e.g. exit with clear error if `JWT_SECRET` or `MONGODB_URI` is missing). Use strong, unique default passwords only in local/dev seeds and document that they must be changed.

### 7. **Input validation**

- **Current:** Mongoose schema validation and some route-level checks (e.g. password length).
- **Risk:** Complex payloads (nested objects, arrays) may not be fully validated; possible NoSQL-style injection or bad data.
- **Action:** Consider Joi/express-validator (or similar) for request bodies on critical routes (auth, company, user, grievance, chatbot flows). Validate types, lengths, and allowed values.

---

## Optional improvements

- **Structured errors:** Return a stable `code` or `errorCode` in API errors so the frontend can branch (e.g. “session expired” vs “validation error”) without parsing messages.
- **Request ID:** Add a request-id middleware and include it in logs and error responses for tracing.
- **Audit:** You have audit logging; ensure all sensitive actions (user create/delete, company delete, permission change) are audited and that logs are retained and access-controlled in production.

---

## Summary

| Category        | Verdict |
|----------------|--------|
| **Security**   | Good base (auth, RBAC, helmet, CORS). Add rate limiting and restrict CORS origin in production; avoid any committed or fallback secrets. |
| **Reliability**| Good (error handling, health, graceful shutdown). Add tests for critical paths. |
| **Operations**  | Use env-based config and logger everywhere; no reliance on `.env` in repo or hardcoded secrets in scripts. |

**Bottom line:** The app has a solid foundation (auth, errors, logging, health, shutdown) but is **not fully production-ready** until you address: (1) secrets and `.env` handling, (2) rate limiting, (3) CORS origin restriction, and (4) removing/avoiding hardcoded or fallback secrets in scripts. Adding tests and replacing `console.*` with the logger will significantly improve production readiness and maintainability.
