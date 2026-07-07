import { NextResponse } from 'next/server';

export function proxy() {
  // Generate a cryptographically secure random base64 nonce per request
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  // Strict CSP configuration as required by the approved POC specifications
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}';
    style-src 'self';
    img-src 'self' data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
  `;

  const cleanCspHeader = cspHeader.replace(/\s{2,}/g, ' ').trim();

  // Propagate the Content-Security-Policy header to the response
  const response = NextResponse.next();

  response.headers.set('Content-Security-Policy', cleanCspHeader);

  // Set all other standard Phase 1 non-CSP security headers
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
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
