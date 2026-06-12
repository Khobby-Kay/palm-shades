import type { Metadata } from "next";
import { PolicyLayout } from "@/components/policies/PolicyLayout";

export const metadata: Metadata = {
  title: "Shipping Policy",
};

export default function ShippingPolicyPage() {
  return (
    <PolicyLayout title="Shipping Policy">
      <p>
        Orders are packed within 1–2 business days. Accra deliveries typically arrive in 2–4
        business days; other regions may take longer.
      </p>
      <p>
        Free shipping applies to boutique orders over GHS 500. Below that threshold, a flat
        shipping fee is calculated at checkout.
      </p>
      <p>
        You will receive email updates when your order is confirmed and dispatched. For help,
        contact us via the Contact page.
      </p>
    </PolicyLayout>
  );
}
