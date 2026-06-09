# Restore Guide — Job Hunter

> Read this file first. Follow steps sequentially. An AI agent (Claude Code) can execute all of this.

## What this project is

AI-powered job search platform. Discovers fresh LinkedIn job postings, generates tailored resumes, finds insider contacts at target companies. Built to be the first to apply to new postings with a personalised application.

**Stack:** Next.js 16 + TypeScript + Prisma 7 + Neon Postgres, deployed on Vercel. LinkedIn search runs via a bridge on an always-on Intel NUC home server.

---

## Prerequisites

Before starting, ensure you have:
- GitHub account: `korm85` with SSH key configured
- Vercel account connected to `korm85s-projects` team
- Neon Postgres account (provisioned via Vercel Storage)
- Intel NUC home server accessible at `nuc-server` (user: `nuc`)
- Anthropic API key (for AI resume generation)
- Tavily API key (optional — job search fallback)

---

## Step 1: Clone and install

```bash
git clone git@github.com:korm85/job-hunter.git ~/projects/personal/job-hunter
cd ~/projects/personal/job-hunter
npm install
```

---

## Step 2: Restore Claude Code environment

```bash
# Global Claude config
cp .claude-backup/global-CLAUDE.md ~/.claude/CLAUDE.md

# Settings (after filling in REDACTED values)
cp .claude-backup/settings.json ~/.claude/settings.json

# MCP servers config (after filling in REDACTED values)
cp .claude-backup/mcp.json ~/.claude/mcp.json

# Hooks
cp -r .claude-backup/hooks/. ~/.claude/hooks/

# Project memory
mkdir -p ~/.claude/projects/-home-korm85-projects-personal-job-hunter/memory/
cp .claude-backup/memory/*.md ~/.claude/projects/-home-korm85-projects-personal-job-hunter/memory/

# Install plugins (run inside Claude Code terminal)
# superpowers, caveman, vercel, slack plugins — install from Claude Code settings UI
# push-to-git skill: copy to ~/.claude/plugins/marketplaces/user/
mkdir -p ~/.claude/plugins/marketplaces/user/skills/push-to-git
cp -r .claude-backup/push-to-git-skill/. ~/.claude/plugins/marketplaces/user/skills/push-to-git/
```

Fill in all `{{ REDACTED }}` values in `settings.json` and `mcp.json` before copying.

---

## Step 3: Environment variables

See `.claude-backup/env-vars.md` for full list with descriptions.

Create `.env.local` in project root:
```
DATABASE_URL=<from Neon dashboard>
ANTHROPIC_API_KEY=<from console.anthropic.com>
TAVILY_API_KEY=<from app.tavily.com>
LINKEDIN_BRIDGE_TOKEN=<generate a long random string — must match NUC BRIDGE_TOKEN>
```

Set the same variables in Vercel dashboard → Project Settings → Environment Variables.

---

## Step 4: Database

```bash
npx prisma migrate deploy
npx prisma generate
```

If the Neon DB is new, run migrations from scratch. The `DATABASE_URL` must be the pooled connection string from Neon.

---

## Step 5: Deploy to Vercel

```bash
vercel deploy --prod
```

If first deploy, link the project first: `vercel link`

---

## Step 6: Set up NUC (LinkedIn bridge)

SSH into the NUC and run these commands. See `.claude-backup/infrastructure.md` for full context.

