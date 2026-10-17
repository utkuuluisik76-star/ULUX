// Responsive, art-directed AVIF + WebP images from the source photos: npm run images
//
// Sources live in src/images-src (full-size originals, ≥2400 px wide where possible; record the
// licence or the client's permission for each). Output goes to public/images and is committed,
// so a build never needs to re-encode them.
//
// Each entry writes "<name>-<width>.(avif|webp)" for the landscape crop and, when `portrait` is
// set, "<name>-portrait-<width>.(avif|webp)" for phones held upright. Keep `images` in
// src/content/site.ts in sync (name, widths, portraitWidths, width/height of the largest file).
//
// The starter ships neutral placeholders (src/images-src/placeholder-*.jpg, made by
// `node scripts/images.mjs --placeholders`): replace them with the client's photos.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const path = (p) => fileURLToPath(new URL(p, import.meta.url));
// A restored copy in src/images-src/enhanced (same file name; e.g. from a project's enhance script
// or a retoucher) wins over the original, which is kept untouched next to it.
const src = (file) => {
  const enhanced = path(`../src/images-src/enhanced/${file}`);
  return existsSync(enhanced) ? enhanced : path(`../src/images-src/${file}`);
};

// crop: { left, top, width, height } in source pixels (omit for the whole photo)
const images = [
  { name: 'hero', src: 'placeholder-hero.jpg', crop: { left: 0, top: 0, width: 2400, height: 1600 }, widths: [1280, 1920],
    portrait: { crop: { left: 700, top: 0, width: 1000, height: 1500 }, widths: [640, 960] } },
  { name: 'about', src: 'placeholder-about.jpg', crop: { left: 0, top: 0, width: 1600, height: 1200 }, widths: [960, 1440],
    portrait: { crop: { left: 300, top: 0, width: 960, height: 1200 }, widths: [640] } },
];

// One grade for the whole set so the photos read as a series. Adjust per client (or remove).
const grade = (pipeline) => pipeline.modulate({ saturation: 0.92 });

const write = async (pipeline, base) => {
  const avif = await pipeline.clone().avif({ quality: 52, effort: 6 }).toFile(`${base}.avif`);
  const webp = await pipeline.clone().webp({ quality: 74 }).toFile(`${base}.webp`);
  return `${avif.width}x${avif.height} avif ${(avif.size / 1024) | 0} KB, webp ${(webp.size / 1024) | 0} KB`;
};

/** Neutral stand-in photos with a visible label, so nobody mistakes them for real imagery. */
const placeholders = async () => {
  const make = async (file, width, height, label, [a, b]) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <text x="50%" y="50%" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.round(width / 28)}" font-weight="700" fill="rgba(255,255,255,0.55)" letter-spacing="8">${label}</text>
    </svg>`;
    await sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toFile(src(file));
    console.log(`${file}: ${width}x${height}`);
  };
  await make('placeholder-hero.jpg', 2400, 1600, 'FOTO · HERO', ['#55626b', '#2b3238']);
  await make('placeholder-about.jpg', 1600, 1200, 'FOTO · HAKKIMIZDA', ['#7b7468', '#4a453d']);
};

if (process.argv.includes('--placeholders')) await placeholders();

await mkdir(path('../public/images'), { recursive: true });
for (const image of images) {
  const variants = [{ suffix: '', crop: image.crop, widths: image.widths }];
  if (image.portrait) variants.push({ suffix: '-portrait', crop: image.portrait.crop, widths: image.portrait.widths });
  for (const variant of variants) {
    const source = sharp(src(image.src));
    const buffer = await (variant.crop ? source.extract(variant.crop) : source).toBuffer();
    for (const width of variant.widths) {
      const resized = await sharp(buffer).resize({ width, withoutEnlargement: true }).toBuffer();
      const name = `${image.name}${variant.suffix}-${width}`;
      console.log(`${name}: ${await write(grade(sharp(resized)), path(`../public/images/${name}`))}`);
    }
  }
}
