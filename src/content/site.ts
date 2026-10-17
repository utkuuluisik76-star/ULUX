// Business facts shared by both languages. Fill these in first for every new client.
// Phone, WhatsApp and e-mail are edited by the client in the CMS (/admin → "Ayarlar").
import type { ImageSet, Locale } from './types';
import settings from '../../content/settings.json';

const digits = (value: string) => value.replace(/\D/g, '');

const required = (key: keyof typeof settings) => {
  const value = String(settings[key] ?? '').trim();
  if (!value) throw new Error(`[content] content/settings.json → ${key} is missing or empty. Fix it in /admin or in the JSON file.`);
  return value;
};

export const site = {
  /** the business name as written in running text and titles */
  name: 'ULUX',
  /** live address without trailing slash, e.g. 'https://example.com'. Leave empty until the domain
   *  exists: canonical, hreflang, social preview, sitemap and structured-data URLs are then left
   *  out rather than pointing somewhere wrong. */
  url: '',
  phone: { display: required('phone'), tel: `+${digits(required('phone'))}` },
  /** international format without + or spaces, as wa.me expects */
  whatsappNumber: digits(required('whatsapp')),
  email: (settings.email ?? '').trim() || null,
  /** schema.org type for structured data: LocalBusiness, Restaurant, Hotel, LodgingBusiness,
   *  RealEstateAgent, TravelAgency, BeautySalon, MedicalClinic, ProfessionalService, … */
  businessType: 'LocalBusiness',
  /** postal address for structured data; leave a field empty when unknown (it is then omitted) */
  address: { street: '', city: '', region: '', postalCode: '', country: 'TR' },
  /** theme colour of the browser UI on phones: same as --color-bg in globals.css */
  themeColor: '#ece6da',
};

export const localePath: Record<Locale, string> = { tr: '/', en: '/en/' };

export const whatsappHref = (message: string) => `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;

// Photos cut by scripts/images.mjs (each dictionary adds its own alt text). Keep in sync with that script.
type ImageBase = Omit<ImageSet, 'alt'>;
export const images = {
  hero: { name: 'hero', widths: [1280, 1920], portraitWidths: [640, 960], width: 1920, height: 1280 },
  about: { name: 'about', widths: [960, 1440], portraitWidths: [640], width: 1440, height: 1080 },
} satisfies Record<string, ImageBase>;
