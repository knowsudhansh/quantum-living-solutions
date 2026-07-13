import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/security/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-local-development-only-12345';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Session check for Protected Admin Routes
  const isAdminPath = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAdminApiPath = pathname.startsWith('/api/admin') && pathname !== '/api/admin/auth/login';

  if (isAdminPath || isAdminApiPath) {
    const sessionCookie = request.cookies.get('qls_admin_session')?.value;
    let isValid = false;

    if (sessionCookie) {
      const payload = await verifyToken(sessionCookie, JWT_SECRET);
      if (payload && (payload as { role?: string }).role === 'admin') {
        isValid = true;
      }
    }

    if (!isValid) {
      if (isAdminApiPath) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized access' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
      // Redirect to admin login screen
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. CSP and Security Headers Proxy
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV !== 'production';

  const scriptSrc = isDev
    ? `script-src 'self' 'unsafe-eval' 'unsafe-inline';`
    : `script-src 'self' 'nonce-${nonce}';`;

  const styleSrc = `style-src 'self' 'unsafe-inline';`;

  const connectSrc = isDev
    ? `connect-src 'self' ws: wss:;`
    : `connect-src 'self';`;

  const cspHeader = `
    default-src 'self';
    ${scriptSrc}
    ${styleSrc}
    ${connectSrc}
    img-src 'self' data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
  `.replace(/\s{2,}/g, ' ').trim();

  const response = NextResponse.next();
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'same-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
