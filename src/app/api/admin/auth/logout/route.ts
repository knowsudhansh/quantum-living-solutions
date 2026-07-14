import { NextResponse } from 'next/server';
import { logger } from '../../../../../lib/utils/logger';
import { ADMIN_SESSION_COOKIE } from '../../../../../lib/security/session';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true, message: 'Admin session terminated' });
    
    // Clear session cookie by setting past maxAge
    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (err) {
    logger.error('Admin Auth Logout Exception', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
