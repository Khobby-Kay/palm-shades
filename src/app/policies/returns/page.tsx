import type { Metadata } from "next";
import { PolicyLayout } from "@/components/policies/PolicyLayout";

export const metadata: Metadata = {
  title: "Returns & Refunds",
};

export default function ReturnsPolicyPage() {
  return (
    <PolicyLayout title="Returns & Refunds">
      <p>
        Unopened boutique items in original packaging may be returned within 14 days of delivery
        for a store credit or exchange, subject to inspection.
      </p>
      <p>
        Fitting fees and opened lens-care products cannot be returned for hygiene reasons.
        If something went wrong with your visit, please contact us within 48 hours.
      </p>
      <p>
        Refunds for eligible card payments are processed to the original payment method within
        5–10 business days after approval.
      </p>
    </PolicyLayout>
  );
}
