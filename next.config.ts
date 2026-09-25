import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
      },
    ],
  },
  outputFileTracingExcludes: {
    "*": [
      "./next.config.ts",
      // Local credentials and tooling must never enter server deployment artifacts.
      "./.env", "./.env.*", "./**/.env", "./**/.env.*",
      "./generate-password.ts", "./.git/**", "./.vercel/**",
      "./.next/dev/**", "./coverage/**", "./test-results/**",
      "./playwright-report/**", "./.idea/**", "./.vscode/**",
    ],
  },
  async headers() {
    const isProd = process.env.NODE_ENV === "production";
    const headersList = [
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
        value: "max-age=63072000; includeSubDomains; preload",
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
