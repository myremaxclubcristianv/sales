# CRM SALES — Security Route Matrix

**Target Repository:** `/Users/cristianvaduva/CascadeProjects/CRM SALES`  
**Production URL:** `https://sales.cristianvaduva.com`  
**Version:** Next.js 16.3.5 App Router  

---

## 1. Public Web & Legal Routes

| Route | Method | Public? | Auth Required? | Role Required? | Object Auth? | Rate Limited? | Input Validation? | Output Sanitization? | CSRF Consideration? | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `/` | GET | Yes | No | None | N/A | CDN Cached | N/A | React JSX Encoded | N/A | SECURE |
| `/properties` | GET | Yes | No | None | Public filter | CDN Cached | Query params | React JSX Encoded | N/A | SECURE |
| `/properties/[slug]` | GET | Yes | No | None | Public filter | CDN Cached | Slug param | React JSX Encoded | N/A | SECURE |
| `/requests` | GET | Yes | No | None | Public filter | CDN Cached | Query params | React JSX Encoded | N/A | SECURE |
| `/requests/[id]` | GET | Yes | No | None | Public filter | CDN Cached | ID param | React JSX Encoded | N/A | SECURE |
| `/about` | GET | Yes | No | None | N/A | Static | N/A | React JSX Encoded | N/A | SECURE |
| `/contact` | GET | Yes | No | None | N/A | Static | N/A | React JSX Encoded | N/A | SECURE |
| `/legal` | GET | Yes | No | None | N/A | Static | N/A | React JSX Encoded | N/A | SECURE |
| `/privacy-policy` | GET | Yes | No | None | N/A | Static | N/A | React JSX Encoded | N/A | SECURE |
| `/cookie-policy` | GET | Yes | No | None | N/A | Static | N/A | React JSX Encoded | N/A | SECURE |
| `/gdpr` | GET | Yes | No | None | N/A | Static | N/A | React JSX Encoded | N/A | SECURE |
| `/data-protection` | GET | Yes | No | None | N/A | Static | N/A | React JSX Encoded | N/A | SECURE |
| `/terms` | GET | Yes | No | None | N/A | Static | N/A | React JSX Encoded | N/A | SECURE |
| `/marketing-consent` | GET | Yes | No | None | N/A | Static | N/A | React JSX Encoded | N/A | SECURE |
| `/imprint` | GET | Yes | No | None | N/A | Static | N/A | React JSX Encoded | N/A | SECURE |
| `/accessibility` | GET | Yes | No | None | N/A | Static | N/A | React JSX Encoded | N/A | SECURE |
| `/complaints` | GET | Yes | No | None | N/A | Static | N/A | React JSX Encoded | N/A | SECURE |
| `/login` | GET | Yes | No | None | N/A | Static | N/A | React JSX Encoded | SameSite Cookie | SECURE |

---

## 2. Admin & CRM Workspace Routes (Protected by Proxy & Session)

