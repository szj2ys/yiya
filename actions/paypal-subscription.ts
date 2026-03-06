"use server";

import { currentUser } from "@clerk/nextjs";
import { getAuthUserId } from "@/lib/auth-utils";
import { createPayPalSubscription, getPayPalSubscription, cancelPayPalSubscription } from "@/lib/paypal";
import { getUserSubscription } from "@/db/queries";
import { track } from "@/lib/analytics";
import db from "@/db/drizzle";
import { userSubscription } from "@/db/schema";
import { eq } from "drizzle-orm";

const returnUrl = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/shop`
  : "http://localhost:3000/shop";

export const createPayPalCheckout = async () => {
  const userId = await getAuthUserId();
  const user = await currentUser();

  if (!userId || !user) {
    throw new Error("Unauthorized");
  }

  const existingSubscription = await getUserSubscription();

  await track("checkout_start", { surface: "shop", provider: "paypal" });

  // If user already has a PayPal subscription, redirect to PayPal to manage it
  if (existingSubscription?.provider === "paypal" && existingSubscription.paypalSubscriptionId) {
    const subscription = await getPayPalSubscription(existingSubscription.paypalSubscriptionId);
    const manageUrl = subscription.links?.find(
      (link: { rel: string; href: string }) => link.rel === "edit"
    )?.href;

    if (manageUrl) {
      return { data: manageUrl };
    }
  }

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) {
    throw new Error("Email required");
  }

  const { subscriptionId, approvalUrl } = await createPayPalSubscription(userId, email);

  // Store the pending subscription in the database
  // It will be activated when the webhook receives the confirmation
  await db.insert(userSubscription).values({
    userId,
    provider: "paypal",
    paypalSubscriptionId: subscriptionId,
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  }).onConflictDoUpdate({
    target: userSubscription.userId,
    set: {
      provider: "paypal",
      paypalSubscriptionId: subscriptionId,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return { data: approvalUrl };
};

export const managePayPalSubscription = async () => {
  const userId = await getAuthUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const subscription = await getUserSubscription();

  if (!subscription?.paypalSubscriptionId) {
    throw new Error("No PayPal subscription found");
  }

  const paypalSub = await getPayPalSubscription(subscription.paypalSubscriptionId);

  // Return the self link for managing the subscription
  const manageUrl = paypalSub.links?.find(
    (link: { rel: string; href: string }) => link.rel === "edit"
  )?.href;

  if (!manageUrl) {
    throw new Error("Could not get management URL");
  }

  return { data: manageUrl };
};

export const cancelPayPalSubscriptionAction = async () => {
  const userId = await getAuthUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const subscription = await getUserSubscription();

  if (!subscription?.paypalSubscriptionId) {
    throw new Error("No PayPal subscription found");
  }

  await cancelPayPalSubscription(subscription.paypalSubscriptionId);

  await track("subscription_cancelled", { provider: "paypal" });

  return { success: true };
};
