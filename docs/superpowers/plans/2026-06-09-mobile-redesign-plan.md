# Implementation Plan — Mobile-First Redesign
**Date:** 2026-06-09

## Tasks

### T1 — CSS & Layout Foundation
- Replace sidebar layout with responsive top/bottom nav
- `app/layout.tsx`: remove Nav sidebar, add new MobileNav + DesktopNav
- `components/mobile-nav.tsx`: bottom tab bar (Discover · Queue · Applied · Settings)
- `components/desktop-nav.tsx`: top bar, horizontal links
- `app/globals.css`: mobile-first base styles, increased card radius, bottom nav safe area

### T2 — Home / Discover Feed (`app/page.tsx`)
- Search bar + Refresh button
- Job cards from DB (status=SAVED, ordered by createdAt desc)
- Tavily search on demand
- Save / Dismiss actions inline
- Summary line: "X ready · Y applied"

### T3 — Queue Page (`app/queue/page.tsx`)
- List of SAVED jobs without generated materials
- Generate button per card (calls /api/jobs/[id]/generate)
- CV Ready indicator when application exists
- Quick copy buttons

### T4 — Job Detail (`app/jobs/[id]/page.tsx`)
- Scrollable sections (not tab bar on mobile)
- Sticky footer: "Mark Applied" / "Already Applied" badge
- Generate CTA if no materials yet

### T5 — Applied Page (`app/applied/page.tsx`)
- Simple list of APPLIED jobs
- Sorted by appliedAt desc
- Tap → job detail

### T6 — LinkedIn Import Script (`scripts/import-linkedin.ts`)
- Standalone Node script (not a Next.js route)
- Calls LinkedIn MCP via subprocess or direct API
- Saves results to DB via Prisma
- `package.json`: add `import:linkedin` script

### T7 — API: Bulk Import Endpoint
- `app/api/jobs/bulk/route.ts`
- POST with array of job objects
- Upsert by URL (skip duplicates)
- Returns count of new/updated

### T8 — Settings Page (minor update)
- Show LinkedIn import instructions
- Keep env var health check

### T9 — Deploy
- git commit
- vercel --prod

## Execution Order
T1 → T2 → T3 → T4 → T5 → T6 + T7 (parallel) → T8 → T9
