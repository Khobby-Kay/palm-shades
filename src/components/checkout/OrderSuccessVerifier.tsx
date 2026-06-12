"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/** Tiwa-style post-Moolre redirect: verify payment with server, then refresh. */
export function OrderSuccessVerifier({ orderNumber }: { orderNumber: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("Verifying payment with Moolre…");

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      try {
        const res = await fetch("/api/payment/moolre/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderNumber }),
        });
        const data = await res.json();

        if (cancelled) return;

        if (data.success && data.payment_status === "paid") {
          setMessage("Payment confirmed! Refreshing…");
          router.refresh();
          return;
        }

        setMessage(
          data.message ??
            "Payment not confirmed yet. If you completed payment, wait a moment and refresh."
        );
      } catch {
        if (!cancelled) {
          setMessage("Could not verify payment. Please refresh the page in a moment.");
        }
      }
    }

    void verify();
    const retry = setInterval(verify, 8000);

    return () => {
      cancelled = true;
      clearInterval(retry);
    };
  }, [orderNumber, router]);

  return (
    <div className="border-b border-primary-100 bg-primary-50/80 px-4 py-3 text-center text-sm text-primary-900">
      <i className="ri-loader-4-line mr-2 inline-block animate-spin" />
      {message}
    </div>
  );
}
