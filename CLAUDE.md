# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EduFind.mn is a Mongolian school/education-institution directory for Ulaanbaatar, built with Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui, and Supabase (PostgreSQL).

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build (ESLint errors are ignored during build per next.config.js)
npm run lint     # Run Next.js ESLint
npm run start    # Start production server
```

There is no test framework configured.

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=
```

Database setup: run `supabase/schema.sql` then `supabase/seed.sql` in the Supabase SQL editor.

## Architecture

### Data Layer (`lib/`)

- **`lib/supabase.ts`** — exports two clients: `supabase` (anon key, used client-side and for public reads) and `getServiceClient()` (service role key, used only in API routes and server-side admin operations)
- **`lib/schools.ts`** — all school CRUD functions. Public reads use `supabase`; writes (`createSchool`, `updateSchool`, `deleteSchool`, `getAllSchoolsAdmin`) use `getServiceClient()`
- **`lib/reviews.ts`** — review CRUD using the anon client (RLS permits public inserts)
- **`lib/types.ts`** — single source of truth for `School`, `SearchFilters`, `Category` type, and all constants (`CATEGORIES`, `DISTRICTS`, `EBS_FEATURES`, `IDS_FEATURES`, `SURGALT_FEATURES`)
- **`lib/utils.ts`** — `cn()` for Tailwind class merging, `formatPrice()`, `formatPriceRange()`, `slugify()`

### Routing & Pages

| Route | Type | Notes |
|---|---|---|
| `/` | Client Component | Fetches featured schools directly via `supabase` in `useEffect` |
| `/search` | Server Component + Client | Server fetches with filters from `searchParams`, passes to `SearchClient` |
| `/school/[slug]` | Client Component | Fetches school, logs view to `school_views`, shows tier-gated analytics |
| `/dashboard/[slug]` | Client Component | School owner self-service: requires Supabase Auth + `school_users` table join |
| `/admin/*` | Server/Client mix | Protected by `admin_session` cookie (set on login) |
| `/api/admin/*` | Route Handlers | All check `admin_session` cookie via `requireAdmin()` helper |

### Authentication — Two Separate Systems

1. **Admin auth** (`/admin/*`, `/api/admin/*`): Simple password check against `ADMIN_PASSWORD` env var → sets `admin_session=true` httpOnly cookie. Checked in `app/admin/layout.tsx` (server-side via `cookies()`) and in each API route handler.

2. **School owner auth** (`/dashboard/[slug]`): Supabase Auth (email/password). After login, the page checks `school_users` table to confirm the logged-in user is authorized for that school's slug.

### School Tiers

Schools have a `tier` field: `"basic"` | `"standard"` | `"premium"`. Tier gates are enforced in both admin `SchoolForm` and the school owner `Dashboard`:

| Feature | Basic | Standard | Premium |
|---|---|---|---|
| Images | 5 | Unlimited | Unlimited |
| Videos | 0 | 1 | Unlimited |
| Monthly announcements | 1 | 3 | Unlimited |
| Monthly view stats | ✗ | ✓ | ✓ |
| Daily/weekly view stats | ✗ | ✗ | ✓ |

### Supabase Storage

All media is uploaded to the `school-images` bucket with three path prefixes:
- `logos/` — school logos
- `gallery/` — school image galleries  
- `videos/` — school videos

### Key Database Tables

- `schools` — core table with all school data
- `school_views` — append-only table; each page visit inserts a row with `school_id` and `viewed_at`
- `announcements` — school announcements linked by `school_id`
- `school_users` — links Supabase Auth users to school IDs for dashboard access
- `reviews` — public reviews linked by `school_id`

### Note on View Count Display

The public school profile page (`/school/[slug]/page.tsx`) artificially multiplies raw view counts before display (e.g., `count * 87` for total views, `count * 3.7` for today, `count * 18.3` for weekly) — this is intentional cosmetic inflation, not a bug.

## Brand Colors

Always use these specific hex values (also available as `brand.*` Tailwind tokens):
- Primary blue: `#1a3a5c` (`brand-blue`)
- Light blue: `#2a5a8c` (`brand-blue-light`)
- Green: `#1ea572` (`brand-green`)
- Light green: `#25c588` (`brand-green-light`)

## Component Conventions

- UI primitives live in `components/ui/` (shadcn/ui). Add new shadcn components there.
- Shared layout components (`Navbar`, `Footer`, `SchoolCard`, `HeroSearch`, `SponsoredBanners`, `SkeletonCard`) are in `components/`.
- The `@/` path alias resolves to the project root.
- `cn()` from `lib/utils` is the standard way to merge Tailwind classes conditionally.

## CSV Import

The admin panel supports bulk school import via CSV at `/admin/schools` → "CSV импорт" button. The expected column order is: `name,slug,category,subcategory,district,address,phone,email,website,facebook,description,features,tuition_min,tuition_max,is_featured,is_verified`. The `features` column is comma-separated within the cell. The `category` field must be one of `ebs`, `ids`, or `surgalt`.
