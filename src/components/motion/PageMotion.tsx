'use client';
import { media, motionLayout, useMotion } from '@/lib/motion/runtime';

/**
 * The page's decorative motion, loaded after the first interaction (src/lib/motion/runtime.ts):
 * - [data-reveal]: fades and rises into view, only for elements still below the fold, so nothing
 *   the visitor already sees ever blinks.
 * - [data-parallax]: the hero photo drifts slower than the page (desktop only).
 * Only transform and opacity are animated. Nothing runs on the static layout or for reduced motion.
 * Per-client scroll stories go in their own scene files (useScene with a sticky stage).
 */
export function PageMotion() {
  useMotion(({ gsap }) => {
    if (!motionLayout()) return undefined;
    const mm = gsap.matchMedia();
    mm.add(media, (context) => {
      const { desktop, mobile } = context.conditions as { desktop: boolean; mobile: boolean };
      if (!desktop && !mobile) return;

      gsap.utils
        .toArray<HTMLElement>('[data-reveal]')
        .filter((el) => el.getBoundingClientRect().top > window.innerHeight)
        .forEach((el) => {
          gsap.from(el, { y: 32, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
        });

      if (desktop) {
        gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((layer) => {
          gsap.to(layer, { yPercent: 12, ease: 'none', scrollTrigger: { trigger: layer.parentElement, start: 'top top', end: 'bottom top', scrub: true } });
        });
      }
    });
    return () => mm.revert();
  });

  return null;
}
