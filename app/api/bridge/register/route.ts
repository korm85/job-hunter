import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// NUC calls this when tunnel URL changes to self-register
export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (token !== process.env.LINKEDIN_BRIDGE_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { url } = await req.json();
  if (!url?.startsWith("https://")) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }
  await prisma.config.upsert({
    where: { key: "linkedin_bridge_url" },
    update: { value: url },
    create: { key: "linkedin_bridge_url", value: url },
  });
  return NextResponse.json({ ok: true, url });
}
