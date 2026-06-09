import { prisma } from "@/lib/db";

const BRIDGE_TOKEN = process.env.LINKEDIN_BRIDGE_TOKEN;

export function bridgeAvailable(): boolean {
  return !!BRIDGE_TOKEN;
}

async function getBridgeUrl(): Promise<string> {
  // Try DB first (auto-updated by NUC on tunnel restart)
  try {
    const cfg = await prisma.config.findUnique({ where: { key: "linkedin_bridge_url" } });
    if (cfg?.value) return cfg.value;
  } catch { /* fall through */ }
  // Fallback to env var
  if (process.env.LINKEDIN_BRIDGE_URL) return process.env.LINKEDIN_BRIDGE_URL;
  throw new Error("Bridge URL not configured");
}

async function bridgeFetch(path: string, body: Record<string, unknown>) {
  if (!BRIDGE_TOKEN) throw new Error("Bridge not configured");
  const BRIDGE_URL = await getBridgeUrl();
  const res = await fetch(`${BRIDGE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${BRIDGE_TOKEN}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) throw new Error(`Bridge error ${res.status}`);
  return res.json();
}

export interface LinkedInJob {
  job_id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  description?: string;
}

export interface LinkedInPerson {
  name: string;
  headline: string;
  profile_url: string;
  location?: string;
}

export async function bridgeSearchJobs(
  keywords: string,
  location = "Israel",
  options: {
    max_pages?: number;
    date_posted?: string;
    experience_level?: string;
    work_type?: string;
  } = {}
): Promise<LinkedInJob[]> {
  const result = await bridgeFetch("/jobs/search", {
    keywords,
    location,
    max_pages: options.max_pages ?? 3,
    date_posted: options.date_posted ?? "past_week",
    experience_level: options.experience_level ?? null,
    work_type: options.work_type ?? null,
    sort_by: "date",
  });

  // MCP returns { content: [{ type: "text", text: "..." }] }
  const text = result?.content?.[0]?.text ?? "";
  try {
    const parsed = JSON.parse(text);
    // Response shape: { sections: { page_1: { jobs: [...] }, page_2: ... }, job_ids: [...] }
    if (parsed.sections && typeof parsed.sections === "object") {
      const rawJobs: Record<string, unknown>[] = [];
      for (const page of Object.values(parsed.sections) as { jobs?: Record<string, unknown>[] }[]) {
        if (Array.isArray(page.jobs)) rawJobs.push(...page.jobs);
      }
      return rawJobs.map((j) => ({
        job_id: j.job_id as string,
        title: j.title as string,
        company: j.company as string,
        location: (j.location as string) ?? "",
        url: (j.job_url as string) ?? "",
        description: j.description as string | undefined,
      }));
    }
    // Fallback: flat array or { jobs: [] }
    if (Array.isArray(parsed)) return parsed;
    return parsed.jobs ?? [];
  } catch {
    return [];
  }
}

export async function bridgeGetJobDetails(jobId: string): Promise<Record<string, unknown> | null> {
  try {
    const result = await bridgeFetch("/jobs/details", { job_id: jobId });
    const text = result?.content?.[0]?.text ?? "";
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function bridgeSearchPeople(
  keywords: string,
  location = "Israel"
): Promise<LinkedInPerson[]> {
  const result = await bridgeFetch("/people/search", { keywords, location });
  const text = result?.content?.[0]?.text ?? "";
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : parsed.people ?? [];
  } catch {
    return [];
  }
}

export async function bridgeHealthCheck(): Promise<boolean> {
  if (!BRIDGE_TOKEN) return false;
  try {
    const url = await getBridgeUrl();
    const res = await fetch(`${url}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
