// schema.org data for search engines and AI assistants: who the business is, how to reach it and
// the answers to the FAQ. Built from the same content as the page, so the two can never disagree.
// Absolute URLs are only added once site.url (the domain) is known; fields that are still a
// [[placeholder]] or empty are left out instead of publishing something untrue.
import type { Dictionary, QA } from '@/content/types';
import { localePath, site } from '@/content/site';
import { landingPath, type LandingKey } from '@/content/landing';

const isPlaceholder = (text: string) => /\[\[.+?\]\]/.test(text);
const id = (fragment: string) => (site.url ? `${site.url}/#${fragment}` : undefined);
const absolute = (path: string) => (site.url ? `${site.url}${path}` : undefined);

const faqPage = (items: QA[], locale: string) => {
  const answered = items.filter((item) => !isPlaceholder(item.q) && !isPlaceholder(item.a));
  return answered.length
    ? {
        '@type': 'FAQPage',
        inLanguage: locale,
        mainEntity: answered.map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })),
      }
    : undefined;
};

const business = (dict: Dictionary) => {
  const { street, city, region, postalCode, country } = site.address;
  const address = Object.fromEntries(
    Object.entries({ streetAddress: street, addressLocality: city, addressRegion: region, postalCode, addressCountry: country }).filter(([, v]) => v),
  );
  return {
    '@type': site.businessType,
    ...(id('business') && { '@id': id('business') }),
    name: site.name,
    ...(!isPlaceholder(dict.meta.description) && { description: dict.meta.description }),
    ...(site.url && { url: absolute(localePath[dict.locale]), image: absolute(`/og-${dict.locale}.jpg`) }),
    telephone: site.phone.tel,
    ...(site.email && { email: site.email }),
    address: { '@type': 'PostalAddress', ...address },
    knowsLanguage: ['tr', 'en'],
  };
};

/** Homepage: the business, the website and the FAQ. */
export function structuredData(dict: Dictionary) {
  const website = {
    '@type': 'WebSite',
    name: site.name,
    inLanguage: dict.locale,
    ...(site.url && { url: absolute(localePath[dict.locale]), publisher: { '@id': id('business') } }),
  };
  return { '@context': 'https://schema.org', '@graph': [business(dict), website, faqPage(dict.faq.items, dict.locale)].filter(Boolean) };
}

/** Landing page: breadcrumb, the page itself (about the business) and its own FAQ. */
export function landingStructuredData(dict: Dictionary, key: LandingKey) {
  const page = dict.landing[key];
  const pageUrl = absolute(landingPath(key, dict.locale));
  const breadcrumb = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: dict.ui.home, ...(site.url && { item: absolute(localePath[dict.locale]) }) },
      { '@type': 'ListItem', position: 2, name: page.h1, ...(pageUrl && { item: pageUrl }) },
    ],
  };
  const webPage = {
    '@type': 'WebPage',
    name: page.metaTitle,
    description: page.metaDescription,
    inLanguage: dict.locale,
    ...(pageUrl && { url: pageUrl }),
    about: id('business') ? { '@id': id('business') } : business(dict),
  };
  return { '@context': 'https://schema.org', '@graph': [webPage, breadcrumb, faqPage(page.faq, dict.locale)].filter(Boolean) };
}

/** <script type="application/ld+json"> content; "<" is escaped so text can never close the tag. */
export const jsonLd = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, '\\u003c') });
