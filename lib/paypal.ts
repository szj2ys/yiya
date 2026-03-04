import { LoadScriptOptions } from "@paypal/paypal-js";

export const PAYPAL_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
  mode: process.env.PAYPAL_MODE || "sandbox",
  currency: "USD",
  planId: process.env.PAYPAL_PLAN_ID || "", // For subscription-based billing
};

export const PAYPAL_SCRIPT_OPTIONS: LoadScriptOptions = {
  clientId: PAYPAL_CONFIG.clientId,
  currency: PAYPAL_CONFIG.currency,
  intent: "subscription",
  vault: true,
};

// Server-side PayPal API client
export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured");
  }

  const baseUrl = process.env.PAYPAL_MODE === "live"
    ? "https://api.paypal.com"
    : "https://api.sandbox.paypal.com";

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`Failed to get PayPal access token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

export async function createPayPalSubscription(userId: string, email: string) {
  const accessToken = await getPayPalAccessToken();
  const baseUrl = process.env.PAYPAL_MODE === "live"
    ? "https://api.paypal.com"
    : "https://api.sandbox.paypal.com";

  // Create a product if not exists, or use existing plan
  // For now, we'll create a subscription directly
  const response = await fetch(`${baseUrl}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "PayPal-Request-Id": `sub-${userId}-${Date.now()}`,
    },
    body: JSON.stringify({
      plan_id: process.env.PAYPAL_PLAN_ID,
      start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Start tomorrow
      subscriber: {
        email_address: email,
        name: {
          given_name: "Yiya",
          surname: "User",
        },
      },
      application_context: {
        brand_name: "Yiya",
        locale: "en-US",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/shop?paypal=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/shop?paypal=cancel`,
      },
      custom_id: userId,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create PayPal subscription: ${error}`);
  }

  const data = await response.json();
  return {
    subscriptionId: data.id,
    approvalUrl: data.links.find((link: { rel: string; href: string }) => link.rel === "approve")?.href,
  };
}

export async function getPayPalSubscription(subscriptionId: string) {
  const accessToken = await getPayPalAccessToken();
  const baseUrl = process.env.PAYPAL_MODE === "live"
    ? "https://api.paypal.com"
    : "https://api.sandbox.paypal.com";

  const response = await fetch(`${baseUrl}/v1/billing/subscriptions/${subscriptionId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get PayPal subscription: ${response.statusText}`);
  }

  return response.json();
}

export async function cancelPayPalSubscription(subscriptionId: string, reason?: string) {
  const accessToken = await getPayPalAccessToken();
  const baseUrl = process.env.PAYPAL_MODE === "live"
    ? "https://api.paypal.com"
    : "https://api.sandbox.paypal.com";

  const response = await fetch(`${baseUrl}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ reason: reason || "User requested cancellation" }),
  });

  if (!response.ok && response.status !== 204) {
    throw new Error(`Failed to cancel PayPal subscription: ${response.statusText}`);
  }

  return true;
}

// Webhook verification
export async function verifyPayPalWebhook(
  headers: Headers,
  body: string
): Promise<boolean> {
  const accessToken = await getPayPalAccessToken();
  const baseUrl = process.env.PAYPAL_MODE === "live"
    ? "https://api.paypal.com"
    : "https://api.sandbox.paypal.com";

  const authAlgo = headers.get("paypal-auth-algo");
  const certUrl = headers.get("paypal-cert-url");
  const transmissionId = headers.get("paypal-transmission-id");
  const transmissionSig = headers.get("paypal-transmission-sig");
  const transmissionTime = headers.get("paypal-transmission-time");

  if (!authAlgo || !certUrl || !transmissionId || !transmissionSig || !transmissionTime) {
    return false;
  }

  const response = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_id: transmissionId,
      transmission_sig: transmissionSig,
      transmission_time: transmissionTime,
      webhook_id: process.env.PAYPAL_WEBHOOK_ID,
      webhook_event: JSON.parse(body),
    }),
  });

  if (!response.ok) {
    return false;
  }

  const data = await response.json();
  return data.verification_status === "SUCCESS";
}
