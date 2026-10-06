import { loadStripe, Stripe } from "@stripe/stripe-js";

const STRIPE_PK_MIN_LENGTH = 100;

function getPublishableKey(): string | null {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
  if (!key) {
    return null;
  }
  if (!/^pk_(test|live)_[A-Za-z0-9]+$/.test(key)) {
    return null;
  }
  if (key.length < STRIPE_PK_MIN_LENGTH) {
    return null;
  }
  return key;
}

export function getStripeConfigError(): string | null {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
  if (!key) {
    return "Stripe publishable key is not configured.";
  }
  if (!/^pk_(test|live)_[A-Za-z0-9]+$/.test(key)) {
    return "Stripe publishable key format is invalid.";
  }
  if (key.length < STRIPE_PK_MIN_LENGTH) {
    return "Stripe publishable key looks incomplete. Copy the full key from the Stripe Dashboard (Developers → API keys).";
  }
  return null;
}

const publishableKey = getPublishableKey();

export const stripePromise: Promise<Stripe | null> = publishableKey
  ? loadStripe(publishableKey)
  : Promise.resolve(null);
