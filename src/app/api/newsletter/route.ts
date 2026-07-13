import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import { sendEmail } from '../../../lib/email';
import { logger } from '../../../lib/utils/logger';

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: string };
    const { email } = body;

    // 1. Validation
    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json({ error: 'Invalid email address syntax' }, { status: 400 });
    }

    // 2. Check for duplicate subscriber records
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      if (!existing.isActive) {
        // Reactivate subscriber
        await prisma.newsletterSubscriber.update({
          where: { id: existing.id },
          data: { isActive: true },
        });
      }
      return NextResponse.json({ success: true, message: 'Already subscribed' }, { status: 200 });
    }

    // 3. Write subscription database record
    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email: cleanEmail,
        isActive: true,
      },
    });

    logger.info(`Newsletter subscription logged. ID: ${subscriber.id}`);

    // 4. Send welcoming email
    sendEmail({
      to: cleanEmail,
      subject: 'Welcome to Quantum Living Solutions Newsletter',
      html: `
        <p>Thank you for subscribing to the Quantum Living Solutions newsletter.</p>
        <p>You will receive periodic updates regarding luxury smart living designs, architectural lighting showcases, and technology integration trends directly in your inbox.</p>
        <br />
        <p>Best regards,</p>
        <p><strong>Quantum Living Solutions Team</strong></p>
      `,
    }).catch((err) =>
      logger.error('Newsletter welcome email dispatch failed', err instanceof Error ? err : new Error(String(err)))
    );

    return NextResponse.json({ success: true, subscriberId: subscriber.id }, { status: 201 });
  } catch (err) {
    logger.error('Newsletter API endpoint exception', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ error: 'Internal server error occurred' }, { status: 500 });
  }
}