```bash
ssh nuc@nuc-server

# Install dependencies
sudo apt install -y docker.io nodejs npm xvfb x11vnc websockify
npm install -g pm2

# Clone bridge server
git clone https://github.com/korm85/job-hunter.git /tmp/job-hunter
mkdir -p /home/nuc/linkedin-bridge
cp /tmp/job-hunter/bridge/server.ts /home/nuc/linkedin-bridge/
cd /home/nuc/linkedin-bridge && npm install && npm run build

# Build LinkedIn MCP Docker image
git clone https://github.com/adhikasp/linkedin-mcp-server.git /tmp/linkedin-mcp-server
cd /tmp/linkedin-mcp-server
docker build -t linkedin-mcp-server .

# Create ecosystem config (fill in BRIDGE_TOKEN)
cat > /home/nuc/linkedin-bridge/ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [
    { name: "xvfb", script: "/home/nuc/xvfb-start.sh", interpreter: "bash" },
    {
      name: "linkedin-bridge",
      script: "dist/server.js",
      cwd: "/home/nuc/linkedin-bridge",
      env: {
        PORT: "3001",
        BRIDGE_TOKEN: "<YOUR_LINKEDIN_BRIDGE_TOKEN>",
        MCP_URL: "http://localhost:3002/mcp"
      }
    },
    { name: "url-watcher", script: "/home/nuc/linkedin-bridge/url-watcher.sh", interpreter: "bash" },
    {
      name: "cloudflare-tunnel",
      script: "/usr/local/bin/cloudflared",
      args: "tunnel --url http://localhost:3001",
      interpreter: "none"
    }
  ]
};
EOF

# Create Xvfb startup script
echo '#!/bin/bash\nexec Xvfb :99 -screen 0 1280x800x24 -ac' > /home/nuc/xvfb-start.sh
chmod +x /home/nuc/xvfb-start.sh

# Start all services
pm2 start /home/nuc/linkedin-bridge/ecosystem.config.cjs
pm2 save
pm2 startup  # follow the printed command to enable on boot

# Start LinkedIn MCP HTTP container
docker run -d \
  --network host \
  -v /home/nuc/.linkedin-mcp-server:/root/.linkedin-mcp-server \
  -v /tmp/.X11-unix:/tmp/.X11-unix \
  -e DISPLAY=:99 \
  --restart unless-stopped \
  --name linkedin-mcp-http \
  linkedin-mcp-server \
  --transport streamable-http --host 0.0.0.0 --port 3002 --no-headless
```

### Log in to LinkedIn (one-time)

```bash
# On NUC:
docker run --rm --network host \
  -v /home/nuc/.linkedin-mcp-server:/root/.linkedin-mcp-server \
  -v /tmp/.X11-unix:/tmp/.X11-unix \
  -e DISPLAY=:99 \
  linkedin-mcp-server --login --no-headless

# On local machine — SSH tunnel to see the browser:
ssh -L 5900:localhost:5900 nuc@nuc-server
# Then connect VNC client to localhost:5900 and log in to LinkedIn
```

---

## Step 7: Verify everything works

```bash
# 1. Database connected
curl https://job-hunter-black.vercel.app/api/health

# 2. LinkedIn bridge reachable (after tunnel registers URL)
# Check Config table in DB has linkedin_bridge_url set

# 3. Search returns LinkedIn results
curl -X POST https://job-hunter-black.vercel.app/api/search \
  -H "Content-Type: application/json" \
  -d '{"keywords":"backend engineer","location":"Israel"}'
# Should return source: "linkedin" with results
```

---

## Known gotchas

- **LinkedIn session expires**: re-run the login docker command above. Session typically lasts weeks but LinkedIn may invalidate it if it detects automation.
- **Cloudflare tunnel URL changes on NUC restart**: handled automatically by `url-watcher` pm2 process — waits for new URL in logs and registers it to DB.
- **Xvfb lock file**: if Xvfb crashes uncleanly, `rm /tmp/.X99-lock` before restarting.
- **Bridge timeout**: LinkedIn search takes ~10s. The Vercel function has a 60s timeout. If results are empty, check bridge health first.
- **Personal vs work git**: `~/.gitconfig-personal` forces SSH via `github-personal` alias for all repos in `~/projects/personal/`. Never uses work credentials.
- **Prisma schema has no `url` field**: connection URL is set via `prisma.config.ts` using `datasource.url`, not in schema. This is Prisma 7 style.
