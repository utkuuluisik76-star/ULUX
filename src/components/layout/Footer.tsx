import type { Dictionary, Locale } from '@/content/types';
import { localePath, site, whatsappHref } from '@/content/site';
import { LANDING_KEYS, landingPath } from '@/content/landing';
import { LangSwitch } from '@/components/ui/LangSwitch';
import { Logo } from '@/components/ui/Logo';
import { Rich } from '@/components/ui/Rich';

const linkClass = 'inline-flex min-h-11 items-center underline-offset-4 hover:underline';

/** Contact details, every page (internal links help search engines find them) and the language switch. */
export function Footer({ dict, langHrefs }: { dict: Dictionary; langHrefs?: Record<Locale, string> }) {
  const { ui } = dict;
  const pages = [
    { href: localePath[dict.locale], label: ui.home },
    ...LANDING_KEYS.map((key) => ({ href: landingPath(key, dict.locale), label: dict.landing[key].h1 })),
  ];
  return (
    <footer className="border-t border-line px-(--gutter) pt-16 pb-28 lg:pb-12">
      <div className="grid gap-12 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <Logo className="text-[1.5rem]" />
          {dict.contact.address && (
            <p className="mt-4 max-w-[32ch] text-mute">
              <span className="sr-only">{ui.addressLabel}: </span>
              <Rich text={dict.contact.address} />
            </p>
          )}
        </div>
        <dl className="grid content-start gap-4 text-sm">
          <div>
            <dt className="eyebrow text-mute">{ui.phoneLabel}</dt>
            <dd>
              <a href={`tel:${site.phone.tel}`} className={linkClass}>
                {site.phone.display}
              </a>
            </dd>
          </div>
          <div>
            <dt className="eyebrow text-mute">WhatsApp</dt>
            <dd>
              <a href={whatsappHref(dict.cta.whatsappMessage)} target="_blank" rel="noopener" className={linkClass}>
                {ui.whatsapp}
                <span className="sr-only"> {ui.newTab}</span>
              </a>
            </dd>
          </div>
          {site.email && (
            <div>
              <dt className="eyebrow text-mute">{ui.emailLabel}</dt>
              <dd>
                <a href={`mailto:${site.email}`} className={linkClass}>
                  {site.email}
                </a>
              </dd>
            </div>
          )}
        </dl>
        <nav aria-labelledby="footer-pages">
          <p id="footer-pages" className="eyebrow text-mute">
            {ui.pagesLabel}
          </p>
          <ul role="list" className="mt-2 grid text-sm">
            {pages.map((page) => (
              <li key={page.href}>
                <a href={page.href} className={linkClass}>
                  <Rich text={page.label} />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-sm text-mute">
        <p>
          © {new Date().getFullYear()} {site.name.replace(/\[\[|\]\]/g, '')}. {ui.copyright}
        </p>
        <LangSwitch current={dict.locale} label={ui.languageLabel} hrefs={langHrefs} />
      </div>
    </footer>
  );
}
