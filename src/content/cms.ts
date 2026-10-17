// Content the client edits in Decap CMS (/admin), read from the JSON files in /content at build time.
//
// Each page file holds both languages: { "tr": {...}, "en": {...} }. Fields that are the same in
// both languages (WhatsApp messages, photos, links) are always read from "tr", so the two
// languages can never disagree about them.
//
// Every value is checked here. A missing or empty required field stops the build with a message
// naming the file and field. Cloudflare then keeps the previous version online, so a bad edit can
// never break the live site.
import type { ImageSet, Locale } from './types';
import { images } from './site';
import { LANDING_KEYS, type LandingKey } from './landing';
import seoJson from '../../content/pages/seo.json';
import homeJson from '../../content/pages/home.json';
import faqJson from '../../content/pages/faq.json';
import landingJson from '../../content/pages/landing.json';
// Written by scripts/cms-images.mjs (runs before dev and build): responsive versions of uploaded photos.
import uploadedImages from './generated/cms-images.json';

type Json = Record<string, unknown>;

/** Reads typed values from one JSON object and reports the exact field when something is wrong. */
export class Reader {
  constructor(
    private readonly data: Json,
    private readonly where: string,
  ) {}

  /** "content/pages/faq.json → en.items[2].a" */
  private at(key: string) {
    return this.where.endsWith('→') ? `${this.where} ${key}` : `${this.where}.${key}`;
  }

  private fail(key: string, problem: string): never {
    throw new Error(`[content] ${this.at(key)} ${problem}. Fix it in /admin or in the JSON file.`);
  }

  /** a required, non-empty string */
  text(key: string): string {
    const value = this.data[key];
    if (typeof value !== 'string' || value.trim() === '') this.fail(key, 'is missing or empty');
    // returned as typed: a WhatsApp message may end in a space on purpose
    return value;
  }

  /** an optional string: '' when absent */
  optional(key: string): string {
    const value = this.data[key];
    if (value === undefined || value === null) return '';
    if (typeof value !== 'string') this.fail(key, 'must be text');
    return value.trim() === '' ? '' : value;
  }

  /** a positive number (prices) */
  amount(key: string): number {
    const value = this.data[key];
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) this.fail(key, 'must be a number above 0');
    return value;
  }

  /** a yes/no switch: false when absent */
  flag(key: string): boolean {
    const value = this.data[key];
    if (value === undefined || value === null) return false;
    if (typeof value !== 'boolean') this.fail(key, 'must be true or false');
    return value;
  }

  /** a non-empty list of non-empty strings */
  list(key: string): string[] {
    const value = this.data[key];
    if (!Array.isArray(value) || value.length === 0) this.fail(key, 'needs at least one line');
    return value.map((item, i) => {
      if (typeof item !== 'string' || item.trim() === '') this.fail(`${key}[${i}]`, 'is empty');
      return item;
    });
  }

  /** a nested object */
  object(key: string): Reader {
    const value = this.data[key];
    if (typeof value !== 'object' || value === null || Array.isArray(value)) this.fail(key, 'is missing');
    return new Reader(value as Json, this.at(key));
  }

  /** a non-empty list of objects */
  objects(key: string): Reader[] {
    const value = this.data[key];
    if (!Array.isArray(value) || value.length === 0) this.fail(key, 'needs at least one item');
    return value.map((item, i) => {
      if (typeof item !== 'object' || item === null) this.fail(`${key}[${i}]`, 'is not an item');
      return new Reader(item as Json, this.at(`${key}[${i}]`));
    });
  }
}

/** The two language versions of one page file. Shared values come from `shared` (always Turkish). */
const page = (file: string, json: unknown, locale: Locale) => {
  const root = new Reader(json as Json, `content/pages/${file} →`);
  return { local: root.object(locale), shared: root.object('tr') };
};

// ---------- Photos ----------

export const FOCUS = ['center', 'top', 'bottom', 'left', 'right'] as const;
type Focus = (typeof FOCUS)[number];

