"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, daysSince } from "@/lib/utils";
import { AlertTriangle, Search, TrendingUp, CheckCircle } from "lucide-react";

interface StatsData {
  byStatus: Record<string, number>;
  ghostRiskCount: number;
  recentJobs: {
    id: string;
    title: string;
    company: string;
    status: string;
    fitTier: string | null;
    domain: string | null;
    isGhostRisk: boolean;
    createdAt: string;
    appliedAt: string | null;
  }[];
}

const PIPELINE_STAGES = [
  { status: "SAVED",     label: "Saved",     color: "var(--text-muted)" },
  { status: "APPLIED",   label: "Applied",   color: "var(--accent)" },
  { status: "SCREENING", label: "Screening", color: "var(--cyan)" },
  { status: "INTERVIEW", label: "Interview", color: "var(--purple)" },
  { status: "OFFER",     label: "Offer",     color: "var(--green)" },
];

export default function DashboardPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("Failed to load stats"));
  }, []);

  const totalActive =
    (data?.byStatus["APPLIED"] || 0) +
    (data?.byStatus["SCREENING"] || 0) +
    (data?.byStatus["INTERVIEW"] || 0);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Dashboard</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/search" className="btn btn-primary">
            <Search size={14} />
            Find Jobs
          </Link>
          <Link href="/pipeline" className="btn btn-ghost">
            View Pipeline
          </Link>
        </div>
      </div>

      {/* DB error / setup notice */}
      {error && (
        <div style={{ background: "var(--amber-dim)", border: "1px solid var(--amber)", borderRadius: 8, padding: "14px 18px", marginBottom: 24, color: "var(--amber)" }}>
          <strong>Database not connected.</strong> Add DATABASE_URL, DIRECT_URL, ANTHROPIC_API_KEY, and TAVILY_API_KEY to your environment.{" "}
          <Link href="/settings" style={{ color: "var(--amber)", textDecoration: "underline" }}>Go to Settings</Link>
        </div>
      )}

      {/* Ghost risk alert */}
      {data && data.ghostRiskCount > 0 && (
        <div
          style={{
            background: "var(--amber-dim)",
            border: "1px solid var(--amber)",
            borderRadius: 8,
            padding: "12px 18px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "var(--amber)",
          }}
        >
          <AlertTriangle size={16} />
          <span style={{ fontSize: 13 }}>
            <strong>{data.ghostRiskCount} Ghost Risk</strong> — applications with no update in 21+ days.{" "}
            <Link href="/pipeline?filter=ghost" style={{ color: "var(--amber)", textDecoration: "underline" }}>
              Review now
            </Link>
          </span>
        </div>
      )}

      {/* Pipeline stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 28 }}>
        {PIPELINE_STAGES.map(({ status, label, color }) => (
          <Link key={status} href={`/pipeline?status=${status}`} style={{ textDecoration: "none" }}>
            <div className="stat-block" style={{ cursor: "pointer" }}>
              <div className="stat-value" style={{ color }}>
                {data?.byStatus[status] || 0}
              </div>
              <div className="stat-label">{label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Secondary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 32 }}>
        <div className="card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <TrendingUp size={24} color="var(--purple)" />
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--purple)" }}>{totalActive}</div>
            <div className="stat-label">Active in flight</div>
          </div>
        </div>
        <div className="card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <CheckCircle size={24} color="var(--green)" />
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--green)" }}>{data?.byStatus["OFFER"] || 0}</div>
            <div className="stat-label">Offers</div>
          </div>
        </div>
        <div className="card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <AlertTriangle size={24} color="var(--amber)" />
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--amber)" }}>{data?.ghostRiskCount || 0}</div>
            <div className="stat-label">Ghost risks</div>
          </div>
        </div>
      </div>

      {/* Recent jobs */}
      <div>
        <div className="section-title">Recent Activity</div>
        {!data ? (
          <div style={{ color: "var(--text-muted)", padding: "20px 0", fontSize: 13 }}>
            {error ? "Connect a database to start tracking." : "Loading..."}
          </div>
        ) : data.recentJobs.length === 0 ? (
          <div style={{ color: "var(--text-muted)", padding: "24px 0", fontSize: 13 }}>
            No jobs tracked yet.{" "}
            <Link href="/search" style={{ color: "var(--accent)" }}>Search for roles →</Link>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Company</th>
                  <th>Domain</th>
                  <th>Status</th>
                  <th>Fit</th>
                  <th>Added</th>
                  <th>Days</th>
                </tr>
              </thead>
              <tbody>
                {data.recentJobs.map((job) => (
                  <tr key={job.id} className={job.isGhostRisk ? "ghost-risk" : ""}>
                    <td>
                      <Link href={`/jobs/${job.id}`} style={{ color: "var(--text)", fontWeight: 500, textDecoration: "none" }}>
                        {job.title}
                      </Link>
                      {job.isGhostRisk && (
                        <span style={{ marginLeft: 8, fontSize: 11, color: "var(--amber)" }}>
                          ⚠ Ghost Risk
                        </span>
                      )}
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>{job.company}</td>
                    <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{job.domain || "—"}</td>
                    <td><StatusBadge status={job.status} small /></td>
                    <td>{job.fitTier ? <StatusBadge status={job.fitTier} type="fit" small /> : <span style={{ color: "var(--text-faint)" }}>—</span>}</td>
                    <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{formatDate(job.createdAt)}</td>
                    <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{daysSince(job.createdAt)}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
