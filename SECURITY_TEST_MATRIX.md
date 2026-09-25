# SECURITY TEST MATRIX & VULNERABILITY AUDIT

| ID | AREA | TEST DESCRIPTION | EXPECTED BEHAVIOR | ACTUAL STATUS | SEVERITY | EVIDENCE / NOTES | FIX IMPLEMENTED | REGRESSION STATUS |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-001** | Authentication | Unauthenticated access to `/admin` routes | Redirect to `/login` | PASS | HIGH | Browser/curl redirect with HTTP 307 | Enforced in `src/proxy.ts` | PASS |
| **SEC-002** | Authorization | Unauthenticated direct POST to `/api/insurance/client-full` | HTTP 401 Unauthorized | PASS | HIGH | Direct curl test rejected with 401 | Added `getUser()` check & proxy defense | PASS |
| **SEC-003** | Database / RPC | Anonymous direct RPC invoke of `create_insurance_client_full` | Permission denied / Unauthorized | PASS | HIGH | Verified via `rls_and_rpc_security_test.sql` | Revoked anon grant & added role check | PASS |
| **SEC-004** | RLS Privacy | Anonymous SELECT on `public.clients` | 0 rows returned | PASS | CRITICAL | Query returns 0 rows for `anon` | Strict RLS policy enforced | PASS |
| **SEC-005** | RLS Privacy | Anonymous SELECT on `public.contacts` | 0 rows returned | PASS | CRITICAL | Query returns 0 rows for `anon` | Strict RLS policy enforced | PASS |
| **SEC-006** | RLS Privacy | Anonymous SELECT on `public.insurance_policies` | 0 rows returned | PASS | CRITICAL | Query returns 0 rows for `anon` | Strict RLS policy enforced | PASS |
| **SEC-007** | RLS Privacy | Anonymous SELECT on `public.documents` | 0 rows returned | PASS | CRITICAL | Query returns 0 rows for `anon` | Strict RLS policy enforced | PASS |
| **SEC-008** | Storage | Anonymous listing or direct access to private `documents` bucket | Access denied / 0 objects | PASS | HIGH | Bucket `public: false`, RLS active | Authenticated-only RLS policy | PASS |
| **SEC-009** | File Upload | Upload of executable/HTML files (`.html`, `.exe`, `.svg`, `.php`) | HTTP 400 Bad Request | PASS | MEDIUM | Dangerous extension rejected | Added `DANGEROUS_EXTENSIONS` filter | PASS |
| **SEC-010** | Injection | PostgREST `.or(...)` filter syntax injection via name/phone | Sanitized query string | PASS | MEDIUM | Parameters sanitized with regex | Sanitized in `src/lib/db/clients.ts` | PASS |
| **SEC-011** | CSV Injection | Formula injection (`=cmd`, `+SUM`, `-cmd`, `@cmd`) in CSV import | Escaped / prepended quote | PASS | MEDIUM | Verified with `sanitizeSpreadsheetValue` | `sanitizeSpreadsheetValue` in `csv.ts` | PASS |
| **SEC-012** | Information Leak | Database internal constraint errors in public lead endpoint | Generic friendly error message | PASS | LOW | Raw error message prevented | Sanitized response in `/api/leads` | PASS |
| **SEC-013** | Secrets | Telegram bot token committed in `.env.example` | Placeholder values | PASS | LOW | Replaced with `your_telegram_bot_token_here` | Sanitized `.env.example` | PASS |
| **SEC-014** | Rate Limiting | Spamming public `/api/leads` contact endpoint | HTTP 429 Too Many Requests | PASS | MEDIUM | Rate limiter triggers after 10 req/min | `checkRateLimit` sliding window | PASS |
| **SEC-015** | Security Headers | HSTS, X-Frame-Options, X-Content-Type-Options, CSP | Headers present on all responses | PASS | MEDIUM | Verified via HTTP response headers | Configured in `src/proxy.ts` | PASS |
| **SEC-016** | Dependencies | Known vulnerabilities in npm dependencies | 0 vulnerabilities | PASS | LOW | `npm audit` returned 0 vulnerabilities | Audited package tree | PASS |
| **SEC-017** | CSRF / CORS | SameSite cookie protection & Origin validation | Cookies protected against cross-site misuse | PASS | MEDIUM | SameSite=Lax/Strict on Supabase SSR cookies | Standard Supabase SSR cookie auth | PASS |
| **SEC-018** | Mass Assignment | Ingestion of arbitrary role/admin fields in contact/client forms | Whitelisted DB insert fields | PASS | MEDIUM | Explicit payload mapping in CRUD APIs | Whitelisted parameter mappings | PASS |
| **SEC-019** | Stored XSS | Malicious script payloads in client names/notes | Rendered as text / React escaped | PASS | HIGH | React 19 JSX auto-escapes string children | Native React escaping, no `innerHTML` | PASS |
| **SEC-020** | Data Integrity | Production client records preserved during security audits | Exactly 17 clients in DB | PASS | CRITICAL | Database query confirms 17 clients intact | Strict non-destructive policies | PASS |
