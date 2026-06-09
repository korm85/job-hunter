import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function daysSince(date: Date | string): number {
  const d = typeof date === "string" ? new Date(date) : date;
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export const STATUS_LABELS: Record<string, string> = {
  SAVED: "Saved",
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  INTERVIEW_DONE: "Interview Done",
  OFFER: "Offer",
  REJECTED: "Rejected",
  GHOSTED: "Ghosted",
  WITHDRAWN: "Withdrawn",
};

export const STATUS_ORDER = [
  "SAVED",
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "INTERVIEW_DONE",
  "OFFER",
  "REJECTED",
  "GHOSTED",
  "WITHDRAWN",
];

export const FIT_TIERS = ["Strong Fit", "Viable", "Off-Lane"] as const;

export const DOMAINS = [
  "Industrial AI / IIoT",
  "Computer Vision",
  "Defense Tech",
  "Enterprise SaaS",
  "Med Tech",
  "Data Security",
  "Simulation / Digital Twin",
  "Robotics / Automation",
  "Other",
] as const;
