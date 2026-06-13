import { MessageCircle } from "lucide-react";
import { productWhatsAppMessage, whatsappUrl } from "@/lib/whatsapp";

export function WhatsAppStylistCta({
  productName,
  slug,
}: {
  productName: string;
  slug: string;
}) {
  const href = whatsappUrl(productWhatsAppMessage(productName, slug));

  return (
    <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-4 sm:p-5">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-emerald-600 bg-white px-5 py-3 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-600 hover:text-white"
      >
        <MessageCircle className="h-4 w-4" />
        Ask stylist on WhatsApp
      </a>
      <p className="mt-2 text-center text-xs text-charcoal-light">
        Share this frame · typical reply within 15 minutes
      </p>
    </div>
  );
}
