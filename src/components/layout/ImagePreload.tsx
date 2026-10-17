import type { ImageSet } from '@/content/types';
import { PORTRAIT_QUERY } from '@/components/ui/ResponsiveImage';

const srcset = (name: string, widths: number[]) => widths.map((w) => `/images/${name}-${w}.avif ${w}w`).join(', ');

/**
 * Preloads the LCP photo (React 19 hoists these <link>s into <head>): the portrait crop on upright
 * phones, the landscape crop elsewhere, so each device fetches exactly the file it will show.
 */
export function ImagePreload({ image, sizes = '100vw' }: { image: ImageSet; sizes?: string }) {
  const landscapeMedia = image.portraitWidths ? `not all and ${PORTRAIT_QUERY}` : undefined;
  return (
    <>
      <link rel="preload" as="image" type="image/avif" media={landscapeMedia} imageSrcSet={srcset(image.name, image.widths)} imageSizes={sizes} fetchPriority="high" />
      {image.portraitWidths && (
        <link rel="preload" as="image" type="image/avif" media={PORTRAIT_QUERY} imageSrcSet={srcset(`${image.name}-portrait`, image.portraitWidths)} imageSizes={sizes} fetchPriority="high" />
      )}
    </>
  );
}
