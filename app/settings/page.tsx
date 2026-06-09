"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface Health {
  database: boolean;
  anthropicKey: boolean;
  tavilyKey: boolean;
}

const ENV_DOCS = [
  { key: "DATABASE_URL", field: "database" as keyof Health, label: "Neon Postgres (primary URL)", example: "postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require" },
  { key: "DIRECT_URL", field: null, label: "Neon Postgres (direct URL for migrations)", example: "postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require" },
  { key: "ANTHROPIC_API_KEY", field: "anthropicKey" as keyof Health, label: "Anthropic API key (CV generation)", example: "sk-ant-..." },
  { key: "TAVILY_API_KEY", field: "tavilyKey" as keyof Health, label: "Tavily API key (job search)", example: "tvly-..." },
];

function StatusIcon({ ok }: { ok: boolean | null }) {
  if (ok === null) return <AlertTriangle size={16} color="var(--amber)" />;
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
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Settings</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Environment configuration and API status</p>
      </div>

      {/* Health check */}
      <div style={{ marginBottom: 32 }}>
        <div className="section-title">API & Database Status</div>
        {loading ? (
          <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Checking...</div>
        ) : (
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {!allGood && (
              <div style={{ background: "var(--amber-dim)", border: "1px solid var(--amber)", borderRadius: 6, padding: "10px 14px", fontSize: 13, color: "var(--amber)", marginBottom: 4 }}>
                <strong>Setup required.</strong> Add the missing environment variables to your Vercel project or local <code style={{ fontFamily: "var(--font-mono)" }}>.env.local</code> file.
              </div>
            )}
            {ENV_DOCS.map(({ key, field, label }) => {
              const ok = field && health ? health[field] : null;
              return (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <StatusIcon ok={ok} />
                  <div style={{ flex: 1 }}>
                    <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text)" }}>{key}</code>
                    <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 1 }}>{label}</div>
                  </div>
                  {field && health && (
                    <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: ok ? "var(--green)" : "var(--red)" }}>
                      {ok ? "configured" : "missing"}
                    </span>
                  )}
                  {!field && (
                    <span style={{ fontSize: 11, color: "var(--text-faint)" }}>not checked at runtime</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Setup instructions */}
      <div style={{ marginBottom: 32 }}>
        <div className="section-title">Local Setup</div>
        <div className="card">
          <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--text-muted)" }}>
            Create a <code style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>.env.local</code> file in the project root with:
          </p>
          <pre style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 6, padding: "12px 16px", overflowX: "auto" }}>
{ENV_DOCS.map(({ key, example }) => `${key}="${example}"`).join("\n")}
          </pre>
          <p style={{ margin: "12px 0 0", fontSize: 12, color: "var(--text-faint)" }}>
            After adding vars, run <code style={{ fontFamily: "var(--font-mono)" }}>npx prisma migrate deploy</code> to initialise the database schema.
          </p>
        </div>
      </div>

      {/* Vercel setup */}
      <div style={{ marginBottom: 32 }}>
        <div className="section-title">Vercel Setup</div>
        <div className="card">
          <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "var(--text-muted)", lineHeight: 2 }}>
            <li>Create a free <strong style={{ color: "var(--text)" }}>Neon</strong> account at neon.tech → create a new project → copy the connection strings.</li>
            <li>In Vercel project settings → Environment Variables → add all four variables above.</li>
            <li>Set <code style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>DATABASE_URL</code> to the pooled connection and <code style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>DIRECT_URL</code> to the direct connection.</li>
            <li>Redeploy. The build runs <code style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>prisma migrate deploy</code> automatically.</li>
          </ol>
        </div>
      </div>

      {/* Ghost risk info */}
      <div>
        <div className="section-title">Ghost Risk Policy</div>
        <div className="card" style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7 }}>
          Jobs in <strong style={{ color: "var(--text)" }}>Applied</strong> or <strong style={{ color: "var(--text)" }}>Screening</strong> status with no update in <strong style={{ color: "var(--amber)" }}>21 days</strong> are automatically flagged as Ghost Risk.
          The flag is recalculated on every pipeline load. Advance the status (e.g. to Rejected or Ghosted) to clear the flag.
        </div>
      </div>
    </div>
  );
}
