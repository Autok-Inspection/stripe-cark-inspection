"use client";

import { FormEvent, useState } from "react";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { REPORT_PRICE_DISPLAY } from "@/lib/constants";

type CheckoutFormProps = {
  amountLabel?: string;
  onSuccess: (paymentIntentId: string) => void;
  disabled?: boolean;
};

export function CheckoutForm({
  amountLabel = REPORT_PRICE_DISPLAY,
  onSuccess,
  disabled = false,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [elementReady, setElementReady] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const returnUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/payment/success`
        : "/payment/success";

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: returnUrl,
      },
    });

    if (error) {
      setErrorMessage(error.message ?? "Payment could not be completed.");
      setIsLoading(false);
      return;
    }

    if (paymentIntent?.status === "succeeded" && paymentIntent.id) {
      onSuccess(paymentIntent.id);
      setIsLoading(false);
      return;
    }

    setErrorMessage("Payment was not completed. Please try again.");
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
        onReady={() => setElementReady(true)}
        onLoadError={(event) => {
          const message =
            event.error?.message ??
            "Payment form could not load. Check your Stripe keys in .env.";
          setErrorMessage(message);
          setElementReady(false);
        }}
      />
      {errorMessage ? (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <Button
        type="submit"
        className="w-full bg-custom_red hover:bg-red-700 text-white"
        disabled={!stripe || !elements || isLoading || disabled || !elementReady}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing…
          </>
        ) : (
          `Pay ${amountLabel}`
        )}
      </Button>
    </form>
  );
}
