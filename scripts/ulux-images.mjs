import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
const base = new URL('../public/images/', import.meta.url);
const cap = new URL('cap-source.png', base);
const photo = new URL('photo-source.png', base);
for (const width of [640, 1200, 1600]) {
  for (const format of ['avif', 'webp']) {
    await sharp(fileURLToPath(cap)).resize({ width }).toFormat(format, { quality: format === 'avif' ? 70 : 85 }).toFile(fileURLToPath(new URL(`cap-${width}.${format}`, base)));
  }
}
for (const format of ['avif', 'webp']) {
  await sharp(fileURLToPath(photo)).extract({ left: 920, top: 375, width: 460, height: 540 }).resize(1200, 1400).toFormat(format, { quality: 85 }).toFile(fileURLToPath(new URL(`detail.${format}`, base)));
  await sharp(fileURLToPath(photo)).extract({ left: 970, top: 390, width: 390, height: 460 }).resize(780, 920).toFormat(format, { quality: 82 }).toFile(fileURLToPath(new URL(`detail-portrait.${format}`, base)));
}
