"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useCallback, useEffect, useState } from "react";

import { useUserStore } from "@/store/user-store";
import { normalizeVin } from "@/lib/vin-validation";
import { REPORT_PRICE_DISPLAY } from "@/lib/constants";
import { getStripeConfigError } from "@/lib/stripe";
import {
  clearPendingCheckout,
  savePendingCheckout,
} from "@/lib/pending-checkout";
import { PaymentWrapper } from "@/components/payment-wrapper";
import { finalizePayment } from "@/actions/finalize-report-purchase";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PaymentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function isStripeConfigured(): boolean {
  return getStripeConfigError() === null;
}

function readVinFromClient(): string {
  if (typeof window === "undefined") return "";
  return useUserStore.getState().vnNumber?.trim() || "";
}

export function PaymentDialog({ open, onOpenChange }: PaymentDialogProps) {
  const router = useRouter();
  const store = useUserStore();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!open) return;

    setFirstName(store.firstName || "");
    setLastName(store.lastName || "");
    setEmail(store.email || "");
  }, [open, store.firstName, store.lastName, store.email]);

  useEffect(() => {
    if (!open) return;

    const fn = firstName.trim();
    const ln = lastName.trim();
    const em = email.trim();
    const vin = normalizeVin(readVinFromClient());

    if (fn && ln && em && vin) {
      savePendingCheckout({
        vin,
        firstName: fn,
        lastName: ln,
        email: em,
      });
    }
  }, [open, firstName, lastName, email]);

  const handlePaymentSuccess = useCallback(
    async (paymentIntentId: string) => {
      const fn = firstName.trim();
      const ln = lastName.trim();
      const em = email.trim();
      const vin = normalizeVin(readVinFromClient());

      if (!fn || !ln || !em) {
        toast.error("Missing information", {
          description: "Please enter your first name, last name, and email.",
        });
        return;
      }

      if (!vin) {
        toast.error("VIN not found", {
          description:
            "Please go back to the home page and submit the report form first.",
        });
        return;
      }

      setProcessing(true);
      onOpenChange(false);

      try {
        const result = await finalizePayment({
          vin,
          firstName: fn,
          lastName: ln,
          customerEmail: em,
          stripePaymentIntentId: paymentIntentId,
        });

        if (!result.success) {
          toast.error("Payment processing failed", {
            description: result.error,
          });
          router.push("/payment/cancel");
          return;
        }

        clearPendingCheckout();
        router.push("/payment/success");
      } catch {
        toast.error("Something went wrong", {
          description: "Please contact support if you were charged.",
        });
        router.push("/payment/cancel");
      } finally {
        setProcessing(false);
      }
    },
    [firstName, lastName, email, onOpenChange, router],
  );

  const fieldsComplete =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete payment — {REPORT_PRICE_DISPLAY}</DialogTitle>
          <DialogDescription>
            Enter your details and pay securely with your debit or credit card.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="paymentFirstName">First Name</Label>
            <Input
              id="paymentFirstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              disabled={processing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentLastName">Last Name</Label>
            <Input
              id="paymentLastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              disabled={processing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentEmail">Email</Label>
            <Input
              id="paymentEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={processing}
            />
          </div>

          {isStripeConfigured() ? (
            open ? (
              <div className="pt-2">
                <PaymentWrapper
                  onSuccess={(id) => void handlePaymentSuccess(id)}
                  disabled={!fieldsComplete || processing}
                />
              </div>
            ) : null
          ) : (
            <p className="text-sm text-destructive">
              {getStripeConfigError() ??
                "Stripe publishable key is not configured."}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
