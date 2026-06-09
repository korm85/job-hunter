"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface Health {
  database: boolean;
  anthropicKey: boolean;
  tavilyKey: boolean;
  linkedinBridge: boolean;
  linkedinBridgeConfigured: boolean;
}

const ENV_DOCS = [
  { key: "DATABASE_URL", field: "database" as keyof Health, label: "Neon Postgres connection URL", example: "postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require" },
  { key: "ANTHROPIC_API_KEY", field: "anthropicKey" as keyof Health, label: "Anthropic API key (CV + scoring)", example: "sk-ant-..." },
  { key: "TAVILY_API_KEY", field: "tavilyKey" as keyof Health, label: "Tavily API key (fallback search)", example: "tvly-..." },
  { key: "LINKEDIN_BRIDGE_URL", field: "linkedinBridgeConfigured" as keyof Health, label: "LinkedIn bridge URL (NUC tunnel)", example: "https://xxx.trycloudflare.com" },
  { key: "LINKEDIN_BRIDGE_TOKEN", field: null as unknown as keyof Health, label: "LinkedIn bridge auth token", example: "generated-secret-token" },
];

function StatusIcon({ ok }: { ok: boolean }) {
  return ok
    ? <CheckCircle size={16} color="var(--green)" />
    : <XCircle size={16} color="var(--red)" />;
}

export default function SettingsPage() {
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => { setHealth(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const allGood = health?.database && health?.anthropicKey && health?.tavilyKey;

  return (
    <div>
      <div className="page-header">
        <h1>Settings</h1>
        <p>API status and setup</p>
      </div>

      {/* Health check */}
      <div style={{ marginBottom: 24 }}>
        <div className="section-title">API & Database Status</div>
        {loading ? (
          <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Checking…</div>
        ) : (
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {!allGood && (
              <div className="banner banner-warning">
                Setup required — add missing env vars to Vercel or <code style={{ fontFamily: "var(--font-mono)" }}>.env.local</code>
              </div>
            )}
            {ENV_DOCS.map(({ key, field, label }) => {
              const ok = field && health ? !!health[field] : false;
              return (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <StatusIcon ok={ok} />
                  <div style={{ flex: 1 }}>
                    <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text)" }}>{key}</code>
                    <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>{label}</div>
                  </div>
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: ok ? "var(--green)" : "var(--red)" }}>
                    {ok ? "configured" : "missing"}
                  </span>
                </div>
              );
            })}
            {/* LinkedIn bridge live status */}
            {health?.linkedinBridgeConfigured && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                <StatusIcon ok={health.linkedinBridge} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, color: "var(--text)" }}>LinkedIn Bridge</span>
                  <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>NUC live connection</div>
                </div>
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: health.linkedinBridge ? "var(--green)" : "var(--amber)" }}>
                  {health.linkedinBridge ? "online" : "offline"}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Local setup */}
      <div style={{ marginBottom: 24 }}>
        <div className="section-title">Local Setup</div>
        <div className="card">
          <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--text-muted)" }}>
            Create <code style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>.env.local</code> in project root:
          </p>
          <pre style={{ margin: "0 0 10px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 6, padding: "12px 14px", overflowX: "auto" }}>
{ENV_DOCS.map(({ key, example }) => `${key}="${example}"`).join("\n")}
          </pre>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-faint)" }}>
            Then run <code style={{ fontFamily: "var(--font-mono)" }}>npm run db:migrate</code> to initialise the schema.
          </p>
        </div>
      </div>

      {/* Vercel setup */}
      <div style={{ marginBottom: 24 }}>
        <div className="section-title">Vercel Setup</div>
        <div className="card">
          <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "var(--text-muted)", lineHeight: 2.2 }}>
            <li>Create a free <strong style={{ color: "var(--text)" }}>Neon</strong> account → new project → copy the pooled connection string.</li>
            <li>Vercel project → Environment Variables → add the three vars above.</li>
            <li>Redeploy. After deploy, run <code style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>npm run db:migrate</code> once locally pointing at the prod DB.</li>
          </ol>
        </div>
      </div>

      {/* LinkedIn import */}
      <div style={{ marginBottom: 24 }}>
        <div className="section-title">LinkedIn Bulk Import</div>
        <div className="card" style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.8 }}>
          <p style={{ margin: "0 0 10px" }}>
            LinkedIn scraping runs locally via Claude Code (MCP browser). To import jobs:
          </p>
          <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 2.2 }}>
            <li>Open Claude Code in this project directory.</li>
            <li>Ask: <em style={{ color: "var(--text)" }}>"Search LinkedIn for [role] jobs in Israel, import relevant ones"</em></li>
            <li>Claude searches LinkedIn, filters by your profile, and posts to <code style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>/api/jobs/bulk</code>.</li>
            <li>Jobs appear in Discover sorted by match score automatically.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