const presetByName = new Map(Object.values(images).map((set) => [set.name, set]));
const PRESET = /^\/images\/([a-z0-9-]+)-\d+\.(?:webp|avif|jpg)$/;
const uploaded = uploadedImages as Record<string, Omit<ImageSet, 'alt'>>;

/**
 * A photo field: either one of the hand-cropped photos from scripts/images.mjs (/images/…) or an
 * upload from the CMS (/uploads/…), which scripts/cms-images.mjs has turned into AVIF/WebP in every size.
 */
const photo = (image: Reader, alt: string): ImageSet => {
  const src = image.text('src');
  const preset = PRESET.exec(src);
  if (preset) {
    const set = presetByName.get(preset[1]);
    if (set) return { ...set, alt };
  }
  const focus = (image.optional('focus') || 'center') as Focus;
  const set = uploaded[`${src}|${focus}`];
  if (!set) throw new Error(`[content] photo ${src} has no generated sizes. Run "npm run cms-images" (it runs automatically before dev and build).`);
  return { ...set, alt };
};

// ---------- Helpers ----------

/** 15000 → "15.000 TL" (Turkish) / "15,000 TL" (English); a starting price → "15.000 TL'den" / "From 15,000 TL" */
export const formatPrice = (amount: number, locale: Locale, from = false) => {
  const value = `${new Intl.NumberFormat(locale === 'tr' ? 'tr-TR' : 'en-US').format(amount)} TL`;
  if (!from) return value;
  return locale === 'tr' ? `${value}'den` : `From ${value}`;
};

/** "{year}" in titles becomes the year of the build, so "… 2026" never goes stale. */
const withYear = (text: string) => text.replaceAll('{year}', String(new Date().getFullYear()));

const qa = (reader: Reader, key: string) => reader.objects(key).map((item) => ({ q: item.text('q'), a: item.text('a') }));
const blocks = (reader: Reader, key: string) => reader.objects(key).map((item) => ({ title: item.text('title'), text: item.text('text') }));

// ---------- Pages ----------

/** Everything editable for one language, shaped for the dictionaries in tr.ts / en.ts. */
export function content(locale: Locale) {
  const seo = page('seo.json', seoJson, locale).local;
  const home = page('home.json', homeJson, locale);
  const hero = home.local.object('hero');
  const services = home.local.object('services');
  const about = home.local.object('about');
  const contact = home.local.object('contact');
  const faq = page('faq.json', faqJson, locale).local;
  const landing = page('landing.json', landingJson, locale);

  const landingPage = (key: LandingKey) => {
    const local = landing.local.object(key);
    return {
      metaTitle: withYear(local.text('metaTitle')),
      metaDescription: local.text('metaDescription'),
      h1: withYear(local.text('h1')),
      intro: local.text('intro'),
      sections: blocks(local, 'sections'),
      faq: qa(local, 'faq'),
    };
  };

  return {
    meta: { title: withYear(seo.text('title')), description: seo.text('description'), ogTitle: seo.text('ogTitle') },
    ctaMessage: home.shared.text('ctaMessage'),
    hero: {
      eyebrow: hero.text('eyebrow'),
      title: hero.text('title'),
      lead: hero.text('lead'),
      image: photo(home.shared.object('hero').object('image'), hero.text('alt')),
    },
    services: { title: services.text('title'), intro: services.text('intro'), items: blocks(services, 'items') },
    about: {
      title: about.text('title'),
      text: about.text('text'),
      image: photo(home.shared.object('about').object('image'), about.text('alt')),
    },
    contact: { title: contact.text('title'), text: contact.text('text'), address: contact.optional('address') },
    faq: { title: faq.text('title'), items: qa(faq, 'items') },
    landing: Object.fromEntries(LANDING_KEYS.map((key) => [key, landingPage(key)])) as Record<LandingKey, ReturnType<typeof landingPage>>,
  };
}
