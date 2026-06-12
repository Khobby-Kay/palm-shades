import type { Metadata } from "next";
import { PolicyLayout } from "@/components/policies/PolicyLayout";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <PolicyLayout title="Terms of Service">
      <p>
        By using palmshades.com you agree to these terms. Prices and availability may change
        without notice. Appointments may be rescheduled with at least 24 hours notice.
      </p>
      <p>
        You are responsible for providing accurate contact and delivery details. We reserve the
        right to refuse service or cancel orders that appear fraudulent or abusive.
      </p>
      <p>
        These terms are governed by the laws of Ghana. Questions? Reach us through the Contact
        page.
      </p>
    </PolicyLayout>
  );
}
