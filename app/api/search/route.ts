import { NextRequest, NextResponse } from "next/server";
import { searchJobs } from "@/lib/search";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.TAVILY_API_KEY) {
      return NextResponse.json({ error: "TAVILY_API_KEY not configured" }, { status: 503 });
    }
    const body = await req.json();
    const results = await searchJobs(
      body.keywords || "",
      body.location || "Israel",
      body.domains || []
    );
    return NextResponse.json(results);
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Search failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
