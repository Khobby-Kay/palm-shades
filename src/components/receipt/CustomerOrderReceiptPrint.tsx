"use client";

import { Printer } from "lucide-react";
import { MotchisPrintChrome } from "@/components/admin/print/MotchisPrintChrome";
import { useAdminPrintStyles } from "@/hooks/useAdminPrintStyles";
import type { CustomerReceiptData } from "@/lib/customer-receipt";

type Props = {
  data: CustomerReceiptData;
  buttonLabel?: string;
  buttonClassName?: string;
};

export function CustomerOrderReceiptPrint({
  data,
  buttonLabel = "Print receipt",
  buttonClassName,
}: Props) {
  useAdminPrintStyles();

  const defaultButtonClass =
    "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50";

  return (
    <>
      <div className="print-section hidden bg-white p-8 print:block">
        <MotchisPrintChrome
          documentTitle="Order Receipt"
          reference={data.orderNumber}
          date={data.orderDate}
        >
          <div className="mb-4">
            <h2 className="mb-2 bg-gray-200 px-2 py-1 text-lg font-bold">
              BILLED TO
            </h2>
            <p className="pl-2 font-bold">{data.customerName}</p>
            {data.email ? <p className="pl-2">{data.email}</p> : null}
            {data.phone ? <p className="pl-2">{data.phone}</p> : null}
            {data.shippingLines?.map((line) => (
              <p key={line} className="pl-2">
                {line}
              </p>
            ))}
          </div>

          <div className="mb-4">
            <h2 className="mb-2 bg-gray-200 px-2 py-1 text-lg font-bold">
              ITEMS
            </h2>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-400">
                  <th className="px-2 py-2 text-left">Product</th>
                  <th className="px-2 py-2 text-center">Qty</th>
                  <th className="px-2 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, index) => (
                  <tr key={`${item.name}-${index}`} className="border-b border-gray-200">
                    <td className="px-2 py-2">
                      <span className="font-medium">{item.name}</span>
                      {item.variant ? (
                        <span className="block text-sm text-gray-600">
                          {item.variant}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-2 py-2 text-center">{item.quantity}</td>
                    <td className="px-2 py-2 text-right">
                      GH₵ {(item.unitPrice * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mb-4 flex justify-between">
            <div>
              {data.paymentMethod ? (
                <p>
                  <span className="font-semibold">Payment:</span>{" "}
                  {data.paymentMethod}
                  {data.paymentStatus ? ` (${data.paymentStatus})` : ""}
                </p>
              ) : null}
            </div>
            <div className="text-right">
              <p>Subtotal: GH₵ {data.subtotal.toFixed(2)}</p>
              <p>Shipping: GH₵ {data.shipping.toFixed(2)}</p>
              {data.tax != null && data.tax > 0 ? (
                <p>Tax: GH₵ {data.tax.toFixed(2)}</p>
              ) : null}
              {data.discount != null && data.discount > 0 ? (
                <p>Discount: −GH₵ {data.discount.toFixed(2)}</p>
              ) : null}
              <p className="mt-1 border-t border-gray-400 pt-1 text-lg font-bold">
                Total: GH₵ {data.total.toFixed(2)}
              </p>
            </div>
          </div>
        </MotchisPrintChrome>
      </div>

      <button
        type="button"
        onClick={() => window.print()}
        className={buttonClassName ?? defaultButtonClass}
      >
        <Printer className="h-4 w-4" aria-hidden />
        {buttonLabel}
      </button>
    </>
  );
}
