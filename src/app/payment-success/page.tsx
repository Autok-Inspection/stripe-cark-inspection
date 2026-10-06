import { redirect } from "next/navigation";

export default function LegacyPaymentSuccessPage() {
  redirect("/payment/success");
}
