import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { logger } from '../../../../lib/utils/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let slots = await prisma.demoSlot.findMany({
      where: {
        isActive: true,
        startTime: {
          gt: new Date(),
        },
      },
      orderBy: {
        startTime: 'asc',
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        maxCapacity: true,
        currentBookings: true,
      },
    });

    // Auto-seed slots for demo if none are present in database
    if (slots.length === 0) {
      const now = new Date();
      const seedData = [];
      
      for (let i = 1; i <= 5; i++) {
        const start = new Date(now);
        start.setDate(now.getDate() + i);
        // Alternate between 10:00 AM and 02:00 PM
        start.setHours(i % 2 === 0 ? 10 : 14, 0, 0, 0);
        
        const end = new Date(start);
        end.setHours(start.getHours() + 2); // 2 hour slots
        
        seedData.push({
          startTime: start,
          endTime: end,
          maxCapacity: 2,
          currentBookings: 0,
          isActive: true,
        });
      }

      await prisma.demoSlot.createMany({
        data: seedData,
        skipDuplicates: true,
      });

      // Query again
      slots = await prisma.demoSlot.findMany({
        where: {
          isActive: true,
          startTime: {
            gt: new Date(),
          },
        },
        orderBy: {
          startTime: 'asc',
        },
        select: {
          id: true,
          startTime: true,
          endTime: true,
          maxCapacity: true,
          currentBookings: true,
        },
      });
    }

    // Filter slots with remaining capacity
    const availableSlots = slots.filter(
      (slot) => slot.currentBookings < slot.maxCapacity
    );

    return NextResponse.json({ success: true, slots: availableSlots });
  } catch (err) {
    logger.error('Slots query API exception', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ error: 'Internal server error occurred' }, { status: 500 });
  }
}
