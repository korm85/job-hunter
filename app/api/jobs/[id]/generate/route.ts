import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateAllMaterials } from "@/lib/ai";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
    }

    const isIsraeli =
      (job.location || "").toLowerCase().includes("israel") ||
      (job.company || "").match(/\b(rafael|elbit|iai|stratasys|mobileye|checkmarx|wix|monday)\b/i) !== null;

    const materials = await generateAllMaterials(
      job.title,
      job.company,
      job.description || "",
      job.domain || "Other",
      isIsraeli
    );

    const application = await prisma.application.upsert({
      where: { jobId: id },
      update: {
        fitAssessment: JSON.stringify(materials.fitAssessment),
        tailoredCv: materials.tailoredCv,
        coverLetter: materials.coverLetter,
        linkedinMessage: materials.linkedinMessage,
        baseVariant: materials.baseVariant,
        generatedAt: new Date(),
      },
      create: {
        jobId: id,
        fitAssessment: JSON.stringify(materials.fitAssessment),
        tailoredCv: materials.tailoredCv,
        coverLetter: materials.coverLetter,
        linkedinMessage: materials.linkedinMessage,
        baseVariant: materials.baseVariant,
        generatedAt: new Date(),
      },
    });

    // Update job fitTier
    await prisma.job.update({
      where: { id },
      data: { fitTier: materials.fitAssessment.recommendation },
    });

    return NextResponse.json({ application, fitAssessment: materials.fitAssessment });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
