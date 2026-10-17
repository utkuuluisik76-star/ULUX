// SEO landing pages: one address per language, texts in content/pages/landing.json.
// To add a page: add a key + slugs here, the same key in landing.json (tr and en) and in
// public/admin/config.yml. The routes, sitemap, footer links and hreflang pick it up by themselves.
// A site without landing pages: delete src/app/(tr)/[landing] and src/app/(en)/en/[landing]
// (a static export cannot build a dynamic route with no pages).
import type { Locale } from './types';
import { localePath } from './site';

export const LANDING_KEYS = ['example'] as const;
export type LandingKey = (typeof LANDING_KEYS)[number];

/** Addresses are fixed once live: changing one needs a 301 in public/_redirects. */
export const landingSlugs: Record<LandingKey, Record<Locale, string>> = {
  example: { tr: 'ornek-sayfa', en: 'example-page' },
};

export const landingPath = (key: LandingKey, locale: Locale) => `${localePath[locale]}${landingSlugs[key][locale]}/`;

export const landingKeyFromSlug = (slug: string, locale: Locale) =>
  LANDING_KEYS.find((key) => landingSlugs[key][locale] === decodeURIComponent(slug));
