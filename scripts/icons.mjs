// Favicons and app icons: npm run icons
//
// Source: src/images-src/logo-mark.png (square, ≥512 px, transparent background), the client's
// logo mark. Without it, a placeholder monogram of the business name's first letter is drawn.
// Output: public/favicon-32.png, favicon-48.png, apple-touch-icon.png (180), icon-192.png, icon-512.png.
import sharp from 'sharp';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const path = (p) => fileURLToPath(new URL(p, import.meta.url));
const source = path('../src/images-src/logo-mark.png');

// colours from the design tokens (src/app/globals.css)
const css = await readFile(path('../src/app/globals.css'), 'utf8');
const token = (name) => css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-f]{6})`, 'i'))?.[1] ?? '#000000';
const background = token('accent');
const foreground = token('accent-ink');

const siteTs = await readFile(path('../src/content/site.ts'), 'utf8');
const name = siteTs.match(/name:\s*'([^']+)'/)?.[1].replace(/\[\[|\]\]/g, '') ?? 'S';

const hasLogo = await stat(source).then(() => true, () => false);

/** The mark centred on the brand colour; `pad` leaves room for rounded masks (apple, android). */
const icon = async (size, pad) => {
  if (hasLogo) {
    const inner = Math.round(size * (1 - pad * 2));
    const mark = await sharp(source).resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
    return sharp({ create: { width: size, height: size, channels: 4, background } }).composite([{ input: mark, gravity: 'centre' }]);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <rect width="100%" height="100%" fill="${background}"/>
    <text x="50%" y="50%" dy="0.35em" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="${Math.round(size * 0.56)}" fill="${foreground}">${name.trim().charAt(0).toUpperCase()}</text>
  </svg>`;
  return sharp(Buffer.from(svg));
};

for (const [file, size, pad] of [
  ['favicon-32.png', 32, 0],
  ['favicon-48.png', 48, 0],
  ['apple-touch-icon.png', 180, 0.12],
  ['icon-192.png', 192, 0.12],
  ['icon-512.png', 512, 0.12],
]) {
  const info = await (await icon(size, pad)).png().toFile(path(`../public/${file}`));
  console.log(`${file}: ${info.width}x${info.height}${hasLogo ? '' : ' (placeholder monogram)'}`);
}
