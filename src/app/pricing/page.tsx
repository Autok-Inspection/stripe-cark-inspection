"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Navbar } from "@/components/navbar";
import { FooterSection } from "@/components/footer";
import { PaymentDialog } from "@/components/payment-dialog";
import { Button } from "@/components/ui/button";
import { pricing } from "@/lib/constants";
import { useUserStore } from "@/store/user-store";

export default function PricingPage() {
  const [paymentOpen, setPaymentOpen] = useState(false);
  const vinNumber = useUserStore((s) => s.vnNumber);
  const hasVin = Boolean(vinNumber?.trim());

  return (
    <main className="max-w-[1920px] mx-auto relative overflow-hidden min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 mt-24 px-4 py-12">
        <div className="max-w-3xl mx-auto text-center mb-10 space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Get Your Vehicle Report
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Get detailed information about your vehicle with our comprehensive
            report.
          </p>
        </div>

        {!hasVin && (
          <div className="max-w-xl mx-auto mb-8 rounded-xl border border-amber-200 bg-amber-50 p-6 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="text-gray-800 text-sm">
                We could not find your VIN. Please submit the report form on the
                home page first.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link href="/#report">Go to report form</Link>
              </Button>
            </div>
          </div>
        )}

        <div
          className="relative bg-white rounded-2xl p-10 border border-gray-200 shadow-lg mx-auto"
          style={{ maxWidth: 520 }}
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-custom_red rounded-t-2xl" />
          <div className="relative">
            <h2 className="text-custom_red text-2xl font-semibold mb-1">
              {pricing[0].plan}
            </h2>
            <div className="mb-6">
              <p className="text-gray-600 text-base">PRICE</p>
              <p className="text-4xl font-bold text-custom_red">
                {pricing[0].price}
              </p>
            </div>
            <div className="space-y-2 mb-8">
              {pricing[0].features.map((feature, i) => (
                <div key={i} className="flex items-start">
                  <span className="text-green-600 mr-2 text-xl">✔️</span>
                  <span className="text-gray-600 text-lg">{feature}</span>
                </div>
              ))}
            </div>

            <Link
              href="https://buy.stripe.com/6oUfZhdvpfhDfWR3566AM1T"
              className="block w-full bg-custom_red hover:bg-red-700 text-white text-lg font-medium py-4 px-6 text-center rounded-xl transition-colors"
            >
              Get Started
            </Link>

            {/* <Button
              size="lg"
              className="w-full bg-custom_red hover:bg-red-700 text-white text-lg py-6 rounded-xl"
              onClick={() => setPaymentOpen(true)}
              disabled={!hasVin}
            >
              Get Started
            </Button> */}
          </div>
        </div>
      </div>

      {/* <PaymentDialog open={paymentOpen} onOpenChange={setPaymentOpen} /> */}
      <FooterSection />
    </main>
  );
}
