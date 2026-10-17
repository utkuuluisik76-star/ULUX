import { site } from '@/content/site';

/** Phones and tablets: call + primary CTA, always on screen at the bottom (hidden on desktop). */
export function BottomBar({ callLabel, ctaLabel, ctaHref, newTabLabel }: { callLabel: string; ctaLabel: string; ctaHref: string; newTabLabel: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-[auto_1fr] border-t border-line bg-bg pb-[env(safe-area-inset-bottom)] lg:hidden">
      <a href={`tel:${site.phone.tel}`} className="eyebrow flex min-h-14 items-center px-6">
        {callLabel}
      </a>
      <a href={ctaHref} target="_blank" rel="noopener" className="eyebrow flex min-h-14 items-center justify-center gap-2 bg-accent px-4 font-bold text-accent-ink">
        {ctaLabel} <span aria-hidden="true">→</span>
        <span className="sr-only"> {newTabLabel}</span>
      </a>
    </div>
  );
}
