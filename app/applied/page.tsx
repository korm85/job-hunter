"use client";

import { useEffect, useState, useCallback } from "react";
import { JobCard, type JobCardData } from "@/components/job-card";

export default function AppliedPage() {
  const [jobs, setJobs] = useState<JobCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      const r = await fetch("/api/jobs?status=APPLIED");
      const d = await r.json();
      if (d.error) { setError(d.error); return; }
      setJobs(d.map((j: Record<string, unknown>) => ({ ...j, hasApplication: !!(j.application) })));
    } catch {
      setError("Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  return (
    <div>
      <div className="page-header">
        <h1>Applied</h1>
        <p>{jobs.length} application{jobs.length !== 1 ? "s" : ""} sent</p>
      </div>

      {error && <div className="banner banner-error">{error}</div>}

      {loading ? (
        <div className="empty-state">Loading…</div>
      ) : jobs.length === 0 ? (
        <div className="empty-state">
          <h3>Nothing applied yet</h3>
          <p>Generate materials in Queue, then mark as applied from the job detail.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} mode="applied" />
          ))}
        </div>
      )}
    </div>
  );
}
