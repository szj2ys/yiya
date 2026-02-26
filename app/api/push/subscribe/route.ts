import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth-utils";
import db from "@/db/drizzle";
import { pushSubscriptions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: Request) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { endpoint, keys } = body;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json(
      { error: "Missing endpoint or keys" },
      { status: 400 },
    );
  }

  // Upsert: delete existing subscription for this user+endpoint, then insert
  await db
    .delete(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.userId, userId),
        eq(pushSubscriptions.endpoint, endpoint),
      ),
    );

  await db.insert(pushSubscriptions).values({
    userId,
    endpoint,
    p256dh: keys.p256dh,
    auth: keys.auth,
  });

  return NextResponse.json({ ok: true });
}
