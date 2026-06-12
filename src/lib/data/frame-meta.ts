/** Eyewear-specific metadata — face shapes, fit, lens guidance for Palm Shades. */

export type FaceShape = "oval" | "round" | "square" | "heart" | "oblong";
export type FrameStyle =
  | "aviator"
  | "square"
  | "cat-eye"
  | "round"
  | "browline"
  | "butterfly"
  | "wayfarer"
  | "wrap"
  | "rimless"
  | "rectangle";
export type FrameUse = "sun" | "optical" | "work" | "events" | "sport" | "travel";

export type FrameMeta = {
  faceShapes: FaceShape[];
  frameStyle: FrameStyle;
  lensWidthMm: number;
  bridgeMm: number;
  templeMm: number;
  uvProtection: "UV400" | "UV380";
  polarized: boolean;
  bestFor: FrameUse[];
  fitNote: string;
};

const DEFAULT: FrameMeta = {
  faceShapes: ["oval", "square"],
  frameStyle: "rectangle",
  lensWidthMm: 52,
  bridgeMm: 18,
  templeMm: 140,
  uvProtection: "UV400",
  polarized: false,
  bestFor: ["sun", "optical"],
  fitNote: "Balanced proportions for everyday wear in Accra.",
};

export const frameMetaBySlug: Record<string, FrameMeta> = {
  "riviera-aviator-gold": {
    faceShapes: ["oval", "heart", "oblong"],
    frameStyle: "aviator",
    lensWidthMm: 58,
    bridgeMm: 14,
    templeMm: 145,
    uvProtection: "UV400",
    polarized: true,
    bestFor: ["sun", "travel", "events"],
    fitNote: "Teardrop lenses soften angular features; ideal for coastal drives and rooftop light.",
  },
  "osu-acetate-square": {
    faceShapes: ["round", "oval", "heart"],
    frameStyle: "square",
    lensWidthMm: 50,
    bridgeMm: 20,
    templeMm: 142,
    uvProtection: "UV400",
    polarized: false,
    bestFor: ["optical", "work"],
    fitNote: "Structured lines add definition to softer face shapes.",
  },
  "champagne-cat-eye": {
    faceShapes: ["round", "square", "oval"],
    frameStyle: "cat-eye",
    lensWidthMm: 54,
    bridgeMm: 17,
    templeMm: 140,
    uvProtection: "UV400",
    polarized: false,
    bestFor: ["sun", "events"],
    fitNote: "Lifted outer corners elongate round faces and add evening glamour.",
  },
  "palm-polarized-round": {
    faceShapes: ["square", "heart", "oblong"],
    frameStyle: "round",
    lensWidthMm: 48,
    bridgeMm: 19,
    templeMm: 138,
    uvProtection: "UV400",
    polarized: true,
    bestFor: ["sun", "travel"],
    fitNote: "Curved lenses balance strong jawlines and sharp cheekbones.",
  },
  "meridian-titanium-rimless": {
    faceShapes: ["oval", "oblong", "heart"],
    frameStyle: "rimless",
    lensWidthMm: 54,
    bridgeMm: 16,
    templeMm: 142,
    uvProtection: "UV400",
    polarized: false,
    bestFor: ["optical", "work"],
    fitNote: "Featherweight rimless profile — discreet for boardrooms and long screen days.",
  },
  "screen-shield-blue-light": {
    faceShapes: ["oval", "round", "square"],
    frameStyle: "rectangle",
    lensWidthMm: 53,
    bridgeMm: 18,
    templeMm: 140,
    uvProtection: "UV380",
    polarized: false,
    bestFor: ["work", "optical"],
    fitNote: "Blue-light filter for laptops and phones — built for Accra's remote-work crowd.",
  },
  "gradient-lens-pilot": {
    faceShapes: ["oval", "heart", "oblong"],
    frameStyle: "aviator",
    lensWidthMm: 59,
    bridgeMm: 14,
    templeMm: 146,
    uvProtection: "UV400",
    polarized: true,
    bestFor: ["sun", "travel", "events"],
    fitNote: "Gradient tint handles harsh midday sun then eases into golden hour.",
  },
  "executive-browline": {
    faceShapes: ["oval", "round", "heart"],
    frameStyle: "browline",
    lensWidthMm: 51,
    bridgeMm: 19,
    templeMm: 143,
    uvProtection: "UV400",
    polarized: false,
    bestFor: ["optical", "work", "events"],
    fitNote: "Bold upper rim draws the eye upward — polished and authoritative.",
  },
  "midnight-wayfarer": {
    faceShapes: ["oval", "oblong", "square"],
    frameStyle: "wayfarer",
    lensWidthMm: 52,
    bridgeMm: 18,
    templeMm: 145,
    uvProtection: "UV400",
    polarized: true,
    bestFor: ["sun", "travel", "events"],
    fitNote: "Iconic trapeze shape suits most faces — weekend-to-weeknight versatile.",
  },
  "tortoise-round-classic": {
    faceShapes: ["square", "heart", "oblong"],
    frameStyle: "round",
    lensWidthMm: 47,
    bridgeMm: 20,
    templeMm: 140,
    uvProtection: "UV400",
    polarized: false,
    bestFor: ["optical", "work"],
    fitNote: "Warm tortoise acetate softens angular features with intellectual charm.",
  },
  "sport-wrap-polarized": {
    faceShapes: ["oval", "oblong", "square"],
    frameStyle: "wrap",
    lensWidthMm: 62,
    bridgeMm: 15,
    templeMm: 128,
    uvProtection: "UV400",
    polarized: true,
    bestFor: ["sport", "sun", "travel"],
    fitNote: "Wrap coverage blocks side glare — courts, runs, and open-road days.",
  },
  "ivory-butterfly": {
    faceShapes: ["heart", "oval", "oblong"],
    frameStyle: "butterfly",
    lensWidthMm: 55,
    bridgeMm: 16,
    templeMm: 138,
    uvProtection: "UV400",
    polarized: false,
    bestFor: ["sun", "events"],
    fitNote: "Wide upper curve balances a narrow chin — statement sunwear.",
  },
  "collectors-limited-edition": {
    faceShapes: ["oval", "square", "heart"],
    frameStyle: "aviator",
    lensWidthMm: 57,
    bridgeMm: 15,
    templeMm: 144,
    uvProtection: "UV400",
    polarized: true,
    bestFor: ["sun", "events", "travel"],
    fitNote: "Numbered edition with premium mineral lenses — collector-grade finish.",
  },
  "reading-classic-horn": {
    faceShapes: ["oval", "round", "square"],
    frameStyle: "rectangle",
    lensWidthMm: 49,
    bridgeMm: 20,
    templeMm: 138,
    uvProtection: "UV380",
    polarized: false,
    bestFor: ["optical", "work"],
    fitNote: "Classic horn acetate for readers — comfortable narrow bridge fit.",
  },
};

