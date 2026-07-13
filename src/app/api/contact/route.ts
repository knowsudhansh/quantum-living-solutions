import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import { notifyAdminOfContact, sendContactAutoReply } from '../../../lib/email';
import { logger } from '../../../lib/utils/logger';

export async function POST(request: Request) {
  try {
    const body = await request.json() as { name?: string; email?: string; phone?: string; interest?: string; message?: string };
    const { name, email, phone, interest, message } = body;

    // 1. Validation checks
    if (!name || !email || !phone || !message) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address syntax' }, { status: 400 });
    }

    // Split name safely
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // 2. Write database lead record
    const lead = await prisma.lead.create({
      data: {
        firstName,
        lastName,
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        interest: interest || 'Smart Home',
        source: 'contact',
        status: 'NEW',
      },
    });

    logger.info(`Database lead created successfully. Lead ID: ${lead.id}`);

    // 3. Dispatch notifications asynchronously
    notifyAdminOfContact(name, email, phone, interest || 'Smart Home', message).catch((err) =>
      logger.error('Admin contact email dispatch failed', err instanceof Error ? err : new Error(String(err)))
    );
    
    sendContactAutoReply(name, email).catch((err) =>
      logger.error('Customer contact auto-reply failed', err instanceof Error ? err : new Error(String(err)))
    );

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });
  } catch (err) {
    logger.error('Contact API endpoint threw exception', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ error: 'Internal server error occurred' }, { status: 500 });
  }
}
