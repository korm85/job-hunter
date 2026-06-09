import { NextRequest, NextResponse } from "next/server";
import { searchJobs } from "@/lib/search";
import { bridgeAvailable, bridgeSearchJobs, bridgeGetJobDetails } from "@/lib/bridge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const keywords = body.keywords || "";
    const location = body.location || "Israel";

    // LinkedIn bridge: richer results with full descriptions
    if (bridgeAvailable()) {
      try {
        const jobs = await bridgeSearchJobs(keywords, location, {
          max_pages: body.max_pages ?? 2,
          date_posted: body.date_posted ?? "past_week",
          work_type: body.work_type ?? null,
          experience_level: body.experience_level ?? null,
        });

        // Fetch details for top 10 in parallel
        const top = jobs.slice(0, 10);
        const detailed = await Promise.all(
          top.map(async (job) => {
            const detail = job.job_id ? await bridgeGetJobDetails(job.job_id) : null;
            return {
              title: job.title || (detail as Record<string, unknown>)?.title || "",
              company: job.company || (detail as Record<string, unknown>)?.company || "",
              location: job.location || (detail as Record<string, unknown>)?.location || "",
              url: job.url || "",
              description: (detail as Record<string, unknown>)?.description as string || "",
              source: "linkedin",
            };
          })
        );

        return NextResponse.json({ results: detailed, source: "linkedin" });
      } catch (e) {
        console.warn("LinkedIn bridge failed, falling back to Tavily:", e);
      }
    }

    // Tavily fallback
    if (!process.env.TAVILY_API_KEY) {
      return NextResponse.json({ error: "No search configured" }, { status: 503 });
    }
    const results = await searchJobs(keywords, location, body.domains || []);
    return NextResponse.json({ ...results, source: "tavily" });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Search failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
