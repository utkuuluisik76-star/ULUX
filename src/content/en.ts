import type { Dictionary } from './types';
import { content } from './cms';

// English dictionary. Values from `c` are edited in the CMS (/admin) and live in /content/*.json;
// everything written out here (navigation, buttons, labels) is fixed on purpose.
// Section ids stay Turkish so anchors are the same in both languages.
// WhatsApp messages are Turkish on purpose: they land in the business's own WhatsApp.

const c = content('en');

export const en: Dictionary = {
  locale: 'en',
  meta: c.meta,
  ui: {
    skipLink: 'Skip to content',
    homeLabel: 'Home',
    home: 'Home',
    menuOpen: 'Menu',
    menuClose: 'Close',
    menuLabel: 'Main menu',
    languageLabel: 'Language',
    call: 'Call',
    whatsapp: 'Message on WhatsApp',
    newTab: '(opens in a new tab)',
    breadcrumbLabel: 'Breadcrumb',
    pagesLabel: 'Pages',
    phoneLabel: 'Phone',
    emailLabel: 'E-mail',
    addressLabel: 'Address',
    copyright: 'All rights reserved.',
  },
  nav: [
    { id: 'hizmetler', label: 'Services' },
    { id: 'hakkimizda', label: 'About' },
    { id: 'sss', label: 'FAQ' },
    { id: 'iletisim', label: 'Contact' },
  ],
  cta: { label: 'MESSAGE ON WHATSAPP', whatsappMessage: c.ctaMessage },
  hero: c.hero,
  services: c.services,
  about: c.about,
  faq: c.faq,
  contact: c.contact,
  landing: c.landing,
};
