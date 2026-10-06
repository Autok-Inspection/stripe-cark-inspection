"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { finalizePayment } from "@/actions/finalize-report-purchase";
import {
  clearPendingCheckout,
  readPendingCheckout,
} from "@/lib/pending-checkout";

type PageState = "loading" | "success" | "error";

export function PaymentSuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<PageState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const paymentIntentId = searchParams.get("payment_intent");
      const redirectStatus = searchParams.get("redirect_status");

      if (redirectStatus === "failed") {
        router.replace("/payment/cancel");
        return;
      }

      if (!paymentIntentId) {
        if (!cancelled) {
          setState("success");
        }
        return;
      }

      const pending = readPendingCheckout();
      if (!pending) {
        if (!cancelled) {
          setErrorMessage(
            "Payment was received but your session details were lost. Please contact support with your payment confirmation.",
          );
          setState("error");
        }
        return;
      }

      try {
        const result = await finalizePayment({
          vin: pending.vin,
          firstName: pending.firstName,
          lastName: pending.lastName,
          customerEmail: pending.email,
          stripePaymentIntentId: paymentIntentId,
        });

        if (cancelled) return;

        if (!result.success) {
          setErrorMessage(result.error);
          setState("error");
          toast.error("Payment processing failed", { description: result.error });
          router.replace("/payment/cancel");
          return;
        }

        clearPendingCheckout();
        setState("success");
      } catch {
        if (!cancelled) {
          setErrorMessage(
            "Something went wrong while confirming your payment. Please contact support if you were charged.",
          );
          setState("error");
          router.replace("/payment/cancel");
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  if (state === "loading") {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Confirming your payment…</p>
        </div>
      </main>
    );
  }

  if (state === "error") {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="max-w-xl text-center space-y-4">
          <p className="text-destructive">{errorMessage}</p>
          <Link href="/payment/cancel">
            <Button variant="outline">Go to payment help</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full mx-auto">
        <div className="h-1 bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-300 rounded-full mb-1"></div>

        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 py-10 px-8">
            <div className="relative z-10 flex flex-col items-center">
              <div className="bg-custom_red bg-opacity-10 p-5 rounded-full mb-5 border-2 border-custom_red border-opacity-20">
                <CheckCircle className="h-14 w-14 text-custom_red" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 text-center">
                Payment Successful
              </h1>
              <div className="h-1 w-20 bg-custom_red rounded-full my-3"></div>
            </div>
          </div>

          <div className="bg-white py-12 px-8">
            <div className="max-w-xl mx-auto text-center">
              <p className="text-gray-700 text-lg mb-6">
                Your payment has been processed successfully. Please check your
                email for the receipt and further instructions.
              </p>
              <p className="text-gray-700 text-base mb-6">
                If you don&apos;t receive the email, please
                <a
                  href="mailto:contact@carkinspection.com"
                  className="text-custom_red"
                >
                  {" "}
                  contact our support team
                </a>
                .
              </p>

              <div className="pt-2">
                <Link href="/">
                  <Button className="bg-custom_red hover:bg-red-700 text-white shadow-lg hover:shadow-xl px-10 py-6 rounded-md text-lg transition-all duration-300 transform hover:-translate-y-1">
                    Return to Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 py-6 px-8 border-t border-gray-100">
            <div className="flex justify-center items-center">
              <div className="text-gray-400 text-sm text-center">
                We appreciate your business.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
