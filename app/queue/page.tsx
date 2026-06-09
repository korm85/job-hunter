"use client";

import { useEffect, useState, useCallback } from "react";
import { JobCard, type JobCardData } from "@/components/job-card";

interface JobWithApp extends JobCardData {
  application?: { tailoredCv: string | null; coverLetter: string | null } | null;
}

export default function QueuePage() {
  const [jobs, setJobs] = useState<JobWithApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      const r = await fetch("/api/jobs?status=SAVED");
      const d = await r.json();
      if (d.error) { setError(d.error); return; }
      setJobs(d.map((j: Record<string, unknown>) => ({
        ...j,
        hasApplication: !!(j.application),
      })));
    } catch {
      setError("Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  async function handleGenerate(id: string) {
    setGenerating((g) => new Set(g).add(id));
    try {
      const r = await fetch(`/api/jobs/${id}/generate`, { method: "POST" });
      const d = await r.json();
      if (!d.error) await fetchJobs();
      else setError(d.error);
    } finally {
      setGenerating((g) => { const n = new Set(g); n.delete(id); return n; });
    }
  }

  const readyCount = jobs.filter((j) => j.hasApplication).length;
  const pendingCount = jobs.filter((j) => !j.hasApplication).length;

  return (
    <div>
      <div className="page-header">
        <h1>Queue</h1>
        <p>{readyCount} ready · {pendingCount} pending generation</p>
      </div>

      {error && <div className="banner banner-error">{error}</div>}

      {loading ? (
        <div className="empty-state">Loading…</div>
      ) : jobs.length === 0 ? (
        <div className="empty-state">
          <h3>Queue is empty</h3>
          <p>Save jobs from Discover to generate tailored materials.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={{ ...job, generating: generating.has(job.id) }}
              mode="queue"
              onGenerate={handleGenerate}
              cvText={job.application?.tailoredCv || null}
              letterText={job.application?.coverLetter || null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
