import type { MetadataRoute } from 'next';
import { site } from '@/content/site';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    // /admin is the content editor (Decap CMS): nothing there for search engines.
    rules: { userAgent: '*', disallow: '/' },
    ...(site.url && { sitemap: `${site.url}/sitemap.xml` }),
  };
}
