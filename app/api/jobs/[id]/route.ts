import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        application: true,
        statusHistory: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(job);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const existing = await prisma.job.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.company !== undefined) data.company = body.company;
    if (body.location !== undefined) data.location = body.location;
    if (body.url !== undefined) data.url = body.url;
    if (body.description !== undefined) data.description = body.description;
    if (body.domain !== undefined) data.domain = body.domain;
    if (body.notes !== undefined) data.notes = body.notes;
    if (body.fitTier !== undefined) data.fitTier = body.fitTier;
    if (body.isGhostRisk !== undefined) data.isGhostRisk = body.isGhostRisk;

    if (body.status && body.status !== existing.status) {
      data.status = body.status;
      if (body.status === "APPLIED") data.appliedAt = new Date();
      await prisma.statusEvent.create({
        data: {
          jobId: id,
          from: existing.status,
          to: body.status,
          note: body.statusNote || null,
        },
      });
    }

    const job = await prisma.job.update({ where: { id }, data });
    return NextResponse.json(job);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.job.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}
