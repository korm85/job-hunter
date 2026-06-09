# Job Hunter

> Be first to apply — with a tailored resume and an insider contact.

An AI-powered job search platform that monitors LinkedIn for fresh postings, generates role-specific resumes, and finds insider contacts at target companies — all from a mobile-friendly web app.

---

## What it does

```
LinkedIn (live) ──▶ Discover fresh postings
                         │
                         ▼
                   AI fit assessment
                         │
                    ┌────┴────┐
                    │         │
              Save to      Discard
              pipeline
                    │
                    ▼
           Generate tailored CV
         + cover letter + message
                    │
                    ▼
          Find insider contact
          at target company
                    │
                    ▼
              Apply fast ✓
```

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16 App Router · TypeScript · Material Design 3 |
| Database | Neon Postgres · Prisma 7 |
| AI | Anthropic Claude (resume generation, fit assessment) |
| Job search | LinkedIn bridge (live) · Tavily fallback |
| Deploy | Vercel |

---

## Architecture

```
┌─────────────────────────────┐
│       Vercel (cloud)        │
│                             │
│  Next.js App                │
│  ├── /discover  (search)    │
│  ├── /queue     (pipeline)  │
│  ├── /applied   (tracking)  │
│  └── /settings              │
│                             │
│  API Routes                 │
│  ├── /api/search            │
│  ├── /api/jobs/[id]/generate│
│  └── /api/bridge/register   │
└──────────┬──────────────────┘
           │ HTTPS (Cloudflare tunnel)
           │
┌──────────▼──────────────────┐
│     Intel NUC (home server) │
│                             │
│  linkedin-bridge  :3001     │
│  linkedin-mcp-http :3002    │  ◀── real browser (Patchright)
│  cloudflare-tunnel          │      LinkedIn session persisted
│  url-watcher                │
│  Xvfb :99 (virtual display) │
└─────────────────────────────┘
```

The NUC runs a persistent headless browser session authenticated to LinkedIn. The Vercel app calls it via a Cloudflare tunnel whose URL auto-registers to the database on restart — no manual reconfiguration when the NUC reboots.

---

## Key features

- **Live LinkedIn search** — real results via browser automation, not scraped snapshots
- **AI fit assessment** — Claude scores each job against your profile before you read it
- **Tailored resume generation** — role-specific CV, cover letter, and LinkedIn message in one click
- **Insider contact finder** — searches LinkedIn for employees at target companies
- **Pipeline tracking** — Saved → Applied → Screening → Interview → Offer
- **Mobile-first UI** — Material Design 3, works on phone

---

## Restoring this setup

See [`RESTORE.md`](./RESTORE.md) — a complete step-by-step guide an AI agent can follow to rebuild the full environment on a new machine.

See [`.claude-backup/`](./.claude-backup/) for:
- Claude Code configuration (hooks, MCP servers, memory)
- Infrastructure documentation
- Required environment variables

---

## Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string |
| `ANTHROPIC_API_KEY` | Claude API for resume generation |
| `TAVILY_API_KEY` | Fallback job search (when bridge is down) |
| `LINKEDIN_BRIDGE_TOKEN` | Shared secret between Vercel and NUC bridge |

See [`.claude-backup/env-vars.md`](./.claude-backup/env-vars.md) for the full list.
