import type { Metadata } from "next";
import { PolicyLayout } from "@/components/policies/PolicyLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyLayout title="Privacy Policy">
      <p>
        Palm Shades collects only the information needed to fulfil orders and appointments:
        name, email, phone, shipping address, and guest profile details you choose to save.
      </p>
      <p>
        Payment card data is handled by Stripe and never stored on our servers. We do not sell
        your personal information to third parties.
      </p>
      <p>
        You may request access or deletion of your account data by emailing our team. We use
        reasonable technical measures to protect your information.
      </p>
    </PolicyLayout>
  );
}
