// Responsive versions of photos uploaded through the CMS: npm run cms-images
// Runs automatically before `npm run dev` and `npm run build` (predev / prebuild), so on Cloudflare
// every build turns new uploads into the same kind of image set as the hand-cropped photos.
//
// Input:  every { "src": "/uploads/…", "focus": "…" } object in content/**/*.json
//         (the original file lives in public/uploads, where Decap CMS puts it).
// Output: public/images/cms/<name>-<width>.(avif|webp)            landscape, 3:2
//         public/images/cms/<name>-portrait-<width>.(avif|webp)   portrait, 2:3 (phones held upright)
//         src/content/generated/cms-images.json                   sizes per photo, read by src/content/cms.ts
// `focus` decides which part of the photo stays in view when it is cropped.
// Both output folders are generated, so they are not in Git.
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const path = (p) => fileURLToPath(new URL(p, import.meta.url));
const contentDir = path('../content');
const publicDir = path('../public');
const outDir = path('../public/images/cms');
const manifestFile = path('../src/content/generated/cms-images.json');

const LANDSCAPE = [1280, 1920];
const PORTRAIT = [640, 960];
const FOCUS = { center: 'centre', top: 'north', bottom: 'south', left: 'west', right: 'east' };

/** every image field ({ src, focus }) in a JSON value */
const collect = (value, found) => {
  if (Array.isArray(value)) value.forEach((v) => collect(v, found));
  else if (value && typeof value === 'object') {
    if (typeof value.src === 'string' && value.src.startsWith('/uploads/')) found.add(`${value.src}|${value.focus || 'center'}`);
    Object.values(value).forEach((v) => collect(v, found));
  }
};

const jsonFiles = async (dir) =>
  (await readdir(dir, { withFileTypes: true, recursive: true }))
    .filter((e) => e.isFile() && e.name.endsWith('.json'))
    .map((e) => join(e.parentPath ?? e.path, e.name));

/** ascii file name that is stable for the same upload + focus */
const outputName = (src, focus) => {
  const base = src.split('/').pop().replace(/\.[^.]+$/, '');
  const slug = base.normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i').replace(/[^\w-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase().slice(0, 40) || 'photo';
  const hash = createHash('sha1').update(`${src}|${focus}`).digest('hex').slice(0, 6);
  return `${slug}-${focus}-${hash}`;
};

const exists = (file) => stat(file).then((s) => s.mtimeMs, () => 0);

const found = new Set();
for (const file of await jsonFiles(contentDir)) collect(JSON.parse(await readFile(file, 'utf8')), found);

await mkdir(outDir, { recursive: true });
await mkdir(path('../src/content/generated'), { recursive: true });

const manifest = {};
for (const key of [...found].sort()) {
  const [src, rawFocus] = key.split('|');
  const focus = FOCUS[rawFocus] ? rawFocus : 'center';
  const source = join(publicDir, src);
  const sourceTime = await exists(source);
  if (!sourceTime) throw new Error(`[cms-images] ${src} is used in /content but the file is missing from public${src}`);

  const meta = await sharp(source).rotate().metadata();
  const w = meta.autoOrient?.width ?? meta.width;
  const h = meta.autoOrient?.height ?? meta.height;
  // never upscale: keep only the widths the photo can fill (at least one)
  const fit = (widths, maxWidth) => {
    const ok = widths.filter((x) => x <= maxWidth);
    return ok.length ? ok : [Math.floor(maxWidth)];
  };
  const landscape = fit(LANDSCAPE, Math.min(w, (h * 3) / 2));
  const portrait = fit(PORTRAIT, Math.min(w, (h * 2) / 3));
  const name = outputName(src, focus);

  const render = async (width, ratio, file) => {
    for (const ext of ['avif', 'webp']) {
      const target = join(outDir, `${file}.${ext}`);
      if ((await exists(target)) > sourceTime) continue; // already up to date
      const pipeline = sharp(source).rotate().resize({ width, height: Math.round(width * ratio), fit: 'cover', position: FOCUS[focus] });
      await (ext === 'avif' ? pipeline.avif({ quality: 55, effort: 4 }) : pipeline.webp({ quality: 78 })).toFile(target);
    }
  };
  for (const width of landscape) await render(width, 2 / 3, `${name}-${width}`);
  for (const width of portrait) await render(width, 3 / 2, `${name}-portrait-${width}`);

  const largest = landscape.at(-1);
  manifest[key] = { name: `cms/${name}`, widths: landscape, portraitWidths: portrait, width: largest, height: Math.round((largest * 2) / 3) };
  console.log(`[cms-images] ${src} (${focus}) → ${landscape.join('/')} + portrait ${portrait.join('/')}`);
}

await writeFile(manifestFile, JSON.stringify(manifest, null, 2) + '\n');
console.log(`[cms-images] ${found.size} uploaded photo(s)`);
