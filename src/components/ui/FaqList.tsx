import type { QA } from '@/content/types';
import { Rich } from '@/components/ui/Rich';

/** Questions as native disclosure widgets (keyboard and screen-reader friendly, no JS). */
export function FaqList({ items }: { items: QA[] }) {
  return (
    <div className="border-t border-line">
      {items.map((item) => (
        <details key={item.q} className="group border-b border-line">
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-[clamp(1.0625rem,2vw,1.375rem)] font-semibold leading-snug [&::-webkit-details-marker]:hidden">
            <span>
              <Rich text={item.q} />
            </span>
            <span aria-hidden="true" className="relative size-4 shrink-0">
              <span className="absolute inset-x-0 top-1/2 h-px bg-current" />
              <span className="absolute inset-y-0 left-1/2 w-px bg-current transition-transform duration-300 group-open:scale-y-0" />
            </span>
          </summary>
          <p className="max-w-[62ch] pb-7 text-mute">
            <Rich text={item.a} />
          </p>
        </details>
      ))}
    </div>
  );
}
