# SECURITY BASELINE & ENVIRONMENT FREEZE

**Target Application:** CRM SALES (Cristian Văduva Real Estate, Insurance & Capital Advisory)  
**Production URL:** `https://sales.cristianvaduva.com`  
**Vercel Project:** `sales` (`prj_z7IviTZ3bIdCSkNaxKYylQS70k3Z`)  
**Supabase Project Ref:** `mmktsdtuyejqpbvohmep`  
**Assessment Date:** 2026-09-26  
**Commit Baseline:** `3661e95` (Branch: `main`)

---

## 1. Environment & Tech Stack

| Component | Version / Specification |
| :--- | :--- |
| **Node.js** | v20.20.2 |
| **Next.js** | 16.3.5 (App Router, Turbopack, Server Actions) |
| **React** | 19.2.8 / React DOM 19.2.8 |
| **TypeScript** | ^5 |
| **Tailwind CSS** | ^4 / @tailwindcss/postcss ^4 |
| **@supabase/ssr** | ^0.12.7 |
| **@supabase/supabase-js** | ^2.109.0 |
| **lucide-react** | ^1.45.0 |
| **Package Manager** | npm (package-lock.json v3) |

---

## 2. Database Schema & RLS Inventory

All 34 public tables have Row-Level Security (`rowsecurity = true`):

1. `activities` (RLS active, private)
2. `audit_logs` (RLS active, private)
3. `campaigns` (RLS active, private)
4. `client_properties` (RLS active, private)
5. `client_relationships` (RLS active, private)
6. `client_vehicles` (RLS active, private)
7. `clients` (RLS active, private, 17 records)
8. `companies` (RLS active, private)
9. `contact_imports` (RLS active, private)
10. `contacts` (RLS active, private)
11. `credit_cases` (RLS active, private)
12. `credit_documents` (RLS active, private)
13. `document_folders` (RLS active, private)
14. `documents` (RLS active, private)
15. `follow_ups` (RLS active, private)
16. `insurance_claims` (RLS active, private)
17. `insurance_opportunities` (RLS active, private)
18. `insurance_policies` (RLS active, private)
19. `leads` (RLS active, anonymous INSERT allowed for public inquiry form)
20. `marketing_events` (RLS active, private)
21. `notifications` (RLS active, private)
22. `offers` (RLS active, private)
23. `opportunities` (RLS active, private)
24. `personal_events` (RLS active, private)
25. `profiles` (RLS active, private)
26. `properties` (RLS active, public SELECT for status='PUBLIC' & visibility=true)
27. `property_documents` (RLS active, private)
28. `property_media` (RLS active, public SELECT for public properties)
29. `public_metrics` (RLS active, public SELECT for visible=true)
30. `referrals` (RLS active, private)
31. `requests` (RLS active, public SELECT for status='ACTIVE' & visibility=true)
32. `settings` (RLS active, private)
33. `tasks` (RLS active, private)
34. `viewings` (RLS active, private)

---

## 3. Storage Buckets Baseline

| Bucket Name | Public Flag | File Size Limit | Allowed MIME Types | RLS Policies |
| :--- | :--- | :--- | :--- | :--- |
| `documents` | `false` (Private) | Default / Enforced in API (50MB) | Authenticated-only | Private, only authenticated users with valid sessions can upload/select/delete |
| `media` | `true` (Public CDN) | Default / Enforced in API (25MB) | Public read, Authenticated write | Public read for property gallery, authenticated-only upload/delete |

---

## 4. PostgreSQL Functions & Security Definer Inventory

1. `public.create_insurance_client_full(payload JSONB)`:
   - `SECURITY DEFINER`
   - `search_path = public`
   - **Audit finding**: Missing caller role authorization check inside function and executable by `anon` role.
2. `public.get_current_user_role()`:
   - `STABLE SECURITY DEFINER`
   - `search_path = public`
3. `public.is_admin()`:
   - `STABLE SECURITY DEFINER`
   - `search_path = public`
