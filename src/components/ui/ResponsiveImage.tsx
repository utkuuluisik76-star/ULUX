import type { ImageSet } from '@/content/types';

/**
 * Art-directed <picture>: a portrait crop for upright phones, landscape elsewhere,
 * AVIF with WebP fallback. Files come from scripts/images.mjs.
 * PORTRAIT_QUERY must match the media queries of the LCP preload (ImagePreload).
 */
export const PORTRAIT_QUERY = '(max-width: 900px) and (orientation: portrait)';

const srcset = (name: string, widths: number[], ext: string) => widths.map((w) => `/images/${name}-${w}.${ext} ${w}w`).join(', ');

type Props = {
  image: ImageSet;
  /** use a derived set, e.g. 'dark' → hero-dark-1280.avif */
  variant?: string;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
  decorative?: boolean;
  /** always use the portrait crop, e.g. in a tall tile (falls back to landscape if there is none) */
  portraitOnly?: boolean;
};

export function ResponsiveImage({ image, variant, className = '', imgClassName = '', sizes = '100vw', priority = false, decorative = false, portraitOnly = false }: Props) {
  const name = variant ? `${image.name}-${variant}` : image.name;
  const portrait = image.portraitWidths ? `${name}-portrait` : null;
  if (portraitOnly && portrait) {
    const widths = image.portraitWidths!;
    return (
      <picture className={className}>
        <source type="image/avif" srcSet={srcset(portrait, widths, 'avif')} sizes={sizes} />
        <img
          src={`/images/${portrait}-${widths[0]}.webp`}
          srcSet={srcset(portrait, widths, 'webp')}
          sizes={sizes}
          width={widths.at(-1)}
          height={Math.round((widths.at(-1)! * 3) / 2)}
          alt={decorative ? '' : image.alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={imgClassName}
        />
      </picture>
    );
  }
  return (
    <picture className={className}>
      {portrait && (
        <>
          <source media={PORTRAIT_QUERY} type="image/avif" srcSet={srcset(portrait, image.portraitWidths!, 'avif')} sizes={sizes} />
          <source media={PORTRAIT_QUERY} type="image/webp" srcSet={srcset(portrait, image.portraitWidths!, 'webp')} sizes={sizes} />
        </>
      )}
      <source type="image/avif" srcSet={srcset(name, image.widths, 'avif')} sizes={sizes} />
      <img
        src={`/images/${name}-${image.widths[0]}.webp`}
        srcSet={srcset(name, image.widths, 'webp')}
        sizes={sizes}
        width={image.width}
        height={image.height}
        alt={decorative ? '' : image.alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className={imgClassName}
      />
    </picture>
  );
}
