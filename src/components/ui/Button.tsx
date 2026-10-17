import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { Magnetic } from '@/components/motion/Magnetic';

type Variant = 'solid' | 'outline' | 'light' | 'text';

const variants: Record<Variant, string> = {
  solid: 'bg-accent text-accent-ink hover:bg-ink',
  outline: 'text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:shadow-[inset_0_0_0_1px_var(--color-ink)]',
  // on a dark photo or dark section
  light: 'bg-bg text-ink hover:bg-surface',
  text: 'px-0! text-current',
};

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: Variant;
  arrow?: boolean;
  external?: boolean;
  newTabLabel?: string;
  /** the one magnetic CTA of the site (blueprint: at most one) */
  magnetic?: boolean;
  children: ReactNode;
};

/** Link styled as a button: at least 48 px tall, visible focus, arrow nudges on hover. */
export function Button({ variant = 'solid', arrow = true, external, newTabLabel, magnetic = false, className = '', children, ...rest }: Props) {
  const link = (
    <a
      {...rest}
      {...(external && { target: '_blank', rel: 'noopener' })}
      className={`group inline-flex min-h-12 items-center justify-center gap-3 rounded-[2px] px-6 text-[0.8125rem] font-bold uppercase leading-tight tracking-[0.12em] transition-[background-color,box-shadow,color] duration-200 ${variants[variant]} ${className}`}
    >
      <span>{children}</span>
      {arrow && (
        <span aria-hidden="true" className="font-normal transition-transform duration-300 ease-(--ease-out-expo) group-hover:translate-x-1">
          →
        </span>
      )}
      {external && newTabLabel && <span className="sr-only"> {newTabLabel}</span>}
    </a>
  );
  return magnetic ? <Magnetic>{link}</Magnetic> : link;
}