4. `public.is_admin_or_agent()`:
   - `STABLE SECURITY DEFINER`
   - `search_path = public`

---

## 5. Route Tree Baseline

### Public Frontend Routes
- `/` (Home page)
- `/properties` (Public luxury property portfolio)
- `/properties/[slug]` (Public property detail)
- `/requests` (Public client property buy/rent requests)
- `/requests/[id]` (Public request detail)
- `/about` (Firm profile)
- `/contact` (Public lead & advisory contact form)
- `/legal` (Legal hub)
- `/privacy-policy` (Privacy policy)
- `/cookie-policy` (Cookie policy)
- `/gdpr` (GDPR rights statement)
- `/data-protection` (Data protection details)
- `/terms` (Terms of service)
- `/marketing-consent` (Marketing consent declaration)
- `/imprint` (Corporate imprint)
- `/accessibility` (Accessibility statement)
- `/complaints` (Complaints procedure)
- `/login` (Admin/Broker authentication portal)

### Protected Admin Workspace Routes (`/admin/*`)
- `/admin/dashboard`
- `/admin/clients`
- `/admin/clients/[id]`
- `/admin/clients/new`
- `/admin/contacts` (Agenda & Contact Import Hub)
- `/admin/insurance`
- `/admin/insurance/[id]`
- `/admin/insurance/new`
- `/admin/credit`
- `/admin/credit/[id]`
- `/admin/credit/new`
- `/admin/properties`
- `/admin/properties/[id]`
- `/admin/properties/[id]/kit`
- `/admin/properties/new`
- `/admin/requests`
- `/admin/requests/[id]`
- `/admin/requests/new`
- `/admin/leads`
- `/admin/opportunities`
- `/admin/opportunities/new`
- `/admin/offers`
- `/admin/offers/new`
- `/admin/viewings`
- `/admin/follow-ups`
- `/admin/follow-ups/new`
- `/admin/tasks`
- `/admin/tasks/new`
- `/admin/campaigns`
- `/admin/campaigns/new`
- `/admin/analytics`
- `/admin/notifications`

### API Routes (`/api/*`)
- `/api/leads` (Public inbound capture, rate-limited)
- `/api/leads/[id]` (Protected CRUD)
- `/api/leads/[id]/convert` (Protected)
- `/api/clients` (Protected)
- `/api/clients/quick` (Protected)
- `/api/clients/check-duplicates` (Protected)
- `/api/contacts` (Protected)
- `/api/contacts/[id]` (Protected)
- `/api/contacts/convert` (Protected)
- `/api/contacts/import` (Protected)
- `/api/insurance/client-full` (Audit finding: needs mandatory auth check)
- `/api/insurance/policies` (Protected)
- `/api/insurance/policies/[id]` (Protected)
- `/api/documents/upload` (Protected)
- `/api/documents/folders` (Protected)
- `/api/properties` (Protected)
- `/api/properties/[id]` (Protected)
- `/api/properties/[id]/media` (Protected)
- `/api/properties/[id]/documents` (Protected)
- `/api/requests` (Protected)
- `/api/requests/[id]` (Protected)
- `/api/opportunities` (Protected)
- `/api/opportunities/[id]` (Protected)
- `/api/offers` (Protected)
- `/api/offers/[id]` (Protected)
- `/api/credit/cases` (Protected)
- `/api/credit/cases/[id]` (Protected)
- `/api/activities` (Protected)
- `/api/follow-ups` (Protected)
- `/api/tasks` (Protected)
- `/api/tasks/[id]` (Protected)
- `/api/viewings` (Protected)
- `/api/viewings/[id]` (Protected)
- `/api/campaigns` (Protected)
- `/api/campaigns/[id]` (Protected)
- `/api/notifications` (Protected)
- `/api/notifications/[id]` (Protected)

---

## 6. Security Headers Baseline
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), fullscreen=(self)`
- `Content-Security-Policy`: Restricts base-uri, frame-ancestors, object-src, worker-src.
