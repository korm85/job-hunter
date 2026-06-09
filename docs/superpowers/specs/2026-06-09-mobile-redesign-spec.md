# Job Hunter — Mobile-First Redesign Spec
**Date:** 2026-06-09  
**Scope:** Full UI rebuild + LinkedIn discovery feed

---

## Problem

Current app is desktop-first ATS pipeline manager. User needs a mobile-first job-hunting weapon focused on early-stage application: discover → tailor → apply fast.

## What We're Building

A mobile-first job application automation tool. Core loop:

1. **Discover** — LinkedIn / Tavily finds fresh relevant roles
2. **Review** — User picks which are worth pursuing (dismiss the rest)
3. **Generate** — One tap: AI produces tailored CV + cover letter
4. **Apply** — User copies materials, manually sends

## Assumptions

- Mobile-first means bottom tab nav on mobile, responsive top bar on desktop
- Sidebar removed entirely
- Statuses simplified to: `SAVED` (queued) → `APPLIED` (sent) → `ARCHIVED` (dismissed/rejected)
- Full status enum kept in DB for future use; UI only exposes 3 states
- Dashboard = discovery feed, not stats blocks
- LinkedIn scraping: dual approach
  - In-app: Tavily (deployed, instant)
  - Bulk import: LinkedIn MCP via Claude Code session (`npm run import:linkedin`)
- Dark theme preserved, spacing/contrast tuned for outdoor mobile
- No auth — personal tool

## Pages (Mobile-First)

### 1. Home / Discover Feed (`/`)
- Search bar + "Refresh" button at top
- Feed of job cards sorted by freshness
- Each card: Company logo placeholder · Title · Company · Posted time · Source badge · Fit tier (if generated)
- Actions: **Save** (queues for generation) | **Dismiss** (archives without review)
- No stats blocks — replace with: "3 ready to apply today" and "You've applied to 12 jobs"

### 2. My Queue (`/queue`)
- Saved jobs waiting for CV generation
- Each card: Title, company, **Generate** button (prominent, primary)
- Once generated: shows fit tier badge + "CV Ready" indicator + **Copy CV** and **Copy Letter** quick actions
- Applied badge shows days ago

### 3. Job Detail (`/jobs/[id]`)
- Full job description (expandable)
- **Generate Materials** CTA (if not generated yet)
- Sections (not tabs on mobile — scrollable stacked cards):
  - Fit Assessment (recommendation + key strengths/gaps)
  - Tailored CV (full text, copy button)
  - Cover Letter (full text, copy button)
  - LinkedIn Message (copy button)
- Mark as Applied button (sticky footer)

### 4. Applied (`/applied`)
- Simple list of applied jobs
- Company, title, date applied
- Tap to open detail (for reference)

### 5. Settings (`/settings`)
- API status (DB, Anthropic, Tavily)
- Setup instructions

## Navigation

```
Mobile: Bottom tab bar
  [🏠 Discover] [📋 Queue] [✓ Applied] [⚙ Settings]

Desktop: Top bar with same links, full-width content
```

## LinkedIn Import (CLI)

`npm run import:linkedin` — calls LinkedIn MCP from Claude Code, searches for:
- "Product Manager" OR "Product Lead" OR "Senior PM"
- Location: Israel
- Keywords from context.md (Additive Manufacturing, Computer Vision, etc.)

Saves results to DB as SAVED jobs. Web app reads from DB — no Vercel involvement needed.

## API Changes

- `GET /api/jobs` already supports status filter — keep
- `POST /api/jobs/bulk` — new endpoint for CLI import
- No other API changes needed

## Design System

- Bottom nav height: 60px, 48px tap targets
- Card padding: 16px
- Font sizes: 15px body, 13px secondary, 11px labels
- Colors: existing CSS variables kept
- Card border-radius: 12px (increased from 8px)
- No horizontal scroll anywhere

## Out of Scope

- Interview tracking UI (keep in DB schema)
- Ghost risk UI (removed from UI, logic stays in API)
- Full pipeline view (replaced by Queue + Applied)
- Email/auto-submit (user manually sends)
