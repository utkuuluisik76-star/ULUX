import type { Locale } from '@/content/types';
import { localePath } from '@/content/site';

const languages: { locale: Locale; short: string; name: string }[] = [
  { locale: 'tr', short: 'TR', name: 'Türkçe' },
  { locale: 'en', short: 'EN', name: 'English' },
];

/** `hrefs`: the same page in each language (landing pages); defaults to the homepages. */
export function LangSwitch({ current, label, hrefs, className = '' }: { current: Locale; label: string; hrefs?: Record<Locale, string>; className?: string }) {
  return (
    <nav aria-label={label} className={`flex items-center gap-1 text-xs font-semibold tracking-[0.14em] ${className}`}>
      {languages.map(({ locale, short, name }, i) => (
        <span key={locale} className="flex items-center gap-1">
          {i > 0 && (
            <span aria-hidden="true" className="text-mute">
              /
            </span>
          )}
          <a
            href={hrefs?.[locale] ?? localePath[locale]}
            hrefLang={locale}
            lang={locale}
            aria-current={locale === current ? 'true' : undefined}
            className={`inline-flex min-h-11 min-w-8 items-center justify-center transition-colors ${locale === current ? 'text-ink' : 'text-mute hover:text-ink'}`}
          >
            {short}
            {/* the accessible name starts with the visible text, then spells the language out */}
            <span className="sr-only"> ({name})</span>
          </a>
        </span>
      ))}
    </nav>
  );
}
