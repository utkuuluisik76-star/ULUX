'use client';

import { useScene } from '@/lib/motion/runtime';

export function UluxMotion() {
  useScene('cap-detail', ({ gsap, scope, q, isDesktop }) => {
    const timeline = gsap.timeline({
      scrollTrigger: { trigger: scope, start: 'top top', end: 'bottom bottom', scrub: true },
    });
    timeline.fromTo(q('.detail-photo'), { scale: 1.03 }, { scale: isDesktop ? 1.22 : 1.12, ease: 'none' }, 0);
    timeline.fromTo(q('.detail-copy'), { y: 24 }, { y: -20, ease: 'none' }, 0);
    return () => { timeline.scrollTrigger?.kill(); };
  });
  return null;
}
