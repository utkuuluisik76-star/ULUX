import type { Dictionary } from '@/content/types';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Rich } from '@/components/ui/Rich';

export function Services({ dict }: { dict: Dictionary }) {
  const { services } = dict;
  return (
    <section id="hizmetler" aria-labelledby="services-title" className="px-(--gutter) py-24 md:py-32">
      <SectionHeader id="services-title" title={services.title} intro={services.intro} />
      <ol role="list" className="mt-14 grid border-t border-line md:grid-cols-3">
        {services.items.map((item, i) => (
          <li key={item.title} data-reveal className="border-b border-line py-8 md:border-b-0 md:py-10 md:pr-10 md:not-first:border-l md:not-first:pl-10">
            <span aria-hidden="true" className="eyebrow text-mute">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className="mt-4 text-[clamp(1.375rem,2.2vw,1.75rem)] font-bold leading-tight tracking-[-0.01em]">
              <Rich text={item.title} />
            </h3>
            <p className="mt-3 max-w-[44ch] text-mute">
              <Rich text={item.text} />
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
