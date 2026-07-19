import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import { logger } from '../../../../../lib/utils/logger';

export const dynamic = 'force-dynamic';

const ALLOWED_STATUSES = new Set(['SUBMITTED', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW', 'HIRED', 'REJECTED', 'ARCHIVED']);

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json() as { status?: string; notes?: string };
    const status = typeof body.status === 'string' ? body.status.trim().toUpperCase() : undefined;
    const notes = typeof body.notes === 'string' ? body.notes.trim().slice(0, 4000) : undefined;

    if (status && !ALLOWED_STATUSES.has(status)) {
      return NextResponse.json({ error: 'Unsupported candidate status' }, { status: 400 });
    }

    if (!status && notes === undefined) {
      return NextResponse.json({ error: 'No candidate updates supplied' }, { status: 400 });
    }

    const candidate = await prisma.careerApplication.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(notes !== undefined ? { notes: notes || null } : {}),
      },
    });

    return NextResponse.json({ success: true, candidate });
  } catch (err) {
    logger.error('Admin Candidates update API exception', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ error: 'Unable to update candidate' }, { status: 500 });
  }
}
