# Infrastructure Context

## Overview

The app is a Next.js 16 App Router application deployed on Vercel. It has three external dependencies: a Neon Postgres database, an optional Tavily search API, and a LinkedIn bridge running on an always-on Intel NUC home server.

## Vercel (Production hosting)

- Project: `job-hunter` under `korm85s-projects` team
- Production URL: `https://job-hunter-black.vercel.app`
- Framework: Next.js 16, Node 22, Turbopack
- Region: Washington DC (iad1)
- Deploy: `vercel deploy --prod` from project root (no GitHub CI — manual deploy)
- Build: `next build` via `npm run build`

## Neon Postgres (Database)

- Provider: Neon, provisioned via Vercel Storage integration
- ORM: Prisma 7 with `@prisma/adapter-pg` (PrismaPg driver)
- Schema: `prisma/schema.prisma`
- Config: `prisma.config.ts` (loads `.env.local` first, then `.env`)
- Migrations: `prisma/migrations/`
- Key tables: Job, Application, StatusEvent, SearchProfile, Config
- The `Config` table is used as a key-value store — notably stores `linkedin_bridge_url` (auto-updated by NUC)

## Intel NUC (Home server — LinkedIn bridge)

- Always-on Linux box on home network
- Hostname: `nuc-server`, user: `nuc`
- SSH: `ssh nuc@nuc-server`
- Purpose: runs LinkedIn browser automation that can't run serverlessly

### NUC Services (managed by pm2)

All pm2 processes are in `/home/nuc/linkedin-bridge/ecosystem.config.cjs`.

| pm2 name | What it does |
|---|---|
| `xvfb` | Virtual display server `:99` — required for non-headless browser |
| `linkedin-bridge` | Express HTTP server on port 3001 — receives requests from Vercel, proxies to MCP |
| `cloudflare-tunnel` | Exposes port 3001 to internet via Cloudflare Quick Tunnel (URL changes on restart) |
| `url-watcher` | Shell script that detects new tunnel URL and registers it to Vercel DB via `POST /api/bridge/register` |

### Docker container (LinkedIn MCP)

- Image: `linkedin-mcp-server` (built locally on NUC from GitHub repo `adhikasp/linkedin-mcp-server`)
- Container name: `linkedin-mcp-http`
- Runs: `linkedin-mcp-server --transport streamable-http --host 0.0.0.0 --port 3002 --no-headless`
- Flags: `--network host`, `-v /home/nuc/.linkedin-mcp-server:/root/.linkedin-mcp-server`, `-v /tmp/.X11-unix:/tmp/.X11-unix`, `-e DISPLAY=:99`
- Restart policy: `unless-stopped`
- Session data: `/home/nuc/.linkedin-mcp-server/browser-data/` (LinkedIn cookies, persisted across restarts)

### Re-login procedure (if LinkedIn session expires)

Session expires when LinkedIn detects automation or after weeks of inactivity. To re-login:

```bash
# On the NUC:
docker run --rm --network host \
  -v /home/nuc/.linkedin-mcp-server:/root/.linkedin-mcp-server \
  -v /tmp/.X11-unix:/tmp/.X11-unix \
  -e DISPLAY=:99 \
  linkedin-mcp-server --login --no-headless
```

Connect via VNC to see the browser: `ssh -L 5900:localhost:5900 nuc@nuc-server` then open any VNC client on `localhost:5900`. Log in to LinkedIn in the browser. The container exits automatically after saving the session. Then restart the HTTP container.

### Cloudflare Tunnel URL registration

When the tunnel restarts it gets a new random URL. The `url-watcher` pm2 process detects this and calls `POST https://job-hunter-black.vercel.app/api/bridge/register` with the new URL. The URL is stored in the `Config` DB table and used by `lib/bridge.ts` via `getBridgeUrl()`.

## MCP Servers (Claude Code local)

Configured in `~/.claude/mcp.json`. See `.claude-backup/mcp.json` for the full list (secrets redacted). Key servers:
- `linkedin-browser` — local Patchright browser automation (used in Claude Code only, not in the web app)
- Gmail, Google Drive, Google Calendar, Tavily, Slack, Vercel — various integrations

## Installed Claude Code Plugins

See `plugins.txt`. Key plugins:
- `superpowers@claude-plugins-official` — workflow skills (brainstorming, TDD, etc.)
- `caveman@caveman` — compressed communication mode
- `vercel@claude-plugins-official` — Vercel platform guidance
- `push-to-git@user` — this backup skill (stored at `~/.claude/plugins/marketplaces/user/`)
