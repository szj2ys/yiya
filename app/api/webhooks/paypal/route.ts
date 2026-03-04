import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import db from "@/db/drizzle";
import { userSubscription } from "@/db/schema";
import { verifyPayPalWebhook, getPayPalSubscription } from "@/lib/paypal";
import { track } from "@/lib/analytics";

/**
 * PayPal Webhook Handler
 *
 * Handles PayPal subscription events:
 * - BILLING.SUBSCRIPTION.CREATED
 * - BILLING.SUBSCRIPTION.ACTIVATED
 * - BILLING.SUBSCRIPTION.PAYMENT.FAILED
 * - BILLING.SUBSCRIPTION.CANCELLED
 * - BILLING.SUBSCRIPTION.EXPIRED
 */
export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headers = request.headers;

    // Verify webhook signature in production
    if (process.env.NODE_ENV === "production") {
      const isValid = await verifyPayPalWebhook(headers, body);
      if (!isValid) {
        console.error("[paypal-webhook] Invalid webhook signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const event = JSON.parse(body);
    const eventType = event.event_type;
    const resource = event.resource;

    console.log(`[paypal-webhook] Received event: ${eventType}`);

    switch (eventType) {
      case "BILLING.SUBSCRIPTION.ACTIVATED":
      case "BILLING.SUBSCRIPTION.CREATED": {
        const subscriptionId = resource.id;
        const customId = resource.custom_id; // This is our userId
        const status = resource.status;

        if (!customId) {
          console.error("[paypal-webhook] No custom_id found in subscription");
          return NextResponse.json({ error: "No user ID" }, { status: 400 });
        }

        // Get subscription details to find the next billing time
        const subscriptionDetails = await getPayPalSubscription(subscriptionId);
        const billingInfo = subscriptionDetails.billing_info;
        const nextBillingTime = billingInfo?.next_billing_time
          ? new Date(billingInfo.next_billing_time)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        // Update or create subscription
        await db.insert(userSubscription).values({
          userId: customId,
          provider: "paypal",
          paypalSubscriptionId: subscriptionId,
          currentPeriodEnd: nextBillingTime,
        }).onConflictDoUpdate({
          target: userSubscription.userId,
          set: {
            provider: "paypal",
            paypalSubscriptionId: subscriptionId,
            currentPeriodEnd: nextBillingTime,
          },
        });

        await track("subscription_activated", {
          provider: "paypal",
          subscription_id: subscriptionId,
        });

        console.log(`[paypal-webhook] Subscription ${subscriptionId} activated for user ${customId}`);
        break;
      }

      case "BILLING.SUBSCRIPTION.PAYMENT.FAILED": {
        const subscriptionId = resource.id;
        const customId = resource.custom_id;

        if (!customId) break;

        // Log the failure but keep the subscription active
        // PayPal will retry the payment
        await track("subscription_payment_failed", {
          provider: "paypal",
          subscription_id: subscriptionId,
        });

        console.log(`[paypal-webhook] Payment failed for subscription ${subscriptionId}`);
        break;
      }

      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.EXPIRED":
      case "BILLING.SUBSCRIPTION.SUSPENDED": {
        const subscriptionId = resource.id;
        const customId = resource.custom_id;

        if (!customId) break;

        // Update the subscription to mark it as cancelled
        // We keep the record but the isActive check will see it's expired
        await db.update(userSubscription)
          .set({
            currentPeriodEnd: new Date(), // Set to now so isActive becomes false
          })
          .where(eq(userSubscription.paypalSubscriptionId, subscriptionId));

        await track("subscription_cancelled", {
          provider: "paypal",
          subscription_id: subscriptionId,
          reason: eventType,
        });

        console.log(`[paypal-webhook] Subscription ${subscriptionId} ${eventType.toLowerCase().split('.').pop()}`);
        break;
      }

      case "PAYMENT.SALE.COMPLETED": {
        // A payment was successfully processed
        const billingAgreementId = resource.billing_agreement_id;

        if (billingAgreementId) {
          // This is a subscription payment
          // Update the period end to extend it
          const subscription = await db.query.userSubscription.findFirst({
            where: eq(userSubscription.paypalSubscriptionId, billingAgreementId),
          });

          if (subscription) {
            const newPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            await db.update(userSubscription)
              .set({ currentPeriodEnd: newPeriodEnd })
              .where(eq(userSubscription.id, subscription.id));

            await track("subscription_payment_success", {
              provider: "paypal",
              subscription_id: billingAgreementId,
            });
          }
        }
        break;
      }

      default:
        console.log(`[paypal-webhook] Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[paypal-webhook] Error processing webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PayPal webhooks require GET for verification sometimes
export async function GET() {
  return NextResponse.json({ status: "PayPal webhook endpoint active" });
}
