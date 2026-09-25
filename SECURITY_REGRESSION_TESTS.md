# SECURITY REGRESSION TESTS

This document outlines the security regression testing procedure and verification results.

### 1. Database & RLS Regression Suite
Run via Supabase CLI:
```bash
npx supabase db query --linked -f supabase/tests/security/rls_and_rpc_security_test.sql
```
- **Test 1:** Anonymous execution of `create_insurance_client_full` → `BLOCKED / PERMISSION DENIED` (PASS)
- **Test 2:** Anonymous SELECT on `public.clients` → `0 rows` (PASS)
- **Test 3:** Anonymous SELECT on `public.contacts` → `0 rows` (PASS)
- **Test 4:** Anonymous SELECT on `public.insurance_policies` → `0 rows` (PASS)
- **Test 5:** Anonymous SELECT on `public.documents` → `0 rows` (PASS)
- **Test 6:** Anonymous SELECT on `public.audit_logs` → `0 rows` (PASS)

### 2. Static Code & Build Quality Checks
- `npm run lint` → `PASS (0 errors, 0 warnings)`
- `npx tsc --noEmit` → `PASS (0 errors)`
- `npm run build` → `PASS (49/49 routes compiled successfully)`
- `npm audit` → `PASS (0 vulnerabilities)`

### 3. Live Functional Smoke Tests
- Public Home (`/`) → HTTP 200 (PASS)
- Public Properties (`/properties`) → HTTP 200 (PASS)
- Public Contact (`/contact`) → HTTP 200 (PASS)
- Login Page (`/login`) → HTTP 200 (PASS)
- Unauthenticated Admin (`/admin/clients`) → HTTP 307 Redirect (PASS)
- Unauthenticated Private API (`/api/contacts`) → HTTP 401 Unauthorized (PASS)
- Unauthenticated RPC (`/api/insurance/client-full`) → HTTP 401 Unauthorized (PASS)
- Public Inbound Leads (`/api/leads`) → Accessible with rate-limiting & honeypot (PASS)
- Existing Client Dataset Integrity → Exactly 17 records in `INSURANCE` category (PASS)
