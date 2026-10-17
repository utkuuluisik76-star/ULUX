import type { Dictionary } from '@/content/types';
import { site, whatsappHref } from '@/content/site';
import { Button } from '@/components/ui/Button';
import { Rich } from '@/components/ui/Rich';

/** Closing call to action: the primary action once more, plus a phone call for those who prefer it. */
export function Contact({ dict, title, text }: { dict: Dictionary; title?: string; text?: string }) {
  return (
    <section id="iletisim" aria-labelledby="contact-title" className="bg-ink px-(--gutter) py-24 text-bg md:py-32">
      <h2 id="contact-title" className="display max-w-[18ch] text-[clamp(2.5rem,7vw,6rem)]">
        <Rich text={title ?? dict.contact.title} />
      </h2>
      <p className="mt-6 max-w-[46ch] text-[1.125rem] text-bg/80">
        <Rich text={text ?? dict.contact.text} />
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
        <Button href={whatsappHref(dict.cta.whatsappMessage)} external newTabLabel={dict.ui.newTab} variant="light">
          {dict.cta.label}
        </Button>
        <a href={`tel:${site.phone.tel}`} className="inline-flex min-h-11 items-center underline decoration-bg/40 underline-offset-4 hover:decoration-bg">
          {dict.ui.call}: {site.phone.display}
        </a>
      </div>
    </section>
  );
}
