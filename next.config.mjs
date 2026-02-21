import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Required for instrumentation.ts in Next.js 14 (stable in 15+)
    instrumentationHook: true,
  },
  async headers() {
    return [
      // Admin CRUD APIs — same-origin so no CORS needed,
      // but react-admin's ra-data-simple-rest requires Content-Range.
      {
        source: "/api/courses/:path*",
        headers: [{ key: "Content-Range", value: "bytes : 0-9/*" }],
      },
      {
        source: "/api/units/:path*",
        headers: [{ key: "Content-Range", value: "bytes : 0-9/*" }],
      },
      {
        source: "/api/lessons/:path*",
        headers: [{ key: "Content-Range", value: "bytes : 0-9/*" }],
      },
      {
        source: "/api/challenges/:path*",
        headers: [{ key: "Content-Range", value: "bytes : 0-9/*" }],
      },
      {
        source: "/api/challengeOptions/:path*",
        headers: [{ key: "Content-Range", value: "bytes : 0-9/*" }],
      },
      // Stripe webhooks — external origin, needs permissive CORS.
      {
        source: "/api/webhooks/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload source maps for readable stack traces
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Route Sentry requests through your server to avoid ad-blockers
  tunnelRoute: "/monitoring",
});
