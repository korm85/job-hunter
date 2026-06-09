import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const ghostRisk = searchParams.get("ghostRisk");

    const where: Record<string, unknown> = {};
    if (status && status !== "ALL") where.status = status;
    if (ghostRisk === "true") where.isGhostRisk = true;

    const jobs = await prisma.job.findMany({
      where,
      include: { application: true, statusHistory: { orderBy: { createdAt: "desc" } } },
      orderBy: { createdAt: "desc" },
    });

    // Auto-flag ghost risks (21+ days on Applied/Screening with no update)
    const now = Date.now();
    const ghostThreshold = 21 * 24 * 60 * 60 * 1000;
    for (const job of jobs) {
      const isRisk =
        ["APPLIED", "SCREENING"].includes(job.status) &&
        now - new Date(job.updatedAt).getTime() > ghostThreshold;
      if (isRisk !== job.isGhostRisk) {
        await prisma.job.update({ where: { id: job.id }, data: { isGhostRisk: isRisk } });
        job.isGhostRisk = isRisk;
      }
    }

    return NextResponse.json(jobs);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const job = await prisma.job.create({
      data: {
        title: body.title,
        company: body.company,
        location: body.location || null,
        url: body.url || null,
        description: body.description || null,
        domain: body.domain || null,
        source: body.source || "manual",
        postedAt: body.postedAt ? new Date(body.postedAt) : null,
        fitTier: body.fitTier || null,
      },
    });
    return NextResponse.json(job, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}
