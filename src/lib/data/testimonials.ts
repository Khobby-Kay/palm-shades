export type Testimonial = {
  id: string;
  author: string;
  role?: string;
  rating: number;
  body: string;
  initials: string;
};

export const testimonials: Testimonial[] = [
  {
    id: "t-1",
    author: "Akosua Mensah",
    role: "Optical client",
    rating: 5,
    initials: "AM",
    body:
      "The fitting was unhurried and precise — they found a frame I would never have picked myself, and the prescription lenses are crystal clear.",
  },
  {
    id: "t-2",
    author: "Maame Adjoa",
    role: "Sunglasses collector",
    rating: 5,
    initials: "MA",
    body:
      "Palm Shades feels like a proper luxury house. The champagne aviators are my third pair — the packaging alone is worth the visit.",
  },
  {
    id: "t-3",
    author: "Selasi Tagoe",
    role: "Corporate gifting",
    rating: 5,
    initials: "ST",
    body:
      "We ordered gift sets for our executive team. Beautiful presentation, on-time delivery, and the team still talks about the experience months later.",
  },
  {
    id: "t-4",
    author: "Nana Yaa",
    role: "Blue light client",
    rating: 5,
    initials: "NY",
    body:
      "My screen-shield frames changed my workdays — no more headaches by 4pm. Booking online was simple and the boutique atmosphere is serene.",
  },
];
