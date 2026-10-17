import type { Dictionary } from '@/content/types';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';
import { Rich } from '@/components/ui/Rich';

export function About({ dict }: { dict: Dictionary }) {
  const { about } = dict;
  return (
    <section id="hakkimizda" aria-labelledby="about-title" className="bg-surface px-(--gutter) py-24 md:py-32">
      <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
        <div data-reveal className="overflow-hidden">
          <ResponsiveImage image={about.image} sizes="(min-width: 768px) 50vw, 100vw" imgClassName="aspect-[4/3] w-full object-cover" />
        </div>
        <div data-reveal>
          <h2 id="about-title" className="display text-[clamp(2.25rem,5vw,4rem)]">
            <Rich text={about.title} />
          </h2>
          <p className="mt-6 max-w-[52ch] text-[1.125rem]">
            <Rich text={about.text} />
          </p>
        </div>
      </div>
    </section>
  );
}
