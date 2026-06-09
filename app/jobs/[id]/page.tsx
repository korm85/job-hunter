"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Zap, Copy, Check, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/utils";

interface FitAssessment {
  recommendation: string;
  strengths: string[];
  genuineGaps: string[];
  keywordGaps: string[];
  summary: string;
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string | null;
  url: string | null;
  description: string | null;
  domain: string | null;
  status: string;
  fitTier: string | null;
  notes: string | null;
  createdAt: string;
  appliedAt: string | null;
  application: {
    fitAssessment: string | null;
    tailoredCv: string | null;
    coverLetter: string | null;
    linkedinMessage: string | null;
    generatedAt: string | null;
  } | null;
  statusHistory: { id: string; from: string; to: string; note: string | null; createdAt: string }[];
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button className="btn btn-ghost btn-sm" onClick={copy} style={{ marginLeft: "auto" }}>
      {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> {label}</>}
    </button>
  );
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="card" style={{ marginBottom: 10 }}>
      <div
        style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="section-title" style={{ marginBottom: 0, flex: 1 }}>{title}</span>
        {action && <span onClick={(e) => e.stopPropagation()}>{action}</span>}
        {open ? <ChevronUp size={14} color="var(--text-faint)" /> : <ChevronDown size={14} color="var(--text-faint)" />}
      </div>
      {open && <div style={{ marginTop: 12 }}>{children}</div>}
    </div>
  );
}

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [markingApplied, setMarkingApplied] = useState(false);
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesValue, setNotesValue] = useState("");

  const fetchJob = useCallback(async () => {
    try {
      const r = await fetch(`/api/jobs/${id}`);
      const d = await r.json();
      if (d.error) { setError(d.error); return; }
      setJob(d);
      setNotesValue(d.notes || "");
    } catch {
      setError("Failed to load");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchJob(); }, [fetchJob]);

  async function handleGenerate() {
    setGenerating(true);
    setGenerateError(null);
    try {
      const r = await fetch(`/api/jobs/${id}/generate`, { method: "POST" });
      const d = await r.json();
      if (d.error) setGenerateError(d.error);
      else await fetchJob();
    } finally {
      setGenerating(false);
    }
  }

  async function handleMarkApplied() {
    setMarkingApplied(true);
    try {
      await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPLIED" }),
      });
      await fetchJob();
    } finally {
      setMarkingApplied(false);
    }
  }

  async function handleSaveNotes() {
    setNotesSaving(true);
    try {
      await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesValue }),
      });
      await fetchJob();
    } finally {
      setNotesSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this job?")) return;
    await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    router.push("/");
  }

  if (loading) return <div className="empty-state">Loading…</div>;
  if (error || !job) return (
    <div className="empty-state">
      <p>{error || "Not found"}</p>
      <Link href="/" style={{ color: "var(--accent)" }}>← Back</Link>
    </div>
  );

  const fit: FitAssessment | null = (() => {
    try { return job.application?.fitAssessment ? JSON.parse(job.application.fitAssessment) : null; }
    catch { return null; }
  })();

  const hasApp = !!job.application;
  const isApplied = job.status === "APPLIED";

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Back */}
      <div style={{ marginBottom: 12 }}>
        <Link href="/" style={{ color: "var(--text-faint)", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
          <ArrowLeft size={14} /> Back
        </Link>
      </div>

      {/* Job header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.02em" }}>{job.title}</h1>
            <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
              {job.company}{job.location && ` · ${job.location}`}
            </div>
          </div>
          <button className="btn btn-danger btn-sm" onClick={handleDelete} style={{ padding: "8px", minHeight: 0 }}>
            <Trash2 size={14} />
          </button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 10 }}>
          {job.fitTier && <StatusBadge status={job.fitTier} type="fit" />}
          <StatusBadge status={job.status} />
          {job.domain && <span className="source-badge">{job.domain}</span>}
          {job.url && (
            <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
              <ExternalLink size={12} /> View posting
            </a>
          )}
        </div>

        <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 6 }}>
          Saved {formatDate(job.createdAt)}
          {job.appliedAt && ` · Applied ${formatDate(job.appliedAt)}`}
        </div>
      </div>

      {generateError && <div className="banner banner-error" style={{ marginBottom: 12 }}>{generateError}</div>}

      {generating && (
        <div className="banner banner-info" style={{ marginBottom: 12 }}>
          Generating tailored CV, cover letter, fit assessment, LinkedIn message… (30–60s)
        </div>
      )}

      {/* Generate CTA (if no materials yet) */}
      {!hasApp && !generating && (
        <button className="btn btn-primary btn-full" onClick={handleGenerate} style={{ marginBottom: 16 }}>
          <Zap size={16} /> Generate Tailored Materials
        </button>
      )}

      {/* Fit Assessment */}
      {fit && (
        <Section title="Fit Assessment">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <StatusBadge status={fit.recommendation} type="fit" />
            <p style={{ fontSize: 13, color: "var(--text-muted)", flex: 1 }}>{fit.summary}</p>
          </div>
          {fit.strengths.length > 0 && (
            <>
              <div style={{ fontSize: 11, color: "var(--text-faint)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Strengths</div>
              <ul style={{ paddingLeft: 18, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 10 }}>
                {fit.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </>
          )}
          {(fit.genuineGaps.length > 0 || fit.keywordGaps.length > 0) && (
            <>
              <div style={{ fontSize: 11, color: "var(--text-faint)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Gaps</div>
              <ul style={{ paddingLeft: 18, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 8 }}>
                {fit.genuineGaps.map((g, i) => <li key={i}>{g}</li>)}
              </ul>
              {fit.keywordGaps.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {fit.keywordGaps.map((k, i) => (
                    <span key={i} style={{ fontSize: 11, fontFamily: "var(--font-mono)", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 4, padding: "2px 6px", color: "var(--text-faint)" }}>{k}</span>
                  ))}
                </div>
              )}
            </>
          )}
        </Section>
      )}

      {/* Tailored CV */}
      {job.application?.tailoredCv && (
        <Section
          title="Tailored CV"
          action={<CopyButton text={job.application.tailoredCv} label="Copy CV" />}
        >
          <div className="copy-block">{job.application.tailoredCv}</div>
        </Section>
      )}

      {/* Cover Letter */}
      {job.application?.coverLetter && (
        <Section
          title="Cover Letter"
          action={<CopyButton text={job.application.coverLetter} label="Copy Letter" />}
        >
          <div className="copy-block">{job.application.coverLetter}</div>
        </Section>
      )}

      {/* LinkedIn Message */}
      {job.application?.linkedinMessage && (
        <Section
          title="LinkedIn Outreach"
          action={<CopyButton text={job.application.linkedinMessage} label="Copy" />}
        >
          <div className="copy-block">{job.application.linkedinMessage}</div>
        </Section>
      )}

      {/* Job Description */}
      {job.description && (
        <Section title="Job Description">
          <div className="prose">{job.description}</div>
        </Section>
      )}

      {/* Notes */}
      <Section title="Notes">
        <textarea
          value={notesValue}
          onChange={(e) => setNotesValue(e.target.value)}
          placeholder="Interview notes, contacts, next steps…"
          style={{ minHeight: 100, marginBottom: 10, borderRadius: 8, fontSize: 14 }}
        />
        <button
          className="btn btn-ghost btn-sm"
          onClick={handleSaveNotes}
          disabled={notesSaving || notesValue === (job.notes || "")}
        >
          {notesSaving ? "Saving…" : "Save Notes"}
        </button>
      </Section>

      {/* Sticky footer CTA */}
      <div className="sticky-footer">
        {isApplied ? (
          <button className="btn btn-success btn-full" disabled>
            <Check size={16} /> Applied
          </button>
        ) : hasApp ? (
          <button className="btn btn-success btn-full" onClick={handleMarkApplied} disabled={markingApplied}>
            {markingApplied ? "Updating…" : "Mark as Applied"}
          </button>
        ) : generating ? (
          <button className="btn btn-primary btn-full" disabled>
            <Zap size={16} /> Generating…
          </button>
        ) : (
          <button className="btn btn-primary btn-full" onClick={handleGenerate}>
            <Zap size={16} /> Generate Materials
          </button>
        )}
      </div>
    </div>
  );
}