| Route | Method | Public? | Auth Required? | Role Required? | Object Auth? | Rate Limited? | Input Validation? | Output Sanitization? | CSRF Consideration? | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `/admin/dashboard` | GET | No | Yes | Authenticated | User context | Proxy protected | Session | Server Component | SameSite + Proxy | SECURE |
| `/admin/clients` | GET | No | Yes | Authenticated | RLS enforced | Proxy protected | Query / Filters | Server Component | SameSite + Proxy | SECURE |
| `/admin/clients/new` | GET | No | Yes | Authenticated | RLS enforced | Proxy protected | Form inputs | Server Component | SameSite + Proxy | SECURE |
| `/admin/clients/[id]` | GET | No | Yes | Authenticated | RLS enforced | Proxy protected | ID param | Server Component | SameSite + Proxy | SECURE |
| `/admin/contacts` | GET | No | Yes | Authenticated | RLS enforced | Proxy protected | Query / Filters | Server Component | SameSite + Proxy | SECURE |
| `/admin/insurance` | GET | No | Yes | Authenticated | RLS enforced | Proxy protected | Query / Filters | Server Component | SameSite + Proxy | SECURE |
| `/admin/insurance/new` | GET | No | Yes | Authenticated | RLS enforced | Proxy protected | Form inputs | Server Component | SameSite + Proxy | SECURE |
| `/admin/insurance/[id]` | GET | No | Yes | Authenticated | RLS enforced | Proxy protected | ID param | Server Component | SameSite + Proxy | SECURE |
| `/admin/credit` | GET | No | Yes | Authenticated | RLS enforced | Proxy protected | Query / Filters | Server Component | SameSite + Proxy | SECURE |
| `/admin/credit/new` | GET | No | Yes | Authenticated | RLS enforced | Proxy protected | Form inputs | Server Component | SameSite + Proxy | SECURE |
| `/admin/credit/[id]` | GET | No | Yes | Authenticated | RLS enforced | Proxy protected | ID param | Server Component | SameSite + Proxy | SECURE |
| `/admin/properties` | GET | No | Yes | Authenticated | RLS enforced | Proxy protected | Query / Filters | Server Component | SameSite + Proxy | SECURE |
| `/admin/properties/new` | GET | No | Yes | Authenticated | RLS enforced | Proxy protected | Form inputs | Server Component | SameSite + Proxy | SECURE |
| `/admin/properties/[id]` | GET | No | Yes | Authenticated | RLS enforced | Proxy protected | ID param | Server Component | SameSite + Proxy | SECURE |
| `/admin/properties/[id]/kit` | GET | No | Yes | Authenticated | RLS enforced | Proxy protected | ID param | Server Component | SameSite + Proxy | SECURE |
| `/admin/requests` | GET | No | Yes | Authenticated | RLS enforced | Proxy protected | Query / Filters | Server Component | SameSite + Proxy | SECURE |
| `/admin/requests/new` | GET | No | Yes | Authenticated | RLS enforced | Proxy protected | Form inputs | Server Component | SameSite + Proxy | SECURE |
| `/admin/requests/[id]` | GET | No | Yes | Authenticated | RLS enforced | Proxy protected | ID param | Server Component | SameSite + Proxy | SECURE |
| `/admin/leads` | GET | No | Yes | Authenticated | RLS enforced | Proxy protected | Query / Filters | Server Component | SameSite + Proxy | SECURE |
| `/admin/opportunities` | GET | No | Yes | Authenticated | RLS enforced | Proxy protected | Query / Filters | Server Component | SameSite + Proxy | SECURE |
| `/admin/opportunities/new`| GET | No | Yes | Authenticated | RLS enforced | Proxy protected | Form inputs | Server Component | SameSite + Proxy | SECURE |
| `/admin/offers` | GET | No | Yes | Authenticated | RLS enforced | Proxy protected | Query / Filters | Server Component | SameSite + Proxy | SECURE |
| `/admin/offers/new` | GET | No | Yes | Authenticated | RLS enforced | Proxy protected | Form inputs | Server Component | SameSite + Proxy | SECURE |
| `/admin/tasks` | GET | No | Yes | Authenticated | RLS enforced | Proxy protected | Query / Filters | Server Component | SameSite + Proxy | SECURE |
| `/admin/tasks/new` | GET | No | Yes | Authenticated | RLS enforced | Proxy protected | Form inputs | Server Component | SameSite + Proxy | SECURE |
| `/admin/follow-ups` | GET | No | Yes | Authenticated | RLS enforced | Proxy protected | Query / Filters | Server Component | SameSite + Proxy | SECURE |
| `/admin/follow-ups/new` | GET | No | Yes | Authenticated | RLS enforced | Proxy protected | Form inputs | Server Component | SameSite + Proxy | SECURE |
| `/admin/viewings` | GET | No | Yes | Authenticated | RLS enforced | Proxy protected | Query / Filters | Server Component | SameSite + Proxy | SECURE |
| `/admin/campaigns` | GET | No | Yes | Authenticated | RLS enforced | Proxy protected | Query / Filters | Server Component | SameSite + Proxy | SECURE |
| `/admin/campaigns/new` | GET | No | Yes | Authenticated | RLS enforced | Proxy protected | Form inputs | Server Component | SameSite + Proxy | SECURE |
| `/admin/notifications` | GET | No | Yes | Authenticated | RLS enforced | Proxy protected | Query / Filters | Server Component | SameSite + Proxy | SECURE |
| `/admin/analytics` | GET | No | Yes | Authenticated | RLS enforced | Proxy protected | Query / Filters | Server Component | SameSite + Proxy | SECURE |

