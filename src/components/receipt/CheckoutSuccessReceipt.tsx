"use client";

import { CustomerOrderReceiptPrint } from "@/components/receipt/CustomerOrderReceiptPrint";
import type { CustomerReceiptData } from "@/lib/customer-receipt";

export function CheckoutSuccessReceipt({ data }: { data: CustomerReceiptData }) {
  return (
    <CustomerOrderReceiptPrint
      data={data}
      buttonClassName="inline-flex items-center gap-2 rounded-full border border-blush-200 bg-white px-5 py-2.5 text-sm font-medium text-charcoal shadow-sm transition hover:bg-blush-50"
    />
  );
}
