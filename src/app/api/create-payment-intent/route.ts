import { NextResponse } from "next/server";

import { REPORT_CURRENCY, REPORT_PRICE_CENTS } from "@/lib/constants";
import { getStripeServer } from "@/lib/stripe-server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      amount?: number;
      currency?: string;
    };

    const amount =
      typeof body.amount === "number" && body.amount > 0
        ? Math.round(body.amount)
        : REPORT_PRICE_CENTS;
    const currency =
      typeof body.currency === "string" && body.currency.trim()
        ? body.currency.trim().toLowerCase()
        : REPORT_CURRENCY;

    const stripe = getStripeServer();
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("[create-payment-intent]", error);
    return NextResponse.json(
      { error: "Could not create payment intent." },
      { status: 500 },
    );
  }
}