---

## 3. API Route Handlers

| API Route | Method | Public? | Auth Required? | Role Required? | Object Auth? | Rate Limited? | Input Validation? | Output Sanitization? | CSRF Consideration? | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `/api/leads` | POST | Yes | No | Anonymous | N/A | Memory Limiter | Schema / Regex | Sanitized Errors | SameSite Header | SECURE |
| `/api/leads` | GET | No | Yes | Authenticated | RLS | Proxy Protected | Query Filter | JSON | SameSite Session | SECURE |
| `/api/leads/[id]` | GET, PATCH, DELETE | No | Yes | Authenticated | RLS | Proxy Protected | UUID / Schema | JSON | SameSite Session | SECURE |
| `/api/leads/[id]/convert` | POST | No | Yes | Authenticated | RLS | Proxy Protected | UUID / Schema | JSON | SameSite Session | SECURE |
| `/api/clients` | GET, POST | No | Yes | Authenticated | RLS | Proxy Protected | Schema / Filter | JSON | SameSite Session | SECURE |
| `/api/clients/quick` | POST | No | Yes | Authenticated | RLS | Proxy Protected | Schema / Sanitized | JSON | SameSite Session | SECURE |
| `/api/clients/check-duplicates` | POST | No | Yes | Authenticated | RLS | Proxy Protected | Sanitized Filters | JSON | SameSite Session | SECURE |
| `/api/contacts` | GET, POST | No | Yes | Authenticated | RLS | Proxy Protected | Schema / Filter | JSON | SameSite Session | SECURE |
| `/api/contacts/[id]` | GET, PATCH, DELETE | No | Yes | Authenticated | RLS | Proxy Protected | UUID / Schema | JSON | SameSite Session | SECURE |
| `/api/contacts/convert` | POST | No | Yes | Authenticated | RLS | Proxy Protected | UUID / Schema | JSON | SameSite Session | SECURE |
| `/api/contacts/import` | POST | No | Yes | Authenticated | RLS | Proxy Protected | CSV/VCF parser | JSON | SameSite Session | SECURE |
| `/api/insurance/client-full` | POST | No | Yes | AGENT / ADMIN | RLS + RPC Auth | Proxy Protected | JSON Schema | Sanitized RPC | SameSite Session | SECURE |
| `/api/insurance/policies` | GET, POST | No | Yes | Authenticated | RLS | Proxy Protected | Schema / Filter | JSON | SameSite Session | SECURE |
| `/api/insurance/policies/[id]` | GET, PATCH, DELETE | No | Yes | Authenticated | RLS | Proxy Protected | UUID / Schema | JSON | SameSite Session | SECURE |
| `/api/credit/cases` | GET, POST | No | Yes | Authenticated | RLS | Proxy Protected | Schema / Filter | JSON | SameSite Session | SECURE |
| `/api/credit/cases/[id]` | GET, PATCH, DELETE | No | Yes | Authenticated | RLS | Proxy Protected | UUID / Schema | JSON | SameSite Session | SECURE |
| `/api/properties` | GET | Yes | No | None | Public filter | CDN / Proxy | Query params | JSON | N/A | SECURE |
| `/api/properties` | POST | No | Yes | Authenticated | RLS | Proxy Protected | Schema | JSON | SameSite Session | SECURE |
| `/api/properties/[id]` | GET | Yes | No | None | Public filter | CDN / Proxy | UUID param | JSON | N/A | SECURE |
| `/api/properties/[id]` | PATCH, DELETE | No | Yes | Authenticated | RLS | Proxy Protected | UUID / Schema | JSON | SameSite Session | SECURE |
| `/api/properties/[id]/media` | POST, DELETE | No | Yes | Authenticated | RLS | Proxy Protected | UUID / Media schema | JSON | SameSite Session | SECURE |
| `/api/properties/[id]/documents` | POST, DELETE | No | Yes | Authenticated | RLS | Proxy Protected | Block dangerous ext | JSON | SameSite Session | SECURE |
| `/api/requests` | GET | Yes | No | None | Public filter | CDN / Proxy | Query params | JSON | N/A | SECURE |
| `/api/requests` | POST | No | Yes | Authenticated | RLS | Proxy Protected | Schema | JSON | SameSite Session | SECURE |
| `/api/requests/[id]` | GET, PATCH, DELETE | No | Yes | Authenticated | RLS | Proxy Protected | UUID / Schema | JSON | SameSite Session | SECURE |
| `/api/opportunities` | GET, POST | No | Yes | Authenticated | RLS | Proxy Protected | Schema / Filter | JSON | SameSite Session | SECURE |
| `/api/opportunities/[id]` | GET, PATCH, DELETE | No | Yes | Authenticated | RLS | Proxy Protected | UUID / Schema | JSON | SameSite Session | SECURE |
| `/api/offers` | GET, POST | No | Yes | Authenticated | RLS | Proxy Protected | Schema / Filter | JSON | SameSite Session | SECURE |
| `/api/offers/[id]` | GET, PATCH, DELETE | No | Yes | Authenticated | RLS | Proxy Protected | UUID / Schema | JSON | SameSite Session | SECURE |
| `/api/activities` | GET, POST | No | Yes | Authenticated | RLS | Proxy Protected | Schema / Filter | JSON | SameSite Session | SECURE |
| `/api/follow-ups` | GET, POST | No | Yes | Authenticated | RLS | Proxy Protected | Schema / Filter | JSON | SameSite Session | SECURE |
| `/api/tasks` | GET, POST | No | Yes | Authenticated | RLS | Proxy Protected | Schema / Filter | JSON | SameSite Session | SECURE |
| `/api/tasks/[id]` | GET, PATCH, DELETE | No | Yes | Authenticated | RLS | Proxy Protected | UUID / Schema | JSON | SameSite Session | SECURE |
| `/api/viewings` | GET, POST | No | Yes | Authenticated | RLS | Proxy Protected | Schema / Filter | JSON | SameSite Session | SECURE |
| `/api/viewings/[id]` | GET, PATCH, DELETE | No | Yes | Authenticated | RLS | Proxy Protected | UUID / Schema | JSON | SameSite Session | SECURE |
| `/api/campaigns` | GET, POST | No | Yes | Authenticated | RLS | Proxy Protected | Schema / Filter | JSON | SameSite Session | SECURE |
| `/api/campaigns/[id]` | GET, PATCH, DELETE | No | Yes | Authenticated | RLS | Proxy Protected | UUID / Schema | JSON | SameSite Session | SECURE |
| `/api/notifications` | GET, POST | No | Yes | Authenticated | RLS | Proxy Protected | Schema / Filter | JSON | SameSite Session | SECURE |
| `/api/notifications/[id]` | PATCH, DELETE | No | Yes | Authenticated | RLS | Proxy Protected | UUID / Schema | JSON | SameSite Session | SECURE |
| `/api/documents/upload` | POST | No | Yes | Authenticated | RLS | Proxy Protected | Block dangerous ext | JSON | SameSite Session | SECURE |
| `/api/documents/folders` | GET, POST | No | Yes | Authenticated | RLS | Proxy Protected | Schema / Filter | JSON | SameSite Session | SECURE |
