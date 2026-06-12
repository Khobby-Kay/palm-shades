export type FaqItem = {
  id: string;
  category: string;
  question: string;
  answer: string;
};

export const faqCategories = [
  "Fittings & boutique",
  "Shop & shipping",
  "Frames & lenses",
  "Account",
] as const;

export const faqItems: FaqItem[] = [
  {
    id: "faq-1",
    category: "Fittings & boutique",
    question: "How do I book a fitting?",
    answer:
      "Visit Book Fitting on our website, choose a service, pick a date and time, and share any preferences. We'll confirm within one business day by email or phone.",
  },
  {
    id: "faq-2",
    category: "Fittings & boutique",
    question: "Do you offer home fittings?",
    answer:
      "Yes — select Home fitting when booking. Our opticians travel within Accra for private fittings with a curated selection of frames.",
  },
  {
    id: "faq-3",
    category: "Fittings & boutique",
    question: "What is your cancellation policy?",
    answer:
      "You may cancel or reschedule free of charge up to 24 hours before your appointment. Late cancellations may incur a fee.",
  },
  {
    id: "faq-4",
    category: "Shop & shipping",
    question: "How long does delivery take?",
    answer:
      "Orders within Accra typically arrive in 1–3 business days. Nationwide delivery may take 3–7 business days depending on your location.",
  },
  {
    id: "faq-5",
    category: "Shop & shipping",
    question: "Is shipping free?",
    answer:
      "Yes — complimentary delivery on orders over GHS 500. Smaller orders have a flat shipping fee shown at checkout.",
  },
  {
    id: "faq-6",
    category: "Shop & shipping",
    question: "Which payment methods do you accept?",
    answer:
      "Card (Stripe), Mobile Money, bank transfer, and cash on delivery where available.",
  },
  {
    id: "faq-7",
    category: "Frames & lenses",
    question: "Can you glaze frames with my prescription?",
    answer:
      "Absolutely. Book a lens consultation or bring your prescription to a frame fitting. We offer single vision, progressive, and high-index options.",
  },
  {
    id: "faq-8",
    category: "Frames & lenses",
    question: "Can I return a frame?",
    answer:
      "Unworn frames in original packaging may be returned within 14 days. Prescription lenses are custom-made and non-refundable once glazed.",
  },
  {
    id: "faq-9",
    category: "Account",
    question: "Do I need an account to shop or book?",
    answer:
      "No — guest checkout and guest booking work perfectly. An account lets you track orders, save prescriptions, and rebook faster.",
  },
];
