export type ServiceItem = {
  slug: string;
  name: string;
  shortDesc: string;
  description: string;
  durationMin: number;
  price: number;
  currency: string;
  ageRange?: string;
  preparation?: string;
  isFeatured?: boolean;
};

const G = (n: number) => Math.round(n * 100);

export const services: ServiceItem[] = [
  {
    slug: "frame-fitting",
    name: "Comprehensive Frame Fitting",
    shortDesc: "Measurements, bridge fit, and style guidance with our opticians.",
    description:
      "A one-on-one fitting session covering face shape analysis, bridge width, temple length, and frame balance. Leave with a shortlist of frames that truly suit you.",
    durationMin: 45,
    price: G(150),
    currency: "GHS",
    isFeatured: true,
  },
  {
    slug: "lens-consultation",
    name: "Prescription Lens Consultation",
    shortDesc: "Lens type, index, and coating recommendations for your lifestyle.",
    description:
      "We review your prescription and daily routine — screen time, driving, sports — to recommend lens materials, coatings, and tints that maximise clarity and comfort.",
    durationMin: 30,
    price: G(100),
    currency: "GHS",
    isFeatured: true,
  },
  {
    slug: "sunglasses-styling",
    name: "Sunglasses Styling Session",
    shortDesc: "Curated try-on with polarized and gradient lens options.",
    description:
      "Explore our sunglass collection with expert guidance on lens colour, frame proportion, and occasion dressing — from travel to rooftop evenings.",
    durationMin: 40,
    price: G(120),
    currency: "GHS",
    isFeatured: true,
  },
  {
    slug: "repairs-adjustments",
    name: "Repairs & Adjustments",
    shortDesc: "Temple tightening, nose-pad replacement, and minor repairs.",
    description:
      "Keep your frames performing beautifully. We handle temple adjustments, screw replacements, nose-pad swaps, and minor acetate repairs in-boutique.",
    durationMin: 20,
    price: G(80),
    currency: "GHS",
    isFeatured: true,
  },
  {
    slug: "blue-light-consultation",
    name: "Blue Light Lens Fitting",
    shortDesc: "Screen-ready frames with blue-light filter lens glazing.",
    description:
      "Select a blue-light frame and we'll guide you through filter strength, prescription glazing, and anti-reflective coatings for comfortable screen days.",
    durationMin: 35,
    price: G(100),
    currency: "GHS",
  },
  {
    slug: "corporate-gifting",
    name: "Corporate & Gifting Consultation",
    shortDesc: "Curated eyewear gifts for teams, clients, and milestones.",
    description:
      "Plan corporate gifting programmes or personal milestones with bespoke packaging, engraving options, and volume pricing for teams and events.",
    durationMin: 60,
    price: G(0),
    currency: "GHS",
    preparation: "Share headcount and budget ahead of your visit.",
  },
  {
    slug: "private-trunk-show",
    name: "Private Trunk Show",
    shortDesc: "After-hours boutique access for you and up to six guests.",
    description:
      "An exclusive after-hours experience with champagne, curated try-ons, and early access to new arrivals — ideal for birthdays, bridal parties, or executive teams.",
    durationMin: 120,
    price: G(800),
    currency: "GHS",
    isFeatured: true,
  },
  {
    slug: "virtual-styling",
    name: "Virtual Styling Appointment",
    shortDesc: "Video consultation with frame recommendations shipped to try at home.",
    description:
      "Can't visit Osu? Book a video call with our stylists. We'll shortlist frames, ship up to three pairs for home try-on, and finalize your order remotely.",
    durationMin: 30,
    price: G(80),
    currency: "GHS",
  },
];
