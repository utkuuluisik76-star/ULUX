import type { Dictionary } from './types';
import { content } from './cms';

// Turkish dictionary. Values from `c` are edited in the CMS (/admin) and live in /content/*.json;
// everything written out here (navigation, buttons, labels) is fixed on purpose.
// [[...]] = yellow placeholder on the page: still to be filled in with real information
// (`npm run todo` lists them all).

const c = content('tr');

export const tr: Dictionary = {
  locale: 'tr',
  meta: c.meta,
  ui: {
    skipLink: 'İçeriğe geç',
    homeLabel: 'Ana sayfa',
    home: 'Ana sayfa',
    menuOpen: 'Menü',
    menuClose: 'Kapat',
    menuLabel: 'Ana menü',
    languageLabel: 'Dil',
    call: 'Ara',
    whatsapp: "WhatsApp'tan yazın",
    newTab: '(yeni sekmede açılır)',
    breadcrumbLabel: 'Konum',
    pagesLabel: 'Sayfalar',
    phoneLabel: 'Telefon',
    emailLabel: 'E-posta',
    addressLabel: 'Adres',
    copyright: 'Tüm hakları saklıdır.',
  },
  nav: [
    { id: 'hizmetler', label: 'Hizmetler' },
    { id: 'hakkimizda', label: 'Hakkımızda' },
    { id: 'sss', label: 'SSS' },
    { id: 'iletisim', label: 'İletişim' },
  ],
  cta: { label: "WHATSAPP'TAN YAZIN", whatsappMessage: c.ctaMessage },
  hero: c.hero,
  services: c.services,
  about: c.about,
  faq: c.faq,
  contact: c.contact,
  landing: c.landing,
};
