import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const isProd = process.env.NODE_ENV === "production";
    
    const cspHeader = `
      default-src 'self';
      script-src 'self';
      style-src 'self';
      img-src 'self' data:;
      font-src 'self';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      ${isProd ? "upgrade-insecure-requests;" : ""}
    `.replace(/\s{2,}/g, ' ').trim();

    const headersList = [
      {
        key: "Content-Security-Policy",
        value: cspHeader,
      },
      {
        key: "X-Frame-Options",
        value: "DENY",
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "Referrer-Policy",
        value: "same-origin",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
    ];

    if (isProd) {
      headersList.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000",
      });
    }

    return [
      {
        source: "/:path*",
        headers: headersList,
      },
    ];
  },
};

export default nextConfig;
// Future CSP Extension Point Categories:
// - Payment scripts, frames, and API connections
// - Media CDN
// - Object Storage
// - Analytics
// - WebGL and worker requirements
