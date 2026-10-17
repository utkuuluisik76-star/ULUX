import type { Metadata } from 'next';
import { site } from '@/content/site';
import { Logo } from '@/components/ui/Logo';
import './globals.css';

export const metadata: Metadata = {
  title: `Sayfa bulunamadı · Page not found | ${site.name}`,
  robots: { index: false },
  icons: { icon: [{ url: '/favicon-32.png', sizes: '32x32', type: 'image/png' }] },
};

/** 404 for every URL that doesn't exist, in both languages. */
export default function GlobalNotFound() {
  return (
    <html lang="tr">
      <body>
        <main className="flex min-h-svh flex-col justify-between px-(--gutter) py-8">
          <a href="/" className="inline-flex min-h-11 items-center self-start">
            <Logo />
          </a>
          <div>
            <p className="eyebrow text-mute">404</p>
            <h1 className="display mt-6 text-[clamp(2.5rem,9vw,7rem)]">Sayfa bulunamadı.</h1>
            <p className="mt-6 max-w-[40ch] text-lg">
              Aradığınız sayfa taşınmış ya da hiç var olmamış olabilir.
              <span lang="en" className="mt-2 block text-mute">
                The page you are looking for may have moved or never existed.
              </span>
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-5 text-sm font-semibold">
            <a href="/" className="inline-flex min-h-11 items-center underline underline-offset-4">
              Ana sayfaya dön →
            </a>
            <a href="/en/" lang="en" className="inline-flex min-h-11 items-center text-mute hover:text-ink">
              Go to the English site →
            </a>
          </nav>
        </main>
      </body>
    </html>
  );
}
