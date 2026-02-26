import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { userProgress } from "@/db/schema";

/**
 * One-click unsubscribe from streak reminder emails.
 * Accepts userId as a query parameter — intentionally simple
 * (no auth required) so the email unsubscribe link works
 * without the user being logged in.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    await db
      .update(userProgress)
      .set({ emailReminders: false })
      .where(eq(userProgress.userId, userId));

    // Return a simple HTML page confirming unsubscribe
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Unsubscribed</title></head>
<body style="margin:0;padding:60px 20px;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-align:center;">
  <h1 style="font-size:24px;color:#111827;">You've been unsubscribed</h1>
  <p style="font-size:16px;color:#6b7280;margin-top:8px;">You will no longer receive streak reminder emails.</p>
  <p style="margin-top:24px;"><a href="/" style="color:#16a34a;text-decoration:underline;">Back to YiYa</a></p>
</body>
</html>`,
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  } catch (error) {
    console.error("[unsubscribe] Failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
