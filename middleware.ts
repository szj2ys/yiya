import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isE2E = process.env.E2E_TESTING === "true";

const clerkMiddleware = authMiddleware({
  publicRoutes: ["/", "/api/webhooks/stripe", "/monitoring"],
});

export default function middleware(req: NextRequest, event: any) {
  // During E2E testing, skip Clerk entirely
  if (isE2E) {
    return NextResponse.next();
  }
  return clerkMiddleware(req, event);
}

export const config = {
  // Protects all routes, including api/trpc.
  // See https://clerk.com/docs/references/nextjs/auth-middleware
  // for more information about configuring your Middleware
  matcher: ["/((?!.+\\.[\\w]+$|_next|monitoring).*)", "/", "/(api|trpc)(.*)"],
};