export function getFrameMeta(slug: string): FrameMeta | null {
  return frameMetaBySlug[slug] ?? null;
}

export function getFrameMetaOrDefault(slug: string, categorySlug?: string): FrameMeta {
  const explicit = frameMetaBySlug[slug];
  if (explicit) return explicit;

  if (categorySlug === "sunglasses") {
    return { ...DEFAULT, polarized: true, bestFor: ["sun", "travel"] };
  }
  if (categorySlug === "blue-light") {
    return { ...DEFAULT, uvProtection: "UV380", bestFor: ["work", "optical"] };
  }
  if (categorySlug === "optical-frames") {
    return { ...DEFAULT, polarized: false, bestFor: ["optical", "work"] };
  }
  return DEFAULT;
}

export const faceShapeLabels: Record<FaceShape, string> = {
  oval: "Oval",
  round: "Round",
  square: "Square",
  heart: "Heart",
  oblong: "Oblong",
};

export const frameUseLabels: Record<FrameUse, string> = {
  sun: "Sun & outdoors",
  optical: "Prescription / optical",
  work: "Work & screens",
  events: "Events & evenings",
  sport: "Sport & active",
  travel: "Travel",
};

/** Accra-specific sun context for lens recommendations. */
export const accraSunContext = {
  city: "Accra",
  uvIndexPeak: "Very High (10–11) Mar–Oct",
  tip: "Polarized lenses cut road and glass glare on Oxford Street and Labadi afternoons.",
  seasons: [
    { period: "Dry season (Nov–Mar)", advice: "Gradient or dark polarized — intense midday sun." },
    { period: "Wet season (Apr–Oct)", advice: "Polarized with hydrophobic coating — clearer vision in humid haze." },
    { period: "Harmattan (Dec–Feb)", advice: "Sealed wrap or close-fit frames help with dust and dry air." },
  ],
} as const;
