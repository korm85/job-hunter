"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, RefreshCw, Plus, Check } from "lucide-react";
import { JobCard, type JobCardData } from "@/components/job-card";

interface SearchResult {
  title: string;
  company: string;
  location: string;
  url: string;
  description: string;
  source: string;
}

interface JobWithScore extends JobCardData {
  fitScore?: number;
  application?: { fitAssessment: string | null } | null;
}

function extractScore(job: JobWithScore): number {
  try {
    if (!job.application?.fitAssessment) return -1;
    const parsed = JSON.parse(job.application.fitAssessment);
    return parsed.score ?? -1;
  } catch { return -1; }
}

export default function DiscoverPage() {
  const [jobs, setJobs] = useState<JobWithScore[]>([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [keywords, setKeywords] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState<Set<number>>(new Set());
  const [assessing, setAssessing] = useState<Set<string>>(new Set());
  const [dbError, setDbError] = useState(false);
  const [stats, setStats] = useState({ queue: 0, applied: 0 });

  const fetchJobs = useCallback(async () => {
    try {
      const r = await fetch("/api/jobs?status=SAVED");
      const d = await r.json();
      if (!d.error) {
        const mapped: JobWithScore[] = d.map((j: Record<string, unknown>) => ({
          ...j,
          hasApplication: !!(j.application && (j.application as Record<string, unknown>).tailoredCv),
          application: j.application as { fitAssessment: string | null } | null,
        }));
        // Sort: scored jobs by score desc, unscored at end
        mapped.sort((a, b) => {
          const sa = extractScore(a);
          const sb = extractScore(b);
          if (sa === -1 && sb === -1) return 0;
          if (sa === -1) return 1;
          if (sb === -1) return -1;
          return sb - sa;
        });
        setJobs(mapped);
      } else {
        setDbError(true);
      }
    } catch {
      setDbError(true);
    } finally {
      setDbLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const r = await fetch("/api/stats");
      const d = await r.json();
      if (!d.error) setStats({ queue: d.byStatus?.SAVED || 0, applied: d.byStatus?.APPLIED || 0 });
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchJobs();
    fetchStats();
  }, [fetchJobs, fetchStats]);

  async function handleSearch() {
    if (!keywords.trim()) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const r = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: keywords.trim(), location: "Israel", domains: [] }),
      });
      const d = await r.json();
      if (!d.error) setSearchResults(d.results || []);
    } catch { /* silent */ }
    finally { setSearching(false); }
  }

  async function handleSaveResult(result: SearchResult, idx: number) {
    setSaving((s) => new Set(s).add(idx));
    try {
      const r = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: result.title,
          company: result.company,
          location: result.location,
          url: result.url,
          description: result.description,
          source: result.source,
        }),
      });
      const d = await r.json();
      if (!d.error) {
        setSaved((s) => new Set(s).add(idx));
        // Auto-assess in background
        triggerAssess(d.id);
        fetchJobs();
        fetchStats();
      }
    } finally {
      setSaving((s) => { const n = new Set(s); n.delete(idx); return n; });
    }
  }

  async function triggerAssess(jobId: string) {
    setAssessing((a) => new Set(a).add(jobId));
    try {
      await fetch(`/api/jobs/${jobId}/assess`, { method: "POST" });
      await fetchJobs();
    } finally {
      setAssessing((a) => { const n = new Set(a); n.delete(jobId); return n; });
    }
  }

  async function handleDismiss(id: string) {
    await fetch(`/api/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "WITHDRAWN" }),
    });
    setJobs((prev) => prev.filter((j) => j.id !== id));
    fetchStats();
  }

  // Separate jobs: scored (shown sorted) vs unscored (being assessed)
  const scoredJobs = jobs.filter((j) => extractScore(j) >= 0);
  const unscoredJobs = jobs.filter((j) => extractScore(j) < 0);

  return (
    <div>
      <div className="page-header">
        <h1>Discover</h1>
        {!dbError && <p>{stats.queue} in queue · {stats.applied} applied</p>}
      </div>

      {dbError && (
        <div className="banner banner-warning">
          Database not connected. <a href="/settings" style={{ color: "inherit", fontWeight: 600 }}>Set up →</a>
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Search job boards…"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            style={{ flex: 1 }}
          />
          <button
            className="btn btn-primary"
            onClick={handleSearch}
            disabled={searching || !keywords.trim()}
            style={{ flexShrink: 0, minWidth: 52, padding: "12px 16px" }}
          >
            {searching
              ? <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} />
              : <Search size={16} />}
          </button>
        </div>
      </div>

      {/* Search results */}
      {searchResults.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="section-title">{searchResults.length} Results</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {searchResults.map((r, i) => (
              <div key={i} className="job-card">
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--surface2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "var(--text-muted)", flexShrink: 0 }}>
                    {r.company.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text)" }}>{r.title}</div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{r.company}{r.location && ` · ${r.location}`}</div>
                  </div>
                </div>
                {r.description && (
                  <p style={{ fontSize: 13, color: "var(--text-faint)", marginBottom: 10, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {r.description}
                  </p>
                )}
                <button
                  className={`btn btn-sm btn-full ${saved.has(i) ? "btn-ghost" : "btn-primary"}`}
                  onClick={() => !saved.has(i) && handleSaveResult(r, i)}
                  disabled={saved.has(i) || saving.has(i)}
                >
                  {saved.has(i)
                    ? <><Check size={14} /> Saved — scoring match…</>
                    : saving.has(i) ? "Saving…"
                    : <><Plus size={14} /> Save & Score</>}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scored jobs (sorted by match) */}
      {!dbError && !dbLoading && scoredJobs.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div className="section-title">Queue — by match score</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {scoredJobs.map((job) => {
              const score = extractScore(job);
              return (
                <div key={job.id} style={{ position: "relative" }}>
                  {/* Score badge */}
                  <div style={{
                    position: "absolute", top: 14, right: 14, zIndex: 1,
                    fontSize: 13, fontWeight: 700,
                    color: score >= 75 ? "var(--green)" : score >= 50 ? "var(--amber)" : "var(--text-faint)",
                  }}>
                    {score}
                  </div>
                  <JobCard job={job} mode="discover" onDismiss={handleDismiss} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Unscored / being assessed */}
      {!dbError && unscoredJobs.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div className="section-title">Scoring match…</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {unscoredJobs.map((job) => (
              <div key={job.id} style={{ opacity: 0.6 }}>
                <JobCard job={job} mode="discover" onDismiss={handleDismiss} />
              </div>
            ))}
          </div>
        </div>
      )}

      {!dbError && !dbLoading && jobs.length === 0 && searchResults.length === 0 && (
        <div className="empty-state">
          <h3>Nothing in queue</h3>
          <p>Search above to find fresh roles. Save → match score runs automatically.</p>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
