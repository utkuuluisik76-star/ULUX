import type { Dictionary } from '@/content/types';
import { localePath, whatsappHref } from '@/content/site';
import { landingPath, type LandingKey } from '@/content/landing';
import { jsonLd, landingStructuredData } from '@/lib/structuredData';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomBar } from '@/components/layout/BottomBar';
import { SmoothScroll } from '@/components/motion/SmoothScroll';
import { PageMotion } from '@/components/motion/PageMotion';
import { Button } from '@/components/ui/Button';
import { Rich } from '@/components/ui/Rich';
import { Faq } from '@/components/sections/Faq';
import { Contact } from '@/components/sections/Contact';

/**
 * An SEO landing page: answers one search question (H1 = the search term), then leads to the
 * primary action. Same header, footer and bottom bar as the homepage; the language switch points
 * at this page's translation.
 */
export function LandingPage({ dict, pageKey }: { dict: Dictionary; pageKey: LandingKey }) {
  const page = dict.landing[pageKey];
  const home = localePath[dict.locale];
  const cta = whatsappHref(dict.cta.whatsappMessage);
  const langHrefs = { tr: landingPath(pageKey, 'tr'), en: landingPath(pageKey, 'en') };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(landingStructuredData(dict, pageKey))} />
      <SmoothScroll />
      <PageMotion />
      <Header locale={dict.locale} ui={dict.ui} nav={dict.nav} ctaLabel={dict.cta.label} ctaHref={cta} homeHref={home} navBase={home} langHrefs={langHrefs} />
      <main id="icerik" className="pt-(--header)">
        <section aria-labelledby="page-title" className="px-(--gutter) pt-10 pb-20 md:pb-28">
          <nav aria-label={dict.ui.breadcrumbLabel} className="text-sm text-mute">
            <ol role="list" className="flex flex-wrap items-center gap-x-2">
              <li>
                <a href={home} className="inline-flex min-h-11 items-center hover:text-ink">
                  {dict.ui.home}
                </a>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-ink">
                <Rich text={page.h1} />
              </li>
            </ol>
          </nav>
          <h1 id="page-title" className="display mt-12 max-w-[18ch] text-[clamp(2.5rem,7vw,6rem)]">
            <Rich text={page.h1} />
          </h1>
          <p className="mt-6 max-w-[52ch] text-[clamp(1.0625rem,1.6vw,1.25rem)]">
            <Rich text={page.intro} />
          </p>
          <Button href={cta} external newTabLabel={dict.ui.newTab} className="mt-9">
            {dict.cta.label}
          </Button>
        </section>

        <div className="border-t border-line px-(--gutter) py-20 md:py-28">
          {page.sections.map((section, i) => (
            <section key={section.title} data-reveal aria-labelledby={`section-${i}`} className="grid gap-4 border-b border-line py-10 first:pt-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] md:gap-12">
              <h2 id={`section-${i}`} className="text-[clamp(1.5rem,2.6vw,2.25rem)] font-bold leading-tight tracking-[-0.015em]">
                <Rich text={section.title} />
              </h2>
              <p className="max-w-[60ch] text-mute">
                <Rich text={section.text} />
              </p>
            </section>
          ))}
        </div>

        <Faq id="sss" title={dict.faq.title} items={page.faq} />
        <Contact dict={dict} />
      </main>
      <Footer dict={dict} langHrefs={langHrefs} />
      <BottomBar callLabel={dict.ui.call} ctaLabel={dict.cta.label} ctaHref={cta} newTabLabel={dict.ui.newTab} />
    </>
  );
}
