import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const checks = {
    database: false,
    anthropicKey: !!process.env.ANTHROPIC_API_KEY,
    tavilyKey: !!process.env.TAVILY_API_KEY,
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch {
    // db not reachable
  }

  return NextResponse.json(checks);
}
