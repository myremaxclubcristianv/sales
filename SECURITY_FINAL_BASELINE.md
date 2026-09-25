# CRM SALES — Security Final Baseline

**Date:** 2026-09-26  
**Target Repository:** `/Users/cristianvaduva/CascadeProjects/CRM SALES`  
**Production URL:** `https://sales.cristianvaduva.com`  
**Vercel Project:** `sales` (`prj_z7IviTZ3bIdCSkNaxKYylQS70k3Z`)  
**Supabase Project Ref:** `mmktsdtuyejqpbvohmep`  
**Git Commit Baseline:** `5fe83b68742f75d191926c137576413037f37395`  
**Git Branch:** `main`  

---

## 1. System & Environment Baseline

| Parameter | Specification |
|---|---|
| **Operating System** | macOS (Darwin 24.6.0) |
| **Node.js Runtime** | v20.20.2 |
| **Package Manager** | npm 10.8.2 |
| **Framework** | Next.js 16.3.5 (App Router with Turbopack) |
| **React Version** | React 19.2.8 |
| **Supabase Client** | `@supabase/ssr` ^0.12.7, `@supabase/supabase-js` ^2.109.0 |
| **Styling** | Tailwind CSS 4 |
| **Hosting Platform** | Vercel Serverless (Project `sales`) |
| **Database** | Supabase PostgreSQL 15 (PostgREST API enabled) |
| **Storage Buckets** | `documents` (private), `media` (public CDN) |

---

## 2. Environment Variables Classification

*Note: In accordance with security war room standards, NO secret values are recorded.*

| Variable Name | Scope / Visibility | Classification | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client & Server | Safe Public Config | Supabase API endpoint host |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client & Server | Safe Public Config | Supabase anonymous API client key with RLS |
| `NEXT_PUBLIC_SITE_URL` | Client & Server | Safe Public Config | Canonical site URL for metadata |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-Only | Secret | Elevated backend administrative operations |
| `TELEGRAM_BOT_TOKEN` | Server-Only | Secret | Secure server-side lead notification dispatch |
| `TELEGRAM_CHAT_ID` | Server-Only | Sensitive | Destination chat ID for real-time lead alerts |

---

## 3. Database Schema & RLS Status

- **Total Public Tables:** 34
- **Row Level Security (RLS) Status:** 100% of tables have `rowsecurity = true`
- **Key Tables Enforced by RLS:**
  - `public.profiles`
  - `public.companies`
  - `public.clients`
  - `public.client_relationships`
  - `public.contacts`
  - `public.properties`
  - `public.property_media`
  - `public.property_documents`
  - `public.requests`
  - `public.leads`
  - `public.opportunities`
  - `public.activities`
  - `public.follow_ups`
  - `public.tasks`
  - `public.viewings`
  - `public.offers`
  - `public.insurance_policies`
  - `public.insurance_opportunities`
  - `public.insurance_claims`
  - `public.client_vehicles`
  - `public.client_properties`
  - `public.credit_cases`
  - `public.credit_documents`
  - `public.documents`
  - `public.document_folders`
  - `public.campaigns`
  - `public.marketing_events`
  - `public.referrals`
  - `public.personal_events`
  - `public.notifications`
  - `public.audit_logs`
  - `public.public_metrics`
  - `public.settings`
  - `public.contact_imports`

---

## 4. PostgreSQL Functions & Security Definer Audit

| Function Name | Security Type | Search Path | Authorization Gate |
|---|---|---|---|
| `public.create_insurance_client_full` | `SECURITY DEFINER` | `public` | Requires `ADMIN` or `AGENT` role via `profiles.role` or `service_role`. `PUBLIC`/`anon` revoked. |
| `public.is_admin` | `SECURITY DEFINER` | `public` | Checks `profiles.role = 'ADMIN'`. |
| `public.is_admin_or_agent` | `SECURITY DEFINER` | `public` | Checks `profiles.role IN ('ADMIN', 'AGENT')`. |
| `public.get_current_user_role` | `SECURITY DEFINER` | `public` | Returns role from `profiles` for `auth.uid()`. |

---

## 5. Storage Security Baseline

| Bucket | Public Access | Allowed MIME Types | RLS Policy |
|---|---|---|---|
| `media` | `true` (CDN) | Images (JPEG, PNG, WebP, AVIF) | Public SELECT; authenticated INSERT/UPDATE/DELETE. |
| `documents` | `false` (Private) | PDF, Office docs (executables blocked) | Authenticated CRM users only. Direct anonymous access denied. |

---

## 6. Baseline Verification Sign-off

- Build Status: **PASS**
- TypeScript Status: **PASS**
- ESLint Status: **PASS**
- Database Integrity: **PASS (17 clients preserved)**
- Zero Unmitigated Critical/High Vulnerabilities
