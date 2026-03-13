import webpush from "web-push";
import db from "@/db/drizzle";
import { pushSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? "";
const VAPID_SUBJECT =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://yiya.app";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    `mailto:hello@${new URL(VAPID_SUBJECT).hostname}`,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY,
  );
}

export type NotificationPayload = {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: { url?: string; [key: string]: string | undefined };
};

/**
 * Build a push notification payload with sensible defaults.
 */
export function buildNotificationPayload(
  overrides: Partial<NotificationPayload> & { title: string; body: string },
): NotificationPayload {
  return {
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: "/learn" },
    ...overrides,
  };
}

/**
 * Send a push notification to a single subscription.
 * Returns true on success, false on failure (expired subscription auto-cleaned).
 */
export async function sendPushToSubscription(
  subscription: { id: number; endpoint: string; p256dh: string; auth: string },
  payload: NotificationPayload,
): Promise<boolean> {
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify(payload),
    );
    return true;
  } catch (error: unknown) {
    const statusCode = (error as { statusCode?: number })?.statusCode;
    // 404 or 410 = subscription expired or invalid — clean up
    if (statusCode === 404 || statusCode === 410) {
      await db
        .delete(pushSubscriptions)
        .where(eq(pushSubscriptions.id, subscription.id));
    }
    return false;
  }
}

/**
 * Send a push notification to all subscriptions for a given user.
 * Returns the number of successful sends.
 */
export async function sendPushToUser(
  userId: string,
  payload: NotificationPayload,
): Promise<number> {
  const subscriptions = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId));

  let sent = 0;
  for (const sub of subscriptions) {
    const success = await sendPushToSubscription(sub, payload);
    if (success) sent++;
  }
  return sent;
}
