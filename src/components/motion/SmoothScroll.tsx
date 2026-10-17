'use client';
import { useEffect } from 'react';
import type Lenis from 'lenis';
import { finePointerQuery, loadMotion, motionRequested, restoreMotionClass } from '@/lib/motion/runtime';

/**
 * Lenis smooth scrolling for mouse and trackpad users only, loaded on demand: phones and
 * reduced-motion visitors never download it and keep native scrolling.
 * Also marks the app as booted, which cancels the static-layout failsafe in the boot script,
 * and makes sure the motion layout is on (restoreMotionClass).
 */
export function SmoothScroll() {
  useEffect(() => {
    (window as Window & { __appReady?: boolean }).__appReady = true;
    restoreMotionClass();

    const mq = window.matchMedia(finePointerQuery);
    let lenis: Lenis | null = null;
    let stopTicker: (() => void) | undefined;
    let disposed = false;

    const start = async () => {
      if (lenis) return;
      const [{ default: LenisClass }, { gsap, ScrollTrigger }] = await Promise.all([import('lenis'), loadMotion()]);
      if (disposed || lenis || !mq.matches) return;
      lenis = new LenisClass({ lerp: 0.1, anchors: true, autoRaf: false });
      lenis.on('scroll', ScrollTrigger.update);
      const tick = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      stopTicker = () => gsap.ticker.remove(tick);
    };
    const stop = () => {
      stopTicker?.();
      lenis?.destroy();
      lenis = null;
    };
    const sync = () => (mq.matches ? start() : stop());

    sync();
    mq.addEventListener('change', sync);
    // Fonts change line heights, and with them every trigger position — but don't pull in the
    // motion runtime just for that: only refresh if it is already on its way.
    document.fonts?.ready.then(() => {
      if (motionRequested()) loadMotion().then(({ ScrollTrigger }) => ScrollTrigger.refresh());
    });
    return () => {
      disposed = true;
      mq.removeEventListener('change', sync);
      stop();
    };
  }, []);

  return null;
}
