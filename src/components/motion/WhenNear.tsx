'use client';
import { useEffect } from 'react';

/**
 * Adds `className` to the element with `targetId` once it comes within `margin` of the viewport.
 * Used to start loading CSS background images (which browsers can't lazy-load) only when needed.
 */
export function WhenNear({ targetId, className = 'is-near', margin = '800px' }: { targetId: string; className?: string; margin?: string }) {
  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.add(className);
        io.disconnect();
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [targetId, className, margin]);

  return null;
}
