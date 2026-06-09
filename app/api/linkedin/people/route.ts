import { NextRequest, NextResponse } from "next/server";
import { bridgeAvailable, bridgeSearchPeople } from "@/lib/bridge";

export async function POST(req: NextRequest) {
  if (!bridgeAvailable()) {
    return NextResponse.json({ error: "LinkedIn bridge not configured" }, { status: 503 });
  }
  try {
    const { company, role } = await req.json();
    const keywords = role ? `${role} at ${company}` : company;
    const people = await bridgeSearchPeople(keywords, "Israel");
    return NextResponse.json({ people });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Search failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
