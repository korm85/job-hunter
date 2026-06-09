# Required Environment Variables

Set these in Vercel dashboard (Production + Preview + Development) and in `.env.local` for local dev.

## Core

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Neon Postgres — Vercel dashboard → Storage → job-hunter DB → Connection string (pooled) |
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys |
| `TAVILY_API_KEY` | app.tavily.com → API Keys (used for job search fallback when LinkedIn bridge is down) |

## LinkedIn Bridge (NUC)

| Variable | Value / Where to get it |
|---|---|
| `LINKEDIN_BRIDGE_TOKEN` | A long random secret you generate — must match `BRIDGE_TOKEN` in NUC's `ecosystem.config.cjs` |
| `LINKEDIN_BRIDGE_URL` | Optional fallback. Bridge URL is stored dynamically in DB (Config table, key=`linkedin_bridge_url`) auto-updated by url-watcher on NUC. Set this only if you want a static override. |

## NUC Bridge only (not in Vercel)

| Variable | Used by |
|---|---|
| `BRIDGE_TOKEN` | NUC `ecosystem.config.cjs` — same value as `LINKEDIN_BRIDGE_TOKEN` above |
| `PORT` | NUC bridge Express server port (default 3001) |
| `SESSION_DIR` | NUC path to LinkedIn session data (default `/home/nuc/.linkedin-mcp-server`) |
| `MCP_URL` | NUC bridge points to local linkedin-mcp-server HTTP endpoint (default `http://localhost:3002/mcp`) |

## Auto-injected (do not set manually)

`NODE_ENV`, `APPDATA`, `XDG_CONFIG_HOME`, `CLAUDE_CONFIG_DIR`, `CAVEMAN_DEBUG`, `CAVEMAN_DEFAULT_MODE` — these come from the runtime or Claude Code plugin system.
