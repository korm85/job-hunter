import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const BRIDGE_TOKEN = process.env.LINKEDIN_BRIDGE_TOKEN;

export async function GET() {
  try {
    const cfg = await prisma.config.findUnique({ where: { key: "linkedin_bridge_url" } });
    const url = cfg?.value || process.env.LINKEDIN_BRIDGE_URL;
    if (!url || !BRIDGE_TOKEN) return NextResponse.json({ error: "not configured", url, token: !!BRIDGE_TOKEN });

    const start = Date.now();
    const res = await fetch(`${url}/jobs/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${BRIDGE_TOKEN}` },
      body: JSON.stringify({ keywords: "engineer", location: "Israel", max_pages: 1, date_posted: "past_week", sort_by: "date" }),
      signal: AbortSignal.timeout(60000),
    });
    const elapsed = Date.now() - start;
    const raw = await res.json();
    const text = raw?.content?.[0]?.text ?? "";
    let parsed = null;
    try { parsed = JSON.parse(text); } catch { /* */ }
    return NextResponse.json({
      url,
      http_status: res.status,
      elapsed_ms: elapsed,
      is_error: raw.isError,
      text_length: text.length,
      text_preview: text.slice(0, 200),
      parsed_keys: parsed ? Object.keys(parsed) : null,
      sections_keys: parsed?.sections ? Object.keys(parsed.sections) : null,
      jobs_count: parsed?.sections?.page_1?.jobs?.length ?? 0,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) });
  }
}
