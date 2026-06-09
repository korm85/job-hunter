import { NextRequest, NextResponse } from "next/server";
import { searchJobs } from "@/lib/search";
import { bridgeAvailable, bridgeSearchJobs } from "@/lib/bridge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const keywords = body.keywords || "";
    const location = body.location || "Israel";

    // LinkedIn bridge: real-time LinkedIn results
    if (bridgeAvailable()) {
      try {
        const jobs = await bridgeSearchJobs(keywords, location, {
          max_pages: body.max_pages ?? 2,
          date_posted: body.date_posted ?? "past_week",
          work_type: body.work_type ?? null,
          experience_level: body.experience_level ?? null,
        });

        const results = jobs.map((job) => ({
          title: job.title || "",
          company: job.company || "",
          location: job.location || "",
          url: job.url || "",
          description: job.description || "",
          source: "linkedin",
        }));

        return NextResponse.json({ results, source: "linkedin" });
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
