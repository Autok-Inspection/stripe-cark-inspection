import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import { PaymentSuccessClient } from "@/components/payment-success-client";

function PaymentSuccessFallback() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p>Loading…</p>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentSuccessFallback />}>
      <PaymentSuccessClient />
    </Suspense>
  );
}
