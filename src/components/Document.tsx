import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import type { Dictionary, Locale } from '@/content/types';
import { localePath, site } from '@/content/site';
import { landingPath, type LandingKey } from '@/content/landing';
import '@/app/globals.css';
import '@/app/ulux.css';

/**
 * Runs before first paint:
 * - removes the comments and whitespace-only text nodes a host may inject into <head> (Netlify
 *   adds both). React hydrates <head> too, and a foreign node there makes it throw away the
 *   server HTML and re-render the whole page. Our own markup has no comments in <head>.
 * - sets .motion on <html> unless reduced motion is requested. If the app has not booted after
 *   8 s (scripts blocked or failing), .motion is removed again: the static layout is the safe
 *   fallback. SmoothScroll restores it when the app does boot (restoreMotionClass).
 */
const bootScript = `(function(){for(var n=document.head.firstChild;n;){var x=n.nextSibling;if(n.nodeType===8||n.nodeType===3&&!n.data.trim())n.remove();n=x}var r=document.documentElement,m=matchMedia('(prefers-reduced-motion: reduce)'),s=function(){r.classList.toggle('motion',!m.matches)};s();m.addEventListener&&m.addEventListener('change',s);setTimeout(function(){if(!window.__appReady){r.classList.remove('motion');window.__appFallback=1}},8000)})();`;

/** Root document shared by the language layouts (each language has its own <html lang>). */
export function Document({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        {/* fonts used above the fold; the Turkish subset is needed in both languages for names */}
        <link rel="preload" href="/fonts/archivo-latin.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/archivo-tr.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/fraunces-subset.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body>{children}</body>
    </html>
  );
}

/** Title, description, canonical, hreflang and social preview for the homepage or a landing page. */
export function buildMetadata(dict: Dictionary, page?: { key: LandingKey }): Metadata {
  const landing = page && dict.landing[page.key];
  const path = page ? landingPath(page.key, dict.locale) : localePath[dict.locale];
  const languages = page
    ? { tr: landingPath(page.key, 'tr'), en: landingPath(page.key, 'en'), 'x-default': landingPath(page.key, 'tr') }
    : { tr: localePath.tr, en: localePath.en, 'x-default': localePath.tr };
  const title = landing?.metaTitle ?? dict.meta.title;
  const description = landing?.metaDescription ?? dict.meta.description;
  const ogTitle = landing?.metaTitle ?? dict.meta.ogTitle;
  // Absolute URLs (canonical, hreflang, social preview) only once the domain is known.
  const live = site.url ? { metadataBase: new URL(site.url), alternates: { canonical: path, languages } } : {};
  return {
    ...live,
    title,
    description,
    openGraph: {
      type: 'website',
      ...(site.url && { url: path, images: [{ url: `/og-${dict.locale}.jpg`, width: 1200, height: 630, alt: ogTitle }] }),
      siteName: site.name,
      locale: dict.locale === 'tr' ? 'tr_TR' : 'en_US',
      alternateLocale: dict.locale === 'tr' ? ['en_US'] : ['tr_TR'],
      title: ogTitle,
      description,
    },
    twitter: { card: 'summary_large_image' },
    icons: {
      icon: [
        { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon-48.png', sizes: '48x48', type: 'image/png' },
      ],
      apple: '/apple-touch-icon.png',
    },
  };
}

export const viewport = { themeColor: site.themeColor, width: 'device-width', initialScale: 1 };
