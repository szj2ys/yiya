/** @type {import('next').NextConfig} */
const nextConfig = {
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

export default nextConfig;
