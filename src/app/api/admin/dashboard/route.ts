import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { logger } from '../../../../lib/utils/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [leadsCount, bookingsCount, candidatesCount, subscribersCount] = await Promise.all([
      prisma.lead.count({ where: { source: 'contact' } }),
      prisma.booking.count(),
      prisma.careerApplication.count(),
      prisma.newsletterSubscriber.count({ where: { isActive: true } }),
    ]);

    // Query recent leads
    const recentLeads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      stats: {
        leads: leadsCount,
        bookings: bookingsCount,
        candidates: candidatesCount,
        subscribers: subscribersCount,
      },
      recentLeads,
    });
  } catch (err) {
    logger.error('Admin Dashboard stats query exception', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ error: 'Internal server error occurred' }, { status: 500 });
  }
}
