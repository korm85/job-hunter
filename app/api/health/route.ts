import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { bridgeHealthCheck, bridgeAvailable } from "@/lib/bridge";

export async function GET() {
  const checks = {
    database: false,
    anthropicKey: !!process.env.ANTHROPIC_API_KEY,
    tavilyKey: !!process.env.TAVILY_API_KEY,
    linkedinBridge: false,
    linkedinBridgeConfigured: bridgeAvailable(),
  };

  await Promise.all([
    prisma.$queryRaw`SELECT 1`.then(() => { checks.database = true; }).catch(() => {}),
    bridgeHealthCheck().then((ok) => { checks.linkedinBridge = ok; }),
  ]);

  return NextResponse.json(checks);
}
