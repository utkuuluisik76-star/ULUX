'use client';
import { useRef, type ReactNode } from 'react';
import { finePointerQuery, useMotion } from '@/lib/motion/runtime';

/**
 * Pulls its child towards the cursor while hovered and springs back on leave.
 * Mouse/trackpad only, and off for reduced motion. `strength` is the share of the
 * cursor's offset from the centre that the element follows.
 */
export function Magnetic({ children, strength = 0.3, className = '' }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useMotion(({ gsap }) => {
    const el = ref.current;
    if (!el || !window.matchMedia(finePointerQuery).matches) return;
    const x = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const y = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * strength);
      y((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)', overwrite: true });
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  });

  return (
    <span ref={ref} className={`inline-block ${className}`}>
      {children}
    </span>
  );
}
