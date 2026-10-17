import type { Dictionary } from '@/content/types';
import { whatsappHref } from '@/content/site';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';
import { ImagePreload } from '@/components/layout/ImagePreload';
import { Button } from '@/components/ui/Button';
import { Rich } from '@/components/ui/Rich';

/**
 * Opening screen: art-directed photo (portrait crop on phones) with a deliberate shade under the
 * text, the page's only H1 and the primary action. The photo is the LCP element: preloaded, eager.
 */
export function Hero({ dict }: { dict: Dictionary }) {
  const { hero } = dict;
  return (
    <section id="giris" aria-labelledby="hero-title" className="relative isolate flex min-h-[100svh] items-end overflow-hidden pt-(--header) text-white">
      <ImagePreload image={hero.image} />
      <div data-parallax className="absolute inset-0 -z-10">
        <ResponsiveImage image={hero.image} priority className="block size-full" imgClassName="size-full object-cover" />
      </div>
      {/* shade: keeps the text above 4.5:1 on any photo */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(0_0_0/0.72)_0%,rgb(0_0_0/0.35)_45%,rgb(0_0_0/0.1)_100%)]" />
      <div className="w-full px-(--gutter) pt-24 pb-28 lg:pb-20">
        <p className="eyebrow">
          <Rich text={hero.eyebrow} />
        </p>
        <h1 id="hero-title" className="display mt-5 max-w-[16ch] text-[clamp(2.75rem,8.5vw,7.5rem)]">
          <Rich text={hero.title} />
        </h1>
        <p className="mt-6 max-w-[46ch] text-[clamp(1.0625rem,1.6vw,1.25rem)] text-white/90">
          <Rich text={hero.lead} />
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Button href={whatsappHref(dict.cta.whatsappMessage)} external newTabLabel={dict.ui.newTab} variant="light" magnetic>
            {dict.cta.label}
          </Button>
          <a href={`#${dict.nav[0].id}`} className="inline-flex min-h-11 items-center underline decoration-white/50 underline-offset-4 hover:decoration-white">
            {dict.nav[0].label}
          </a>
        </div>
      </div>
    </section>
  );
}
