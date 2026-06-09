import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface BulkJob {
  title: string;
  company: string;
  location?: string;
  url?: string;
  description?: string;
  domain?: string;
  source?: string;
  postedAt?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { jobs }: { jobs: BulkJob[] } = await req.json();
    if (!Array.isArray(jobs) || jobs.length === 0) {
      return NextResponse.json({ error: "jobs array required" }, { status: 400 });
    }

    let created = 0;
    let skipped = 0;

    for (const job of jobs) {
      if (!job.title || !job.company) continue;

      // Upsert by URL if available, otherwise skip duplicates by title+company
      const where = job.url
        ? { url: job.url }
        : undefined;

      if (where) {
        const existing = await prisma.job.findFirst({ where });
        if (existing) { skipped++; continue; }
      }

      await prisma.job.create({
        data: {
          title: job.title,
          company: job.company,
          location: job.location || null,
          url: job.url || null,
          description: job.description || null,
          domain: job.domain || null,
          source: job.source || "linkedin",
          postedAt: job.postedAt ? new Date(job.postedAt) : null,
        },
      });
      created++;
    }

    return NextResponse.json({ created, skipped });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Bulk import failed" }, { status: 500 });
  }
}
