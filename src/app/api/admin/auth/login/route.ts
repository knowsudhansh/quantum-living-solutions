import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import { hashPassword, verifyPassword } from '../../../../../lib/security/password';
import { signToken } from '../../../../../lib/security/auth';
import { logger } from '../../../../../lib/utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-local-development-only-12345';
const DEFAULT_ADMIN_EMAIL = 'admin@quantumlivingsolutions.com';
const DEFAULT_ADMIN_PASSWORD = 'QuantumAdmin2026!';

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: string; password?: string };
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Auto-seed administrator user if DB table is empty
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      const hashedPass = hashPassword(DEFAULT_ADMIN_PASSWORD);
      const masterUser = await prisma.user.create({
        data: {
          email: DEFAULT_ADMIN_EMAIL,
          passwordHash: hashedPass,
        },
      });

      // Assign admin role if roles table exist or is seeded
      let adminRole = await prisma.role.findUnique({
        where: { name: 'admin' },
      });

      if (!adminRole) {
        adminRole = await prisma.role.create({
          data: {
            name: 'admin',
            description: 'Master Administrator access',
          },
        });
      }

      await prisma.userRole.create({
        data: {
          userId: masterUser.id,
          roleId: adminRole.id,
        },
      });

      logger.info('Auto-seeded default administrator account: admin@quantumlivingsolutions.com');
    }

    // 2. Fetch target user
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

    // 3. Verify password hash matches
    const isValidPassword = verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials provided' }, { status: 401 });
    }

    // Verify user holds admin role
    const hasAdminRole = user.roles.some((ur) => ur.role.name === 'admin');
    if (!hasAdminRole) {
      return NextResponse.json({ error: 'Access denied: Insufficient privileges' }, { status: 403 });
    }

    // 4. Generate JWT payload
    const payload = {
      userId: user.id,
      email: user.email,
      role: 'admin',
    };

    const token = await signToken(payload, JWT_SECRET, 28800); // 8 hours duration

    // 5. Build response and set HttpOnly session cookie
    const response = NextResponse.json({ success: true, user: { email: user.email } });
    
    response.cookies.set({
      name: 'qls_admin_session',
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
