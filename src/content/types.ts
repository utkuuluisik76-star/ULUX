import type { LandingKey } from './landing';

export type Locale = 'tr' | 'en';

/** A responsive image set from scripts/images.mjs or scripts/cms-images.mjs. */
export type ImageSet = {
  /** file base name: /images/<name>-<width>.(avif|webp) */
  name: string;
  widths: number[];
  /** upright-phone crop: /images/<name>-portrait-<width>.(avif|webp) */
  portraitWidths?: number[];
  /** intrinsic size of the largest landscape file (prevents layout shift) */
  width: number;
  height: number;
  alt: string;
};

export type QA = { q: string; a: string };

export type TextBlock = { title: string; text: string };

/** One SEO landing page (src/content/landing.ts lists them). */
export type LandingContent = {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  sections: TextBlock[];
  faq: QA[];
};

export type Dictionary = {
  locale: Locale;
  meta: { title: string; description: string; ogTitle: string };
  /** fixed interface labels (not editable in the CMS) */
  ui: {
    skipLink: string;
    homeLabel: string;
    home: string;
    menuOpen: string;
    menuClose: string;
    menuLabel: string;
    languageLabel: string;
    call: string;
    whatsapp: string;
    newTab: string;
    breadcrumbLabel: string;
    pagesLabel: string;
    phoneLabel: string;
    emailLabel: string;
    addressLabel: string;
    copyright: string;
  };
  /** homepage sections in the menu, in page order */
  nav: { id: string; label: string }[];
  cta: { label: string; whatsappMessage: string };
  hero: { eyebrow: string; title: string; lead: string; image: ImageSet };
  services: { title: string; intro: string; items: TextBlock[] };
  about: { title: string; text: string; image: ImageSet };
  faq: { title: string; items: QA[] };
  contact: { title: string; text: string; address: string };
  landing: Record<LandingKey, LandingContent>;
};
