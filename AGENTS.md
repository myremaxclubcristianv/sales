<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# CRM Platform - Project Information

## Technology Stack
- Next.js 16.3.5 with App Router
- TypeScript
- Tailwind CSS 4
- Supabase (PostgreSQL, Auth, Storage, RLS)
- React 19.2.8

## Build Commands
- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Database Setup
1. Create Supabase project
2. Copy `.env.example` to `.env.local` and add Supabase credentials
3. Run migrations from `supabase/migrations/` directory in Supabase dashboard
4. Run storage setup from `supabase/storage_setup.sql`

## Verification Steps
After each phase, run:
1. `npm run build` - Ensure no build errors
2. `npm run lint` - Check for linting issues
3. Test critical user flows manually

## Phase Structure
- Phase 1: Foundation (current - Auth, Database, RLS, Admin shell, Public shell, Design system)
- Phase 2: Clients, Client profiles, Activities, Notes, Follow-ups, Personal dates, Documents
- Phase 3: Properties, Public property pages, Property media, Public/private controls
- Phase 4: Requests, Matching, Viewings, Offers, Opportunities
- Phase 5: Insurance, Credit
- Phase 6: Marketing, Campaigns, Lead attribution, Marketing kits, Analytics
- Phase 7: Automation, Notifications, Next-best-action engine, Command center
- Phase 8: AI enhancements

## Key Principles
- Mobile-first design
- Fast, simple, useful, secure
- No fake data or placeholders
- Public/private data separation via RLS
- Real-time database-derived metrics
- 1-3 taps for common actions on mobile
