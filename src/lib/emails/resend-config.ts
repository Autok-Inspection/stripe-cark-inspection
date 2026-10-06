import { Resend } from "resend";

export function createResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
}

export function getResendFrom(): string {
  return (
    process.env.RESEND_EMAIL?.trim() ||
    "Car Inspection <noreply@carkinspection.com>"
  );
}
