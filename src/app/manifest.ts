import type { MetadataRoute } from 'next';
import { site } from '@/content/site';
import { tr } from '@/content/tr';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.name,
    description: tr.meta.description,
    start_url: '/',
    display: 'browser',
    background_color: site.themeColor,
    theme_color: site.themeColor,
    lang: 'tr',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
