import type { QA } from '@/content/types';
import { FaqList } from '@/components/ui/FaqList';
import { Rich } from '@/components/ui/Rich';

/** FAQ section; used on the homepage and on every landing page (each with its own questions). */
export function Faq({ id = 'sss', title, items }: { id?: string; title: string; items: QA[] }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="px-(--gutter) py-24 md:py-32">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <h2 id={`${id}-title`} className="display text-[clamp(2.25rem,5vw,4rem)]">
          <Rich text={title} />
        </h2>
        <FaqList items={items} />
      </div>
    </section>
  );
}
