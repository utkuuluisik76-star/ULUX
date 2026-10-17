import type { MetadataRoute } from 'next';
import { localePath, site } from '@/content/site';
import { LANDING_KEYS, landingPath } from '@/content/landing';

export const dynamic = 'force-static';

/** Every page in both languages, each pointing at its translation. Empty until site.url is set. */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!site.url) return [];
  const pair = (tr: string, en: string): MetadataRoute.Sitemap => {
    const languages = { tr: site.url + tr, en: site.url + en };
    return [
      { url: languages.tr, alternates: { languages } },
      { url: languages.en, alternates: { languages } },
    ];
  };
  return [pair(localePath.tr, localePath.en), ...LANDING_KEYS.map((key) => pair(landingPath(key, 'tr'), landingPath(key, 'en')))].flat();
}
