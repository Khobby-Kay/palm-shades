import { homeHero, homeSections } from '@/lib/data/homepage';
import { heroSlides, type HeroSlide } from '@/lib/media';
import { brandAssets } from '@/lib/brand-assets';
import { supabaseAdmin } from '@/lib/tiwa/supabase-admin';

export const SETTING_KEYS = {
  homepage: 'homepage',
  flashSale: 'flash_sale',
  loyalty: 'loyalty_program',
  pwa: 'pwa_settings',
} as const;

export type HomepageSettings = {
  heroEyebrow: string;
  heroHeading: string;
  heroHighlight: string;
  heroSubhead: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  trustTitle: string;
  trustIntro: string;
  shopCtaTitle: string;
  shopCtaDescription: string;
};

export type FlashSaleSettings = {
  active: boolean;
  title: string;
  subtitle: string;
  discountLabel: string;
  endsAt: string;
  ctaLabel: string;
  ctaHref: string;
};

export type LoyaltySettings = {
  active: boolean;
  programName: string;
  pointsPerCedi: number;
  welcomeBonus: number;
  description: string;
};

export type PwaSettings = {
  showInstallPrompt: boolean;
  promptTitle: string;
  promptBody: string;
  themeColor: string;
};

export const defaultHomepageSettings = (): HomepageSettings => ({
  heroEyebrow: heroSlides[0].eyebrow ?? homeHero.eyebrow,
  heroHeading: heroSlides[0].heading,
  heroHighlight: heroSlides[0].highlight,
  heroSubhead: heroSlides[0].subhead,
  primaryCtaLabel: heroSlides[0].primaryCta.label,
  primaryCtaHref: heroSlides[0].primaryCta.href,
  secondaryCtaLabel: heroSlides[0].secondaryCta?.label ?? homeHero.secondaryCta.label,
  secondaryCtaHref: heroSlides[0].secondaryCta?.href ?? homeHero.secondaryCta.href,
  trustTitle: homeSections.trust.title,
  trustIntro: homeSections.trust.intro,
  shopCtaTitle: homeSections.shopCta.title,
  shopCtaDescription: homeSections.shopCta.description,
});

export const defaultFlashSaleSettings = (): FlashSaleSettings => ({
  active: false,
  title: 'Flash Sale',
  subtitle: 'Limited-time offers on boutique favourites',
  discountLabel: 'Up to 20% off',
  endsAt: '',
  ctaLabel: 'Shop the sale',
  ctaHref: '/shop',
});

export const defaultLoyaltySettings = (): LoyaltySettings => ({
  active: false,
  programName: 'Palm Shades Rewards',
  pointsPerCedi: 1,
  welcomeBonus: 50,
  description: 'Earn points on every order and redeem them for discounts.',
});

export const defaultPwaSettings = (): PwaSettings => ({
  showInstallPrompt: true,
  promptTitle: 'Add Palm Shades to your home screen',
  promptBody:
    'Install the app for faster loading and one-tap access to shop and book.',
  themeColor: brandAssets.colors.pink,
});

async function readSetting<T>(key: string): Promise<T | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();
    if (error || !data?.value) return null;
    return data.value as T;
  } catch {
    return null;
  }
}

export async function getHomepageSettings(): Promise<HomepageSettings> {
  const enabled = await isStoreModuleEnabled('homepage');
  if (!enabled) return defaultHomepageSettings();
  const stored = await readSetting<Partial<HomepageSettings>>(SETTING_KEYS.homepage);
  return { ...defaultHomepageSettings(), ...stored };
}

export async function getHeroSlidesWithConfig(): Promise<HeroSlide[]> {
  const cfg = await getHomepageSettings();
  const slides = [...heroSlides];
  slides[0] = {
    ...slides[0],
    eyebrow: cfg.heroEyebrow,
    heading: cfg.heroHeading,
    highlight: cfg.heroHighlight,
    subhead: cfg.heroSubhead,
    primaryCta: { label: cfg.primaryCtaLabel, href: cfg.primaryCtaHref },
    secondaryCta: { label: cfg.secondaryCtaLabel, href: cfg.secondaryCtaHref },
  };
  return slides;
}

export async function getFlashSaleSettings(): Promise<FlashSaleSettings> {
  const stored = await readSetting<Partial<FlashSaleSettings>>(SETTING_KEYS.flashSale);
  return { ...defaultFlashSaleSettings(), ...stored };
}

export async function getActiveFlashSale(): Promise<FlashSaleSettings | null> {
  const sale = await getFlashSaleSettings();
  if (!sale.active) return null;
  if (sale.endsAt && new Date(sale.endsAt) < new Date()) return null;
  return sale;
}

export async function getLoyaltySettings(): Promise<LoyaltySettings> {
  const stored = await readSetting<Partial<LoyaltySettings>>(SETTING_KEYS.loyalty);
  return { ...defaultLoyaltySettings(), ...stored };
}

export async function getPwaSettings(): Promise<PwaSettings> {
  const stored = await readSetting<Partial<PwaSettings>>(SETTING_KEYS.pwa);
  return {
    ...defaultPwaSettings(),
    ...stored,
    showInstallPrompt: stored?.showInstallPrompt ?? true,
  };
}

export async function isStoreModuleEnabled(moduleId: string): Promise<boolean> {
  try {
    const { data } = await supabaseAdmin
      .from('store_modules')
      .select('enabled')
      .eq('id', moduleId)
      .maybeSingle();
    return !!data?.enabled;
  } catch {
    return false;
  }
}

export async function isLoyaltyLive(): Promise<boolean> {
  const [moduleOn, settings] = await Promise.all([
    isStoreModuleEnabled('loyalty-program'),
    getLoyaltySettings(),
  ]);
  return moduleOn && settings.active;
}

export async function isFlashSaleLive(): Promise<boolean> {
  const [moduleOn, sale] = await Promise.all([
    isStoreModuleEnabled('flash-sales'),
    getActiveFlashSale(),
  ]);
  return moduleOn && !!sale;
}
