"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, daysSince, STATUS_ORDER, STATUS_LABELS } from "@/lib/utils";
import { AlertTriangle, ExternalLink } from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string | null;
  url: string | null;
  domain: string | null;
  status: string;
  fitTier: string | null;
  isGhostRisk: boolean;
  createdAt: string;
  appliedAt: string | null;
  updatedAt: string;
}

const TABS = [
  { value: "ALL", label: "All" },
  ...STATUS_ORDER.map((s) => ({ value: s, label: STATUS_LABELS[s] })),
  { value: "GHOST", label: "Ghost Risk" },
];

function PipelineContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialStatus = searchParams.get("status") || "ALL";
  const initialFilter = searchParams.get("filter");

  const [activeTab, setActiveTab] = useState(
    initialFilter === "ghost" ? "GHOST" : initialStatus
  );
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchJobs = useCallback(async (tab: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (tab === "GHOST") {
        params.set("ghostRisk", "true");
      } else if (tab !== "ALL") {
        params.set("status", tab);
      }
      const r = await fetch(`/api/jobs?${params}`);
      const d = await r.json();
      if (d.error) setError(d.error);
      else setJobs(d);
    } catch {
      setError("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs(activeTab);
  }, [activeTab, fetchJobs]);

  function handleTabChange(tab: string) {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    if (tab === "GHOST") {
      url.searchParams.set("filter", "ghost");
      url.searchParams.delete("status");
    } else if (tab === "ALL") {
      url.searchParams.delete("status");
      url.searchParams.delete("filter");
    } else {
      url.searchParams.set("status", tab);
      url.searchParams.delete("filter");
    }
    router.replace(url.pathname + url.search, { scroll: false });
  }

  async function handleStatusChange(jobId: string, newStatus: string) {
    setUpdating(jobId);
    try {
      await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchJobs(activeTab);
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Pipeline</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
          {jobs.length} job{jobs.length !== 1 ? "s" : ""}
          {activeTab !== "ALL" ? ` · ${activeTab === "GHOST" ? "Ghost Risk" : STATUS_LABELS[activeTab]}` : ""}
        </p>
      </div>

      {/* Tab bar */}
      <div className="tab-bar" style={{ overflowX: "auto" }}>
        {TABS.map((t) => (
          <button
            key={t.value}
            className={`tab ${activeTab === t.value ? "active" : ""}`}
            onClick={() => handleTabChange(t.value)}
            style={t.value === "GHOST" ? { color: activeTab === "GHOST" ? "var(--amber)" : undefined } : {}}
          >
            {t.value === "GHOST" && <AlertTriangle size={11} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />}
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ background: "var(--red-dim)", border: "1px solid var(--red)", borderRadius: 8, padding: "12px 16px", marginBottom: 16, color: "var(--red)", fontSize: 13 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ color: "var(--text-muted)", fontSize: 13, padding: "32px 0" }}>Loading...</div>
      ) : jobs.length === 0 ? (
        <div style={{ color: "var(--text-muted)", fontSize: 13, padding: "40px 0", textAlign: "center" }}>
          No jobs in this view.{" "}
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
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className={job.isGhostRisk ? "ghost-risk" : ""}>
                  <td>
                    <Link href={`/jobs/${job.id}`} style={{ color: "var(--text)", fontWeight: 500, textDecoration: "none" }}>
                      {job.title}
                    </Link>
                    {job.isGhostRisk && (
                      <span style={{ marginLeft: 8, fontSize: 11, color: "var(--amber)" }}>⚠ Ghost</span>
                    )}
                  </td>
                  <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{job.company}</td>
                  <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{job.domain || "—"}</td>
                  <td>
                    <select
                      value={job.status}
                      onChange={(e) => handleStatusChange(job.id, e.target.value)}
                      disabled={updating === job.id}
                      style={{
                        background: "transparent",
                        border: "none",
                        padding: 0,
                        fontSize: 12,
                        color: "inherit",
                        cursor: "pointer",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {STATUS_ORDER.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {job.fitTier
                      ? <StatusBadge status={job.fitTier} type="fit" small />
                      : <span style={{ color: "var(--text-faint)", fontSize: 12 }}>—</span>}
                  </td>
                  <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{formatDate(job.createdAt)}</td>
                  <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{daysSince(job.createdAt)}d</td>
                  <td>
                    {job.url ? (
                      <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-faint)" }}>
                        <ExternalLink size={12} />
                      </a>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function PipelinePage() {
  return (
    <Suspense fallback={<div style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading pipeline...</div>}>
      <PipelineContent />
    </Suspense>
  );
}
