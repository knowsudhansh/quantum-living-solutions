import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/security/auth';
import { ADMIN_SESSION_COOKIE, getAdminSessionSecret } from './lib/security/session';

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function isTrustedAdminMutation(request: NextRequest) {
  if (!UNSAFE_METHODS.has(request.method)) return true;

  const origin = request.headers.get('origin');
  if (!origin) return false;

  try {
    const requestedOrigin = new URL(origin).origin;
    const configuredOrigin = process.env.NEXTAUTH_URL
      ? new URL(process.env.NEXTAUTH_URL).origin
      : request.nextUrl.origin;

    return requestedOrigin === configuredOrigin || requestedOrigin === request.nextUrl.origin;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Session check for Protected Admin Routes
  const isAdminPath = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAdminApiPath = pathname.startsWith('/api/admin') && pathname !== '/api/admin/auth/login';

  if (isAdminPath || isAdminApiPath) {
    const sessionSecret = getAdminSessionSecret();
    if (!sessionSecret) {
      if (isAdminApiPath) {
        return NextResponse.json({ error: 'Admin authentication is not configured' }, { status: 503 });
      }
      return new NextResponse('Admin authentication is not configured', { status: 503 });
    }

    const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    let isValid = false;

    if (sessionCookie) {
      const payload = await verifyToken(sessionCookie, sessionSecret);
      if (payload && (payload as { role?: string }).role === 'admin') {
        isValid = true;
      }
    }

    if (!isValid) {
      if (isAdminApiPath) {
        return unauthorizedResponse();
      }
      // Redirect to admin login screen
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    if (isAdminApiPath && !isTrustedAdminMutation(request)) {
      return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
    }
  }

  // 2. CSP and Security Headers Proxy
  const nonce = btoa(crypto.randomUUID());
  const isDev = process.env.NODE_ENV !== 'production';

  const scriptSrc = isDev
    ? `script-src 'self' 'unsafe-eval' 'unsafe-inline';`
    : `script-src 'self' 'nonce-${nonce}';`;

  // Framer Motion uses runtime transform styles throughout the cinematic presentation.
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
    media-src 'self';
    worker-src 'self' blob:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
  `.replace(/\s{2,}/g, ' ').trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'same-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
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
