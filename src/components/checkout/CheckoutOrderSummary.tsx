import { CoverImage } from "@/components/ui/CoverImage";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: string;
}

interface CheckoutOrderSummaryProps {
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  variant?: "sidebar" | "embedded";
}

export default function CheckoutOrderSummary({
  items,
  subtotal,
  shipping,
  tax,
  total,
  variant = "sidebar",
}: CheckoutOrderSummaryProps) {
  const isEmbedded = variant === "embedded";

  return (
    <div
      className={
        isEmbedded
          ? "pt-4"
          : "rounded-xl bg-white p-4 shadow-sm sm:p-6 lg:sticky lg:top-4"
      }
    >
      {!isEmbedded ? (
        <h2 className="mb-4 text-lg font-bold text-gray-900 sm:mb-6 sm:text-xl">
          Order Summary
        </h2>
      ) : null}

      <div className={`space-y-3 sm:space-y-4 ${isEmbedded ? "" : "mb-4 sm:mb-6"}`}>
        {items.map((item) => (
          <div
            key={`${item.id}-${item.variant || "novar"}`}
            className="flex gap-3 sm:gap-4"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-20 sm:w-20">
              <CoverImage src={item.image} alt={item.name} sizes="80px" />
              <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white sm:-right-2 sm:-top-2 sm:h-6 sm:w-6 sm:text-xs">
                {item.quantity}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">
                {item.name}
              </h3>
              {item.variant ? (
                <p className="mt-0.5 truncate text-xs text-gray-500">
                  {item.variant}
                </p>
              ) : null}
              <p className="mt-1 font-bold text-primary-700">
                GH₵ {item.price.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2 border-t border-gray-200 pt-3 sm:space-y-3 sm:pt-4">
        <div className="flex justify-between text-sm text-gray-700 sm:text-base">
          <span>Subtotal</span>
          <span className="font-semibold">GH₵ {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-700 sm:text-base">
          <span>Shipping</span>
          <span className="font-semibold">
            {shipping === 0 ? "FREE" : `GH₵ ${shipping.toFixed(2)}`}
          </span>
        </div>
        {tax > 0 ? (
          <div className="flex justify-between text-sm text-gray-700 sm:text-base">
            <span>Tax</span>
            <span className="font-semibold">GH₵ {tax.toFixed(2)}</span>
          </div>
        ) : null}
      </div>

      <div className="mt-3 border-t border-gray-200 pt-3 sm:mt-4 sm:pt-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-base font-bold text-gray-900 sm:text-lg">
            Total
          </span>
          <span className="text-xl font-bold text-primary-700 sm:text-2xl">
            GH₵ {total.toFixed(2)}
          </span>
        </div>
      </div>

      {!isEmbedded ? (
        <div className="mt-4 rounded-lg border border-primary-200 bg-primary-50 p-3 sm:mt-6 sm:p-4">
          <div className="flex items-center gap-2 text-primary-800">
            <i className="ri-shield-check-line text-lg sm:text-xl"></i>
            <p className="text-xs font-semibold sm:text-sm">
              Secure Checkout · Palm Shades
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

interface CheckoutMobileSummaryProps {
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export function CheckoutMobileSummary({
  items,
  subtotal,
  shipping,
  tax,
  total,
}: CheckoutMobileSummaryProps) {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <details className="group rounded-xl bg-white shadow-sm lg:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-900">Order Summary</p>
          <p className="text-xs text-gray-500">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-lg font-bold text-primary-700">
            GH₵ {total.toFixed(2)}
          </span>
          <i className="ri-arrow-down-s-line text-xl text-gray-400 transition-transform group-open:rotate-180"></i>
        </div>
      </summary>
      <div className="border-t border-gray-100 px-4 pb-4">
        <CheckoutOrderSummary
          variant="embedded"
          items={items}
          subtotal={subtotal}
          shipping={shipping}
          tax={tax}
          total={total}
        />
      </div>
    </details>
  );
}
