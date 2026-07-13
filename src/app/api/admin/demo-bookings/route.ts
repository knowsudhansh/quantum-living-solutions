import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { logger } from '../../../../lib/utils/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        slot: true,
        lead: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, bookings });
  } catch (err) {
    logger.error('Admin Bookings list API exception', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
