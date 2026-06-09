import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateFitAssessment } from "@/lib/ai";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
    }

    const assessment = await generateFitAssessment(
      job.title,
      job.company,
      job.description || "",
      job.domain || "Other"
    );

    // Save score to application record (upsert)
    await prisma.application.upsert({
      where: { jobId: id },
      update: { fitAssessment: JSON.stringify(assessment) },
      create: {
        jobId: id,
        fitAssessment: JSON.stringify(assessment),
        generatedAt: new Date(),
      },
    });

    // Update job fitTier
    await prisma.job.update({
      where: { id },
      data: { fitTier: assessment.recommendation },
    });

    // Auto-archive Off-Lane jobs
    if (assessment.recommendation === "Off-Lane") {
      await prisma.job.update({
        where: { id },
        data: { status: "WITHDRAWN" },
      });
    }

    return NextResponse.json({ assessment });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Assessment failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
