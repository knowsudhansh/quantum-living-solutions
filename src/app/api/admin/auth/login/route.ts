import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import { verifyPassword } from '../../../../../lib/security/password';
import { signToken } from '../../../../../lib/security/auth';
import { logger } from '../../../../../lib/utils/logger';
import { ADMIN_SESSION_COOKIE, getAdminSessionSecret } from '../../../../../lib/security/session';

export async function POST(request: Request) {
  try {
    const sessionSecret = getAdminSessionSecret();
    if (!sessionSecret) {
      return NextResponse.json({ error: 'Admin authentication is not configured' }, { status: 503 });
    }

    const body = await request.json() as { email?: string; password?: string };
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Fetch a provisioned administrator account.
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials provided' }, { status: 401 });
    }

    // 2. Verify password hash matches
    const isValidPassword = verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials provided' }, { status: 401 });
    }

    // 3. Verify user holds admin role
    const hasAdminRole = user.roles.some((ur) => ur.role.name === 'admin');
    if (!hasAdminRole) {
      return NextResponse.json({ error: 'Access denied: Insufficient privileges' }, { status: 403 });
    }

    // 4. Generate signed session payload
    const payload = {
      userId: user.id,
      email: user.email,
      role: 'admin',
    };

    const token = await signToken(payload, sessionSecret, 28800); // 8 hours duration

    // 5. Build response and set HttpOnly session cookie
    const response = NextResponse.json({ success: true, user: { email: user.email } });
    
    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 28800, // 8 hours
    });

    // Log admin access logs
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'ADMIN_LOGIN_SUCCESS',
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        details: 'Admin authenticated successfully via login endpoint',
      },
    });

    return response;
  } catch (err) {
    logger.error('Admin Auth Login Exception', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ error: 'Internal server error occurred' }, { status: 500 });
  }
}
