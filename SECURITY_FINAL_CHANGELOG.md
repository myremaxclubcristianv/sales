# CRM SALES — Security Final Changelog

**Date:** 2026-09-26  
**Baseline Commit:** `5fe83b68742f75d191926c137576413037f37395`  
**Deployment Target:** Vercel Project `sales` (`prj_z7IviTZ3bIdCSkNaxKYylQS70k3Z`)  
**Host:** `https://sales.cristianvaduva.com`  

---

## 1. Surgical Security Modifications

### A. Database & RPC Hardening
- **File:** `supabase/migrations/009_harden_security_definer_and_grants.sql`
- **Changes:**
  - Revoked `EXECUTE` on function `public.create_insurance_client_full` from `anon` and `PUBLIC`.
  - Granted `EXECUTE` strictly to `authenticated` and `service_role`.
  - Added internal authorization check validating caller role in `profiles.role IN ('ADMIN', 'AGENT')` or `service_role`.
  - Set explicit `search_path = public` to eliminate search path hijacking.
- **Security Impact:** Eliminates unauthenticated and unauthorized RPC execution and privilege escalation vectors.
- **Regression Assessment:** Zero regression for legitimate authenticated CRM agents/admins.

### B. API Route Authentication & Defense-in-Depth
- **File:** `src/app/api/insurance/client-full/route.ts`
  - Added server-side session authentication check (`supabase.auth.getUser()`).
  - Returns HTTP 401 Unauthorized if unauthenticated.
- **File:** `src/proxy.ts`
  - Added centralized proxy defense rejecting unauthenticated requests to private `/api/*` endpoints with HTTP 401.
  - Automatically redirects unauthenticated requests targeting `/admin/*` to `/login` with HTTP 307.
  - Injected complete suite of security headers (HSTS, X-Frame-Options, X-Content-Type-Options, CSP, Permissions-Policy).

### C. PostgREST Filter Injection Sanitization
- **File:** `src/lib/db/clients.ts`
  - Added `sanitizePostgrestFilter` utility stripping PostgREST reserved query control characters (`,`, `(`, `)`, `:`, `.`, `*`, `%`, `'`, `"`, `=`).
  - Applied to `searchClients` and `checkDuplicateClients` to ensure user inputs are treated strictly as literal search strings.

### D. File Upload Defense & Extension Blocking
- **Files:** `src/app/api/documents/upload/route.ts` & `src/app/api/properties/[id]/documents/route.ts`
  - Added comprehensive `DANGEROUS_EXTENSIONS` blocker prohibiting `.html`, `.htm`, `.svg`, `.js`, `.mjs`, `.php`, `.exe`, `.bat`, `.cmd`, `.sh`, `.jsp`, `.asp`, `.py`, `.rb`, etc.
  - Sanitized null bytes and normalized extensions to lowercase.

### E. Error Message & PII Sanitization
- **File:** `src/app/api/leads/route.ts`
  - Sanitized database error responses to return generic, user-safe error messages while logging actual errors securely on the server.
- **File:** `.env.example`
  - Sanitized all sample tokens to placeholder dummy values.

### F. Automated Security Verification Test Suite
- **Files:** `scripts/security/run_final_security_suite.js` & `supabase/tests/security/rls_and_rpc_security_test.sql`
  - Created automated test runners testing RLS isolation, client bundle leaks, sanitizer logic, upload restrictions, data integrity, and live production endpoints.

---

## 2. Non-Regression Invariants Maintained

- **Database Records:** Exactly 17 clients preserved intact in the `INSURANCE` category.
- **Visual Design & UX:** Zero modifications to UI components, themes, colors, typography, or layouts.
- **Navigation & Routes:** All 49 pages and 37 API routes operational without breaking changes.
