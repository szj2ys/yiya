"use client";

import { useEffect, useRef, useState } from "react";
import { loadScript, PayPalNamespace } from "@paypal/paypal-js";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { PAYPAL_SCRIPT_OPTIONS } from "@/lib/paypal";
import { createPayPalCheckout } from "@/actions/paypal-subscription";

type Props = {
  onSuccess?: () => void;
  onError?: () => void;
};

export function PayPalButton({ onSuccess, onError }: Props) {
  const paypalRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const paypalInstance = useRef<PayPalNamespace | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initPayPal() {
      try {
        const paypal = await loadScript(PAYPAL_SCRIPT_OPTIONS);

        if (!isMounted || !paypal) {
          setError("Failed to load PayPal");
          setIsLoading(false);
          return;
        }

        paypalInstance.current = paypal;

        if (paypal.Buttons && paypalRef.current) {
          paypal.Buttons({
            style: {
              shape: "rect",
              color: "gold",
              layout: "vertical",
              label: "subscribe",
            },
            createSubscription: async () => {
              try {
                const result = await createPayPalCheckout();
                if (result.data) {
                  // Extract subscription ID from the approval URL
                  const url = new URL(result.data);
                  const subscriptionId = url.searchParams.get("ba_token") ||
                    url.pathname.split("/").pop();

                  if (subscriptionId) {
                    return subscriptionId;
                  }
                }
                throw new Error("Failed to create subscription");
              } catch (err) {
                console.error("PayPal subscription creation error:", err);
                toast.error("Failed to start PayPal checkout");
                throw err;
              }
            },
            onApprove: async () => {
              toast.success("Subscription activated!");
              onSuccess?.();
            },
            onCancel: () => {
              toast.info("Checkout cancelled");
            },
            onError: (err) => {
              console.error("PayPal error:", err);
              toast.error("PayPal checkout failed");
              setError("Checkout failed. Please try again.");
              onError?.();
            },
          }).render(paypalRef.current);
        }

        setIsLoading(false);
      } catch (err) {
        console.error("PayPal init error:", err);
        if (isMounted) {
          setError("Failed to load PayPal");
          setIsLoading(false);
        }
      }
    }

    initPayPal();

    return () => {
      isMounted = false;
    };
  }, [onSuccess, onError]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full">
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
        </div>
      )}
      <div ref={paypalRef} className={isLoading ? "hidden" : ""} />
    </div>
  );
}
