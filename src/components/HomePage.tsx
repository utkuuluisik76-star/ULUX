import type { Dictionary } from '@/content/types';
import { localePath, whatsappHref } from '@/content/site';
import { jsonLd, structuredData } from '@/lib/structuredData';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomBar } from '@/components/layout/BottomBar';
import { SmoothScroll } from '@/components/motion/SmoothScroll';
import { PageMotion } from '@/components/motion/PageMotion';
import { Hero } from '@/components/sections/Hero';
import { Services } from '@/components/sections/Services';
import { About } from '@/components/sections/About';
import { Faq } from '@/components/sections/Faq';
import { Contact } from '@/components/sections/Contact';

/**
 * The homepage. The sections in components/sections are a neutral skeleton: rebuild them per
 * client around the business goal and the primary action (they are not a design to reuse as-is).
 */
export function HomePage({ dict }: { dict: Dictionary }) {
  const cta = whatsappHref(dict.cta.whatsappMessage);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structuredData(dict))} />
      <SmoothScroll />
      <PageMotion />
      <Header locale={dict.locale} ui={dict.ui} nav={dict.nav} ctaLabel={dict.cta.label} ctaHref={cta} homeHref={localePath[dict.locale]} />
      <main id="icerik">
        <Hero dict={dict} />
        <Services dict={dict} />
        <About dict={dict} />
        <Faq title={dict.faq.title} items={dict.faq.items} />
        <Contact dict={dict} />
      </main>
      <Footer dict={dict} />
      <BottomBar callLabel={dict.ui.call} ctaLabel={dict.cta.label} ctaHref={cta} newTabLabel={dict.ui.newTab} />
    </>
  );
}
