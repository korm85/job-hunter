"use client";

import Link from "next/link";
import { ExternalLink, Zap, Copy, Check, X, MapPin, Clock } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { daysSince } from "@/lib/utils";
import { useState } from "react";

export interface JobCardData {
  id: string;
  title: string;
  company: string;
  location: string | null;
  domain: string | null;
  source: string;
  status: string;
  fitTier: string | null;
  url: string | null;
  createdAt: string;
  appliedAt: string | null;
  hasApplication: boolean;
  generating?: boolean;
}

interface JobCardProps {
  job: JobCardData;
  mode: "discover" | "queue" | "applied";
  onDismiss?: (id: string) => void;
  onSave?: (id: string) => void;
  onGenerate?: (id: string) => void;
  onCopyCv?: (id: string) => void;
  onCopyLetter?: (id: string) => void;
  cvText?: string | null;
  letterText?: string | null;
}

export function JobCard({
  job, mode, onDismiss, onSave, onGenerate, onCopyCv, onCopyLetter, cvText, letterText,
}: JobCardProps) {
  const [copiedCv, setCopiedCv] = useState(false);
  const [copiedLetter, setCopiedLetter] = useState(false);

  function copy(text: string, setCopied: (v: boolean) => void) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const daysAgo = daysSince(job.createdAt);

  return (
    <div className="job-card">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, background: "var(--surface2)",
          border: "1px solid var(--border)", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 15, fontWeight: 700, color: "var(--text-muted)",
          flexShrink: 0, letterSpacing: "-0.02em",
        }}>
          {job.company.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link
            href={`/jobs/${job.id}`}
            style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", textDecoration: "none", display: "block", lineHeight: 1.3 }}
          >
            {job.title}
          </Link>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{job.company}</div>
        </div>
        {job.url && (
          <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-faint)", flexShrink: 0, padding: 4 }}>
            <ExternalLink size={14} />
          </a>
        )}
      </div>

      {/* Meta row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        {job.location && (
          <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, color: "var(--text-faint)" }}>
            <MapPin size={11} /> {job.location}
          </span>
        )}
        {job.domain && (
          <span className="source-badge">{job.domain}</span>
        )}
        <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, color: "var(--text-faint)" }}>
          <Clock size={11} />
          {daysAgo === 0 ? "Today" : `${daysAgo}d ago`}
        </span>
        {job.fitTier && <StatusBadge status={job.fitTier} type="fit" small />}
        {job.hasApplication && (
          <span style={{ fontSize: 11, color: "var(--green)", background: "var(--green-dim)", padding: "2px 7px", borderRadius: 4, fontWeight: 600 }}>
            CV Ready
          </span>
        )}
        <span className="source-badge">{job.source}</span>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {mode === "discover" && (
          <>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onDismiss?.(job.id)}
              style={{ minWidth: 0, padding: "8px 12px" }}
            >
              <X size={14} /> Dismiss
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onSave?.(job.id)}
              style={{ flex: 1 }}
            >
              Save to Queue
            </button>
          </>
        )}

        {mode === "queue" && (
          <>
            {!job.hasApplication ? (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => onGenerate?.(job.id)}
                disabled={job.generating}
                style={{ flex: 1 }}
              >
                <Zap size={14} />
                {job.generating ? "Generating..." : "Generate Materials"}
              </button>
            ) : (
              <>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => cvText && copy(cvText, setCopiedCv)}
                  disabled={!cvText}
                >
                  {copiedCv ? <><Check size={12} /> Copied</> : <><Copy size={12} /> CV</>}
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => letterText && copy(letterText, setCopiedLetter)}
                  disabled={!letterText}
                >
                  {copiedLetter ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Letter</>}
                </button>
                <Link href={`/jobs/${job.id}`} className="btn btn-ghost btn-sm" style={{ flex: 1, textDecoration: "none" }}>
                  View
                </Link>
              </>
            )}
          </>
        )}

        {mode === "applied" && (
          <>
            <span style={{ fontSize: 12, color: "var(--text-faint)" }}>
              Applied {job.appliedAt ? `${daysSince(job.appliedAt)}d ago` : ""}
            </span>
            <Link href={`/jobs/${job.id}`} className="btn btn-ghost btn-sm" style={{ marginLeft: "auto", textDecoration: "none" }}>
              View
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
