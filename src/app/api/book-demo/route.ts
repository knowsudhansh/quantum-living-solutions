import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import { notifyAdminOfDemo, sendDemoAutoReply } from '../../../lib/email';
import { logger } from '../../../lib/utils/logger';
import { PRIVATE_SITE_VISIT } from '../../../lib/config/business';

const HOME_AUTOMATION_OPTIONS = new Set([
  'Lighting Automation',
  'Curtains & Blinds',
  'Climate Control',
  'Security & Surveillance',
  'Audio / Video',
  'Energy Management',
]);

const INDUSTRIAL_AUTOMATION_OPTIONS = new Set([
  'Automatic Changeover Switch',
  'Genset Automation',
  'Power Management',
  'Source Selector',
  'Solar Liability Management',
]);

type AutomationCategory = 'Home Automation' | 'Industrial Automation' | 'Creative Automation';

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      slotId?: string;
      name?: string;
      email?: string;
      phone?: string;
      location?: string;
      automationCategory?: AutomationCategory;
      automationSelections?: string[];
      creativeRequirement?: string;
    };
    const { slotId, name, email, phone, location, automationCategory, automationSelections, creativeRequirement } = body;

    // 1. Validation checks
    if (!slotId || !name?.trim() || !email || !phone?.trim() || !location?.trim() || !automationCategory) {
      return NextResponse.json({ error: 'Missing required booking fields' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address syntax' }, { status: 400 });
    }

    if (!['Home Automation', 'Industrial Automation', 'Creative Automation'].includes(automationCategory)) {
      return NextResponse.json({ error: 'Invalid automation category' }, { status: 400 });
    }

    if (location.trim().length < 3 || location.trim().length > 255) {
      return NextResponse.json({ error: 'Enter a valid site location' }, { status: 400 });
    }

    const selectedOptions = Array.isArray(automationSelections)
      ? [...new Set(automationSelections.filter((option): option is string => typeof option === 'string').map((option) => option.trim()).filter(Boolean))]
      : [];
    const allowedOptions = automationCategory === 'Home Automation'
      ? HOME_AUTOMATION_OPTIONS
      : automationCategory === 'Industrial Automation'
        ? INDUSTRIAL_AUTOMATION_OPTIONS
        : null;
    const cleanCreativeRequirement = creativeRequirement?.trim() || null;

    if (allowedOptions && (selectedOptions.length === 0 || selectedOptions.some((option) => !allowedOptions.has(option)))) {
      return NextResponse.json({ error: 'Select at least one valid automation requirement' }, { status: 400 });
    }

    if (automationCategory === 'Creative Automation' && (!cleanCreativeRequirement || cleanCreativeRequirement.length < 10)) {
      return NextResponse.json({ error: 'Describe your creative automation requirement' }, { status: 400 });
    }

    // 2. Start transactional execution block with row-locking concurrency controls
    const result = await prisma.$transaction(async (tx) => {
      // Execute SELECT FOR UPDATE to acquire exclusive lock on the slot row
      const slots = await tx.$queryRaw<Array<{
        id: string;
        current_bookings: number;
        max_capacity: number;
        is_active: boolean;
        start_time: Date;
      }>>`
        SELECT id, current_bookings, max_capacity, is_active, start_time
        FROM demo_slots
        WHERE id = ${slotId}::uuid AND is_active = true
        FOR UPDATE
      `;

      const slot = slots[0];
      if (!slot) {
        throw new Error('SLOT_NOT_FOUND_OR_INACTIVE');
      }

      // Check capacity thresholds
      if (slot.current_bookings >= slot.max_capacity) {
        throw new Error('SLOT_MAX_CAPACITY_EXCEEDED');
      }

      // Increment bookings count on the slot
      await tx.demoSlot.update({
        where: { id: slotId },
        data: { currentBookings: { increment: 1 } },
      });

      // Split name safely
      const nameParts = name.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Upsert lead record by email to preserve client history
      let lead = await tx.lead.findFirst({
        where: { email: email.trim().toLowerCase() },
      });

      if (!lead) {
        lead = await tx.lead.create({
          data: {
            firstName,
            lastName,
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            interest: automationCategory,
            source: 'demo',
            status: 'NEW',
          },
        });
      }

      // Create Booking record
      const booking = await tx.booking.create({
        data: {
          slotId: slot.id,
          leadId: lead.id,
          status: 'CONFIRMED',
          automationCategory,
          automationSelections: selectedOptions,
          creativeRequirement: cleanCreativeRequirement,
          location: location.trim(),
          totalAmount: PRIVATE_SITE_VISIT.price,
          paidAmount: 0.00,
        },
      });

      return { booking, slot };
    });

    logger.info(`Booking transaction committed successfully. Booking ID: ${result.booking.id}`);

    // Format schedule time for notifications
    const slotTimeFormatted = new Date(result.slot.start_time).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'long',
      timeStyle: 'short',
    });

    // 3. Dispatch confirmation emails asynchronously
    notifyAdminOfDemo(name.trim(), email.trim(), phone.trim(), slotTimeFormatted, {
      automationCategory,
      automationSelections: selectedOptions,
      creativeRequirement: cleanCreativeRequirement,
      location: location.trim(),
    }).catch((err) =>
      logger.error('Admin booking alert email failed', err instanceof Error ? err : new Error(String(err)))
    );
    
    sendDemoAutoReply(name.trim(), email.trim(), slotTimeFormatted).catch((err) =>
      logger.error('Customer booking confirmation failed', err instanceof Error ? err : new Error(String(err)))
    );

    return NextResponse.json({ success: true, bookingId: result.booking.id, visitPrice: PRIVATE_SITE_VISIT.price }, { status: 201 });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logger.error('Booking transaction failed', err instanceof Error ? err : new Error(String(err)));

    if (errorMsg === 'SLOT_NOT_FOUND_OR_INACTIVE') {
      return NextResponse.json({ error: 'Selected slot is invalid or inactive' }, { status: 404 });
    }
    if (errorMsg === 'SLOT_MAX_CAPACITY_EXCEEDED') {
      return NextResponse.json({ error: 'This slot is already fully booked' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Internal server error occurred' }, { status: 500 });
  }
}
