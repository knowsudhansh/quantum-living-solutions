import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { logger } from '../../../../lib/utils/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const candidates = await prisma.careerApplication.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, candidates });
  } catch (err) {
    logger.error('Admin Candidates list API exception', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
