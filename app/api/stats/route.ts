import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [counts, ghostRiskCount, recentJobs] = await Promise.all([
      prisma.job.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      prisma.job.count({ where: { isGhostRisk: true } }),
      prisma.job.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          company: true,
          status: true,
          fitTier: true,
          domain: true,
          isGhostRisk: true,
          createdAt: true,
          appliedAt: true,
        },
      }),
    ]);

    const byStatus: Record<string, number> = {};
    for (const c of counts) {
      byStatus[c.status] = c._count.id;
    }

    return NextResponse.json({ byStatus, ghostRiskCount, recentJobs });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
