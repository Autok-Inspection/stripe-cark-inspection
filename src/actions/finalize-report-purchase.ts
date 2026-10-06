"use server";

import db from "@/lib/db";
import { buildPaymentReceivedEmailHtml } from "@/lib/emails/templates";
import { createResendClient, getResendFrom } from "@/lib/emails/resend-config";
import { getOwnerEmail, shouldSendOwnerCopy } from "@/lib/emails/owner-inbox";
import { REPORT_PRICE_CENTS, REPORT_PRICE_DISPLAY } from "@/lib/constants";
import { getStripeServer } from "@/lib/stripe-server";

export type FinalizePaymentInput = {
  vin: string;
  firstName: string;
  lastName: string;
  customerEmail: string;
  stripePaymentIntentId: string;
};

/**
 * After successful Stripe payment: verify intent, persist payment record,
 * then send payment confirmation emails to customer and owner.
 */
export async function finalizePayment(
  input: FinalizePaymentInput,
): Promise<{ success: true } | { success: false; error: string }> {
  const email = input.customerEmail.trim();
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const vin = input.vin.trim();

  if (!email) {
    return { success: false, error: "Customer email is required." };
  }
  if (!firstName || !lastName) {
    return { success: false, error: "First and last name are required." };
  }
  if (!vin) {
    return { success: false, error: "VIN is required." };
  }
  if (!input.stripePaymentIntentId?.trim()) {
    return { success: false, error: "Stripe payment reference is required." };
  }

  let transactionId: string;
  let amountDisplay: string;
  let currency: string;

  try {
    const stripe = getStripeServer();
    const paymentIntent = await stripe.paymentIntents.retrieve(
      input.stripePaymentIntentId.trim(),
    );

    if (paymentIntent.status !== "succeeded") {
      return {
        success: false,
        error: "Payment has not been completed.",
      };
    }

    if (paymentIntent.amount !== REPORT_PRICE_CENTS) {
      return {
        success: false,
        error: "Payment amount does not match the report price.",
      };
    }

    transactionId = paymentIntent.id;
    amountDisplay = (paymentIntent.amount / 100).toFixed(2);
    currency = paymentIntent.currency.toUpperCase();
  } catch (e) {
    console.error("[finalizePayment] Stripe verification failed", e);
    return {
      success: false,
      error: "We could not verify your payment. Please contact support.",
    };
  }

  const customerName = `${firstName} ${lastName}`.trim();

  try {
    const existing = await db.payment.findUnique({
      where: { orderID: transactionId },
    });

    if (existing?.status === "COMPLETED") {
      return { success: true };
    }

    await db.payment.create({
      data: {
        firstName,
        lastName,
        email,
        plan: `Vehicle History Report — ${REPORT_PRICE_DISPLAY}`,
        orderID: transactionId,
        status: "COMPLETED",
      },
    });
  } catch (e) {
    console.error("[finalizePayment] DB save failed", e);
    const existing = await db.payment.findUnique({
      where: { orderID: transactionId },
    });
    if (existing?.status === "COMPLETED") {
      return { success: true };
    }
    return {
      success: false,
      error: "We could not save your order. Please contact support.",
    };
  }

  const resend = createResendClient();
  const from = getResendFrom();

  if (resend) {
    const emailSubject = "Payment Received — CarK Car Inspection";
    const emailHtml = buildPaymentReceivedEmailHtml({
      customerName,
      customerEmail: email,
      vin,
      stripeTransactionId: transactionId,
      amountDisplay,
      currency,
    });

    try {
      await resend.emails.send({
        from,
        to: email,
        subject: emailSubject,
        html: emailHtml,
      });
    } catch (e) {
      console.error("[finalizePayment] confirmation email (customer)", e);
      return {
        success: false,
        error:
          "Your payment was received, but we could not send your confirmation email. Please contact support.",
      };
    }

    const owner = getOwnerEmail();
    if (owner && shouldSendOwnerCopy(email)) {
      try {
        await resend.emails.send({
          from,
          to: owner,
          replyTo: email,
          subject: emailSubject,
          html: emailHtml,
        });
      } catch (e) {
        console.error("[finalizePayment] confirmation email (owner)", e);
        return {
          success: false,
          error:
            "Your payment was received, but we could not complete order notifications. Please contact support.",
        };
      }
    }
  } else {
    console.warn("[finalizePayment] RESEND_API_KEY not set; skipping emails.");
  }

  return { success: true };
}
