'use client';
import { useEffect, useRef, useState } from 'react';
import type { Dictionary, Locale } from '@/content/types';
import { site } from '@/content/site';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { LangSwitch } from '@/components/ui/LangSwitch';

type Props = {
  locale: Locale;
  ui: Dictionary['ui'];
  nav: Dictionary['nav'];
  ctaLabel: string;
  ctaHref: string;
  homeHref: string;
  /** '' on the homepage (links are #anchors), the homepage path elsewhere */
  navBase?: string;
  langHrefs?: Record<Locale, string>;
};

/**
 * Fixed header. Desktop: menu, language and the primary CTA inline. Phones and tablets: a menu
 * button that opens a full-screen menu (the CTA lives in the bottom bar there).
 */
export function Header({ locale, ui, nav, ctaLabel, ctaHref, homeHref, navBase = '', langHrefs }: Props) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Menu: Escape closes, focus moves in and back, the page can't scroll behind it.
  useEffect(() => {
    if (!open) return undefined;
    const root = document.documentElement;
    root.classList.add('overflow-hidden');
    menuRef.current?.querySelector('a')?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    const toggle = toggleRef.current;
    return () => {
      root.classList.remove('overflow-hidden');
      window.removeEventListener('keydown', onKey);
      toggle?.focus();
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <a href="#icerik" className="skip-link">
        {ui.skipLink}
      </a>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-bg/95 backdrop-blur-md">
        <div className="flex h-(--header) items-center gap-6 px-(--gutter)">
          <a href={homeHref} aria-label={ui.homeLabel} className="mr-auto inline-flex min-h-11 shrink-0 items-center">
            <Logo />
          </a>
          <nav aria-label={ui.menuLabel} className="hidden lg:block">
            <ul role="list" className="flex gap-7 text-sm">
              {nav.map((item) => (
                <li key={item.id}>
                  <a href={`${navBase}#${item.id}`} className="inline-flex min-h-11 items-center text-mute transition-colors hover:text-ink">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <LangSwitch current={locale} label={ui.languageLabel} hrefs={langHrefs} />
          {/* max-lg:hidden! because the Button's own inline-flex would beat a plain `hidden` */}
          <Button href={ctaHref} external newTabLabel={ui.newTab} className="min-h-11! px-5! max-lg:hidden!">
            {ctaLabel}
          </Button>
          <button
            ref={toggleRef}
            type="button"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((v) => !v)}
            className="eyebrow -mr-2 inline-flex min-h-11 items-center gap-3 px-2 lg:hidden"
          >
            {open ? ui.menuClose : ui.menuOpen}
            <span aria-hidden="true" className={`block h-2 w-5 border-y-[1.5px] border-current transition-[height] duration-300 ${open ? 'h-0! border-b-0' : ''}`} />
          </button>
        </div>
      </header>

      <div
        id="site-menu"
        ref={menuRef}
        hidden={!open}
        className="fixed inset-0 z-40 flex-col justify-between overflow-y-auto bg-bg px-(--gutter) pt-[calc(var(--header)+2rem)] pb-28 lg:hidden [&:not([hidden])]:flex"
      >
        <nav aria-label={ui.menuLabel}>
          <ul role="list" className="grid">
            {nav.map((item) => (
              <li key={item.id} className="border-t border-line">
                <a href={`${navBase}#${item.id}`} onClick={close} className="display flex min-h-14 items-center py-3 text-[clamp(2rem,10vw,3rem)]">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a href={`tel:${site.phone.tel}`} className="mt-10 inline-flex min-h-11 items-center text-mute">
          {site.phone.display}
        </a>
      </div>
    </>
  );
}
