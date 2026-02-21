import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

/**
 * Assert that the current request is from an admin user.
 * Returns a 403 JSON response if not admin, or null if the user is an admin.
 *
 * Usage in API route handlers:
 * ```
 * const forbidden = await assertAdmin();
 * if (forbidden) return forbidden;
 * ```
 */
export async function assertAdmin(): Promise<NextResponse | null> {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.publicMetadata as { role?: string } | undefined)?.role;

  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}
