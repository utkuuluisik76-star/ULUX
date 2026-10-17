import { site } from '@/content/site';

/**
 * Placeholder logo: the business name as a wordmark. Replace with the client's logo
 * (an inline SVG or /brand/*.svg with width and height). Decorative: the surrounding link
 * carries the accessible name.
 */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`text-[1.125rem] font-extrabold tracking-[-0.02em] [font-stretch:85%] ${className}`}>
      {site.name.replace(/\[\[|\]\]/g, '')}
    </span>
  );
}
