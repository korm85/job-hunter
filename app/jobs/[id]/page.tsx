"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, STATUS_ORDER, STATUS_LABELS } from "@/lib/utils";
import { ExternalLink, Zap, Copy, Check, Trash2, ArrowLeft } from "lucide-react";

interface FitAssessment {
  recommendation: string;
  strengths: string[];
  genuineGaps: string[];
  keywordGaps: string[];
  summary: string;
}

interface Application {
  fitAssessment: string | null;
  tailoredCv: string | null;
  coverLetter: string | null;
  linkedinMessage: string | null;
  baseVariant: string | null;
  generatedAt: string | null;
}

interface StatusEvent {
  id: string;
  from: string;
  to: string;
  note: string | null;
  createdAt: string;
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
  isGhostRisk: boolean;
  notes: string | null;
  createdAt: string;
  appliedAt: string | null;
  application: Application | null;
  statusHistory: StatusEvent[];
}

type Tab = "fit" | "cv" | "cover" | "linkedin" | "notes" | "history";

const TABS: { id: Tab; label: string }[] = [
  { id: "fit", label: "Fit Assessment" },
  { id: "cv", label: "Tailored CV" },
  { id: "cover", label: "Cover Letter" },
  { id: "linkedin", label: "LinkedIn Message" },
  { id: "notes", label: "Notes" },
  { id: "history", label: "History" },
];

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("fit");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesValue, setNotesValue] = useState("");
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  const fetchJob = useCallback(async () => {
    try {
      const r = await fetch(`/api/jobs/${id}`);
      const d = await r.json();
      if (d.error) { setError(d.error); return; }
      setJob(d);
      setNotesValue(d.notes || "");
    } catch {
      setError("Failed to load job");
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
      if (d.error) { setGenerateError(d.error); return; }
      await fetchJob();
      setActiveTab("fit");
    } finally {
      setGenerating(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    if (!job || newStatus === job.status) return;
    setStatusUpdating(true);
    try {
      await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchJob();
    } finally {
      setStatusUpdating(false);
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
    if (!confirm("Delete this job permanently?")) return;
    await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    router.push("/pipeline");
  }

  function copyText(key: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied((c) => ({ ...c, [key]: true }));
      setTimeout(() => setCopied((c) => ({ ...c, [key]: false })), 2000);
    });
  }

  if (loading) return <div style={{ color: "var(--text-muted)", fontSize: 13, padding: "40px 0" }}>Loading...</div>;
  if (error || !job) return (
    <div style={{ color: "var(--red)", fontSize: 13, padding: "40px 0" }}>
      {error || "Job not found"}.{" "}
      <Link href="/pipeline" style={{ color: "var(--accent)" }}>Back to Pipeline</Link>
    </div>
  );

  const fitAssessment: FitAssessment | null = (() => {
    try { return job.application?.fitAssessment ? JSON.parse(job.application.fitAssessment) : null; }
    catch { return null; }
  })();

  const hasApplication = !!job.application;

  return (
    <div>
      {/* Back + Header */}
      <div style={{ marginBottom: 6 }}>
        <Link href="/pipeline" style={{ color: "var(--text-faint)", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
          <ArrowLeft size={12} /> Pipeline
        </Link>
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4, lineHeight: 1.3 }}>{job.title}</h1>
          <div style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span>{job.company}</span>
            {job.location && <span>· {job.location}</span>}
            {job.domain && <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-faint)" }}>{job.domain}</span>}
            {job.url && (
              <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 4 }}>
                <ExternalLink size={12} /> Original posting
              </a>
            )}
          </div>
          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
            {job.fitTier && <StatusBadge status={job.fitTier} type="fit" />}
            {job.isGhostRisk && (
              <span style={{ fontSize: 11, color: "var(--amber)", background: "var(--amber-dim)", padding: "2px 8px", borderRadius: 4 }}>⚠ Ghost Risk</span>
            )}
            <span style={{ fontSize: 11, color: "var(--text-faint)" }}>Added {formatDate(job.createdAt)}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          {/* Status selector */}
          <select
            value={job.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={statusUpdating}
            style={{ minWidth: 130, fontSize: 13 }}
          >
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>

          {/* Generate */}
          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={generating}
          >
            <Zap size={14} />
            {generating ? "Generating..." : hasApplication ? "Regenerate" : "Generate All"}
          </button>

          {/* Delete */}
          <button className="btn btn-danger btn-sm" onClick={handleDelete} title="Delete job">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {generateError && (
        <div style={{ background: "var(--red-dim)", border: "1px solid var(--red)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "var(--red)", fontSize: 13 }}>
          {generateError}
        </div>
      )}

      {generating && (
        <div style={{ background: "var(--accent-dim)", border: "1px solid var(--accent)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "var(--accent)", fontSize: 13 }}>
          Generating fit assessment, tailored CV, cover letter, and LinkedIn message in parallel... (30–60s)
        </div>
      )}

      {/* Tabs */}
      <div className="tab-bar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab ${activeTab === t.id ? "active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "fit" && (
        <div>
          {!fitAssessment ? (
            <EmptyState onGenerate={handleGenerate} generating={generating} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <StatusBadge status={fitAssessment.recommendation} type="fit" />
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)", flex: 1 }}>{fitAssessment.summary}</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="card">
                  <div className="section-title" style={{ marginBottom: 10 }}>Strengths</div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7 }}>
                    {fitAssessment.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div className="card">
                  <div className="section-title" style={{ marginBottom: 10 }}>Gaps</div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7 }}>
                    {fitAssessment.genuineGaps.map((g, i) => <li key={i}>{g}</li>)}
                  </ul>
                  {fitAssessment.keywordGaps.length > 0 && (
                    <>
                      <div style={{ marginTop: 10, marginBottom: 6, fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Keyword gaps</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {fitAssessment.keywordGaps.map((k, i) => (
                          <span key={i} style={{ fontSize: 11, fontFamily: "var(--font-mono)", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 3, padding: "1px 6px", color: "var(--text-muted)" }}>{k}</span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "cv" && (
        <TextTab
          content={job.application?.tailoredCv || null}
          label="Tailored CV"
          copyKey="cv"
          copied={copied}
          onCopy={copyText}
          onGenerate={handleGenerate}
          generating={generating}
          mono
        />
      )}

      {activeTab === "cover" && (
        <TextTab
          content={job.application?.coverLetter || null}
          label="Cover Letter"
          copyKey="cover"
          copied={copied}
          onCopy={copyText}
          onGenerate={handleGenerate}
          generating={generating}
        />
      )}

      {activeTab === "linkedin" && (
        <TextTab
          content={job.application?.linkedinMessage || null}
          label="LinkedIn Outreach Message"
          copyKey="linkedin"
          copied={copied}
          onCopy={copyText}
          onGenerate={handleGenerate}
          generating={generating}
        />
      )}

      {activeTab === "notes" && (
        <div>
          <textarea
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            placeholder="Add notes about this role, interview feedback, contact names, next steps..."
            style={{ width: "100%", minHeight: 200, resize: "vertical", marginBottom: 12 }}
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSaveNotes}
            disabled={notesSaving || notesValue === (job.notes || "")}
          >
            {notesSaving ? "Saving..." : "Save Notes"}
          </button>
        </div>
      )}

      {activeTab === "history" && (
        <div>
          {job.statusHistory.length === 0 ? (
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>No status changes recorded.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {job.statusHistory.map((ev) => (
                <div key={ev.id} className="card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px" }}>
                  <StatusBadge status={ev.from} small />
                  <span style={{ color: "var(--text-faint)", fontSize: 12 }}>→</span>
                  <StatusBadge status={ev.to} small />
                  {ev.note && <span style={{ fontSize: 12, color: "var(--text-muted)", flex: 1 }}>{ev.note}</span>}
                  <span style={{ fontSize: 11, color: "var(--text-faint)", marginLeft: "auto" }}>{formatDate(ev.createdAt)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          {job.description && (
            <div style={{ marginTop: 24 }}>
              <div className="section-title">Job Description</div>
              <div className="card">
                <pre style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--text-muted)", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                  {job.description}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ onGenerate, generating }: { onGenerate: () => void; generating: boolean }) {
  return (
    <div style={{ padding: "40px 0", textAlign: "center" }}>
      <div style={{ color: "var(--text-faint)", fontSize: 13, marginBottom: 16 }}>
        No data yet. Generate fit assessment, tailored CV, cover letter, and LinkedIn message.
      </div>
      <button className="btn btn-primary" onClick={onGenerate} disabled={generating}>
        <Zap size={14} />
        {generating ? "Generating..." : "Generate All"}
      </button>
    </div>
  );
}

function TextTab({
  content, label, copyKey, copied, onCopy, onGenerate, generating, mono,
}: {
  content: string | null;
  label: string;
  copyKey: string;
  copied: Record<string, boolean>;
  onCopy: (key: string, text: string) => void;
  onGenerate: () => void;
  generating: boolean;
  mono?: boolean;
}) {
  if (!content) return <EmptyState onGenerate={onGenerate} generating={generating} />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => onCopy(copyKey, content)}>
          {copied[copyKey] ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
        </button>
      </div>
      <div className="card">
        <pre style={{
          margin: 0,
          fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
          fontSize: 12,
          color: "var(--text-muted)",
          whiteSpace: "pre-wrap",
          lineHeight: 1.7,
        }}>
          {content}
        </pre>
      </div>
    </div>
  );
}
