"use client";

import { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import type { Stripe } from "@stripe/stripe-js";
import { Loader2 } from "lucide-react";

import { CheckoutForm } from "@/components/checkout-form";
import {
  REPORT_CURRENCY,
  REPORT_PRICE_CENTS,
  REPORT_PRICE_DISPLAY,
} from "@/lib/constants";
import { getStripeConfigError, stripePromise } from "@/lib/stripe";

type PaymentWrapperProps = {
  amountCents?: number;
  currency?: string;
  amountLabel?: string;
  onSuccess: (paymentIntentId: string) => void;
  disabled?: boolean;
};

const appearance = {
  theme: "stripe" as const,
};

export function PaymentWrapper({
  amountCents = REPORT_PRICE_CENTS,
  currency = REPORT_CURRENCY,
  amountLabel = REPORT_PRICE_DISPLAY,
  onSuccess,
  disabled = false,
}: PaymentWrapperProps) {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      setLoading(true);
      setError(null);
      setClientSecret(null);

      const configError = getStripeConfigError();
      if (configError) {
        if (!cancelled) {
          setError(configError);
          setLoading(false);
        }
        return;
      }

      const stripeInstance = await stripePromise;
      if (cancelled) return;

      if (!stripeInstance) {
        setError(
          "Stripe failed to load. Verify NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY matches your STRIPE_SECRET_KEY account.",
        );
        setLoading(false);
        return;
      }

      setStripe(stripeInstance);

      try {
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: amountCents, currency }),
        });

        const data = (await response.json()) as {
          clientSecret?: string;
          error?: string;
        };

        if (cancelled) return;

        if (!response.ok || !data.clientSecret) {
          setError(data.error ?? "Failed to initialize payment.");
          setLoading(false);
          return;
        }

        setClientSecret(data.clientSecret);
      } catch {
        if (!cancelled) {
          setError("Failed to initialize payment.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, [amountCents, currency]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading payment form…
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    );
  }

  if (!stripe || !clientSecret) {
    return null;
  }

  return (
    <Elements
      stripe={stripe}
      options={{
        clientSecret,
        appearance,
      }}
    >
      <CheckoutForm
        amountLabel={amountLabel}
        onSuccess={onSuccess}
        disabled={disabled}
      />
    </Elements>
  );
}
