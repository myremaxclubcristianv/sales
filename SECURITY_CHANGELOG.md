# SECURITY CHANGELOG

All changes made during the Security Hardening Mission:

### 1. Database & Migrations
- Added [`supabase/migrations/009_harden_security_definer_and_grants.sql`](file:///Users/cristianvaduva/CascadeProjects/CRM%20SALES/supabase/migrations/009_harden_security_definer_and_grants.sql):
  - Added caller role authorization inside `create_insurance_client_full` (`auth.role() = 'service_role'` OR `is_admin_or_agent() = TRUE`).
  - Revoked `EXECUTE` privileges from `anon` and `PUBLIC` on `create_insurance_client_full`.
  - Granted `EXECUTE` strictly to `authenticated` and `service_role`.
- Added [`supabase/tests/security/rls_and_rpc_security_test.sql`](file:///Users/cristianvaduva/CascadeProjects/CRM%20SALES/supabase/tests/security/rls_and_rpc_security_test.sql) for automated regression testing of RLS and RPCs.

### 2. Next.js Routing & Middleware
- Updated [`src/proxy.ts`](file:///Users/cristianvaduva/CascadeProjects/CRM%20SALES/src/proxy.ts):
  - Added Defense-in-Depth for private `/api/*` routes, rejecting unauthenticated requests with HTTP 401.
  - Whitelisted public read endpoints (`/api/leads`, public `/api/properties`, public `/api/requests`).

### 3. API Route Handlers
- Updated [`src/app/api/insurance/client-full/route.ts`](file:///Users/cristianvaduva/CascadeProjects/CRM%20SALES/src/app/api/insurance/client-full/route.ts):
  - Added mandatory `supabase.auth.getUser()` check before executing full client creation.
- Updated [`src/app/api/leads/route.ts`](file:///Users/cristianvaduva/CascadeProjects/CRM%20SALES/src/app/api/leads/route.ts):
  - Sanitized database error response to prevent leaking internal PostgreSQL error details.
- Updated [`src/app/api/documents/upload/route.ts`](file:///Users/cristianvaduva/CascadeProjects/CRM%20SALES/src/app/api/documents/upload/route.ts) & [`src/app/api/properties/[id]/documents/route.ts`](file:///Users/cristianvaduva/CascadeProjects/CRM%20SALES/src/app/api/properties/%5Bid%5D/documents/route.ts):
  - Added `DANGEROUS_EXTENSIONS` check rejecting `.html`, `.svg`, `.exe`, `.php`, `.js`, etc.

### 4. Database Query Helpers
- Updated [`src/lib/db/clients.ts`](file:///Users/cristianvaduva/CascadeProjects/CRM%20SALES/src/lib/db/clients.ts):
  - Added input character sanitization in `searchClients` and `checkDuplicateClients` to eliminate PostgREST `.or(...)` filter syntax injection risks.

### 5. Repository Sanitization
- Updated [`.env.example`](file:///Users/cristianvaduva/CascadeProjects/CRM%20SALES/.env.example):
  - Replaced actual bot tokens with placeholder values.
