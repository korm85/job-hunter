import { STATUS_LABELS } from "@/lib/utils";

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
  SAVED:          { color: "var(--text-muted)", bg: "var(--surface2)" },
  APPLIED:        { color: "var(--accent)",     bg: "var(--accent-dim)" },
  SCREENING:      { color: "var(--cyan)",        bg: "var(--cyan-dim)" },
  INTERVIEW:      { color: "var(--purple)",      bg: "var(--purple-dim)" },
  INTERVIEW_DONE: { color: "var(--purple)",      bg: "var(--purple-dim)" },
  OFFER:          { color: "var(--green)",       bg: "var(--green-dim)" },
  REJECTED:       { color: "var(--red)",         bg: "var(--red-dim)" },
  GHOSTED:        { color: "var(--amber)",       bg: "var(--amber-dim)" },
  WITHDRAWN:      { color: "var(--text-faint)",  bg: "var(--surface2)" },
};

const FIT_STYLES: Record<string, { color: string; bg: string }> = {
  "Strong Fit": { color: "var(--green)",  bg: "var(--green-dim)" },
  "Viable":     { color: "var(--amber)",  bg: "var(--amber-dim)" },
  "Off-Lane":   { color: "var(--red)",    bg: "var(--red-dim)" },
};

interface StatusBadgeProps {
  status: string;
  type?: "status" | "fit";
  small?: boolean;
}

export function StatusBadge({ status, type = "status", small }: StatusBadgeProps) {
  const styles = type === "fit" ? FIT_STYLES : STATUS_STYLES;
  const s = styles[status] || { color: "var(--text-muted)", bg: "var(--surface2)" };
  const label = type === "fit" ? status : (STATUS_LABELS[status] || status);

  return (
    <span
      style={{
        display: "inline-block",
        padding: small ? "2px 7px" : "3px 9px",
        borderRadius: 4,
        fontSize: small ? 11 : 12,
        fontWeight: 500,
        color: s.color,
        background: s.bg,
        whiteSpace: "nowrap",
        fontFamily: "var(--font-mono)",
        letterSpacing: "0.02em",
      }}
    >
      {label}
    </span>
  );
}
