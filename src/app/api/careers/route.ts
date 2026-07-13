import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import { notifyAdminOfCareer } from '../../../lib/email';
import { logger } from '../../../lib/utils/logger';

export async function POST(request: Request) {
  try {
    const body = await request.json() as { name?: string; email?: string; phone?: string; role?: string; message?: string; resumeUrl?: string };
    const { name, email, phone, role, message, resumeUrl } = body;

    // 1. Validation checks
    if (!name || !email || !phone || !role || !resumeUrl) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address syntax' }, { status: 400 });
    }

    // 2. Write database career application record
    const application = await prisma.careerApplication.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        role: role.trim(),
        message: message ? message.trim() : null,
        resumeUrl: resumeUrl.trim(),
        status: 'SUBMITTED',
      },
    });

    logger.info(`Database career application recorded. ID: ${application.id}`);

    // 3. Dispatch alert to admin
    notifyAdminOfCareer(name, email, phone, role, message, resumeUrl).catch((err) =>
      logger.error('Admin career application alert failed', err instanceof Error ? err : new Error(String(err)))
    );

    return NextResponse.json({ success: true, applicationId: application.id }, { status: 201 });
  } catch (err) {
    logger.error('Careers API endpoint exception', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ error: 'Internal server error occurred' }, { status: 500 });
  }
}
