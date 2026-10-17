'use client';
// Motion runtime, loaded on demand.
//
// GSAP + ScrollTrigger are not part of the initial JavaScript: the page renders and becomes
// interactive first; the animation code arrives later in its own chunk. Scenes initialise only
// when the browser is idle and the scene is about one screen away, so their layout reads never
// compete with the first paint. All users share one lazily loaded instance.
import { useEffect } from 'react';
import type { gsap as GsapType } from 'gsap';
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger';

export type Motion = { gsap: typeof GsapType; ScrollTrigger: typeof ScrollTriggerType };

export const media = {
  desktop: '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
  mobile: '(max-width: 767.98px) and (prefers-reduced-motion: no-preference)',
};

/** Mouse/trackpad and motion allowed: smooth scroll, custom cursor, magnetic buttons. */
export const finePointerQuery = '(pointer: fine) and (hover: hover) and (prefers-reduced-motion: no-preference)';

let loading: Promise<Motion> | undefined;

/** Scroll scenes run only on the motion layout (.motion on <html>), never on the static one. */
export const motionLayout = () => document.documentElement.classList.contains('motion');

/**
 * Puts .motion back once the app has booted. React can drop the class the boot script set on
 * <html> (a hydration mismatch, e.g. from a translate extension, re-renders the root), and on a
 * very slow connection the boot failsafe may have fallen back to the static layout. Switching
 * back is only invisible while the visitor is still at the top, so after that the page stays static.
 */
export function restoreMotionClass() {
  const root = document.documentElement;
  if (root.classList.contains('motion') || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const fellBack = (window as Window & { __appFallback?: number }).__appFallback;
  if (fellBack && window.scrollY > window.innerHeight * 0.25) return;
  root.classList.add('motion');
}

/** True once something has asked for the motion runtime (it may still be downloading). */
export const motionRequested = () => loading !== undefined;

export function loadMotion(): Promise<Motion> {
  loading ??= Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
    gsap.registerPlugin(ScrollTrigger);
    // Mobile browsers resize the viewport when the address bar shows/hides; don't recalculate on that.
    ScrollTrigger.config({ ignoreMobileResize: true });
    return { gsap, ScrollTrigger };
  });
  return loading;
}

/** Resolves when the browser is idle (or after `timeout` ms at the latest). */
const whenIdle = (timeout = 2000) =>
  new Promise<void>((resolve) => {
    if ('requestIdleCallback' in window) window.requestIdleCallback(() => resolve(), { timeout });
    else setTimeout(resolve, 200);
  });

/**
 * Resolves on the visitor's first interaction (scroll, wheel, touch, pointer, key) or after
 * `fallback` ms. Decorative motion is only needed once someone moves; until then the page does
 * no animation work at all.
 */
let interacted: Promise<void> | undefined;
const whenInteracted = (fallback = 4000) => {
  interacted ??= new Promise<void>((resolve) => {
    const events = ['scroll', 'wheel', 'touchstart', 'pointerdown', 'pointermove', 'keydown'] as const;
    const done = () => {
      events.forEach((e) => window.removeEventListener(e, done));
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(done, fallback);
    events.forEach((e) => window.addEventListener(e, done, { once: true, passive: true }));
  });
  return interacted;
};

/** Resolves when `el` comes within one viewport of the screen; returns a disposer. */
const whenNear = (el: Element): [Promise<void>, () => void] => {
  let io: IntersectionObserver | undefined;
  const promise = new Promise<void>((resolve) => {
    io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io?.disconnect();
        resolve();
      },
      { rootMargin: '100% 0px' },
    );
    io.observe(el);
  });
  return [promise, () => io?.disconnect()];
};

type When = {
  /** wait until the element with this id is about one screen away */
  near?: string;
  /** 'interaction' (default): decorative, waits for the first scroll/touch/pointer.
   *  'idle': functional, runs at the first idle moment. */
  start?: 'interaction' | 'idle';
};

/**
 * Runs `setup` once the motion runtime has loaded and the `when` conditions are met.
 * Everything GSAP creates inside `setup` is reverted on unmount, plus any cleanup it returns.
 */
export function useMotion(setup: (motion: Motion) => void | (() => void), when: When = {}) {
  useEffect(() => {
    let cancelled = false;
    let revert: (() => void) | undefined;
    const target = when.near ? document.getElementById(when.near) : null;
    const [near, stopWatching] = target ? whenNear(target) : [Promise.resolve(), () => {}];

    near
      .then(() => (when.start === 'idle' ? undefined : whenInteracted()))
      .then(() => whenIdle())
      .then(() => loadMotion())
      .then((motion) => {
        if (cancelled) return;
        let cleanup: void | (() => void);
        const ctx = motion.gsap.context(() => {
          cleanup = setup(motion);
        });
        revert = () => {
          cleanup?.();
          ctx.revert();
        };
      });

    return () => {
      cancelled = true;
      stopWatching();
      revert?.();
    };
    // setup is defined inline by the caller and intentionally runs once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export type SceneContext = Motion & {
  isDesktop: boolean;
  scope: HTMLElement;
  q: (selector: string) => HTMLElement[];
};

/**
 * A scene's scroll animation for the current device class, scoped to the element with `id`
 * and set up after the first interaction, once that element comes near. Nothing runs for prefers-reduced-motion
 * or on the static fallback layout: the scene keeps its static CSS. Rebuilt on breakpoint change, reverted on unmount.
 */
export function useScene(id: string, setup: (ctx: SceneContext) => void | (() => void)) {
  useMotion((motion) => {
    const scope = document.getElementById(id);
    if (!scope || !motionLayout()) return;
    const q = motion.gsap.utils.selector(scope) as (selector: string) => HTMLElement[];
    const mm = motion.gsap.matchMedia();
    mm.add(media, (context) => {
      const { desktop, mobile } = context.conditions as { desktop: boolean; mobile: boolean };
      if (!desktop && !mobile) return undefined;
      return setup({ ...motion, isDesktop: desktop, scope, q });
    });
    return () => mm.revert();
  }, { near: id });
}
