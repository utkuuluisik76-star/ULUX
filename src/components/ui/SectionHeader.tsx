import { Rich } from '@/components/ui/Rich';

/** Section title (H2) with an optional intro; `id` is used for aria-labelledby on the section. */
export function SectionHeader({ id, title, intro, className = '' }: { id: string; title: string; intro?: string; className?: string }) {
  return (
    <header className={`grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] md:items-end ${className}`}>
      <h2 id={id} className="display text-[clamp(2.25rem,6vw,4.5rem)]">
        <Rich text={title} />
      </h2>
      {intro && (
        <p className="max-w-[48ch] text-mute">
          <Rich text={intro} />
        </p>
      )}
    </header>
  );
}
