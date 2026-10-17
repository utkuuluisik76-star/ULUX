// Small, self-hosted font subsets with the Turkish letters: npm run fonts
//
// Each family is split in two files: "latin" (Basic Latin, Latin-1, typographic punctuation) and
// "tr" (only Ğ ğ İ ı Ş ş). The browser downloads the second one only when a page uses those
// letters (unicode-range in globals.css). Variable axes are pinned to the ranges the design uses.
//
// Per client: install the families from fontsource (npm i -D @fontsource-variable/<family>),
// change the jobs below, run this script, then update the @font-face rules in
// src/app/globals.css and the preloads in src/components/Document.tsx.
// Default families: Archivo (variable) + Instrument Serif italic, SIL Open Font License.
import subsetFont from 'subset-font';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const path = (p) => fileURLToPath(new URL(p, import.meta.url));
const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => String.fromCodePoint(from + i)).join('');

const latin = [range(0x20, 0x7e), range(0xa0, 0xff), '‘’‚“”„–—…•€→←↑↓×'].join('');
const turkish = 'ĞğİıŞş';
const archivoAxes = { wdth: { min: 75, max: 100, default: 100 }, wght: { min: 200, max: 800, default: 400 } };

const jobs = [
  { from: '@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2', to: 'archivo-latin.woff2', chars: latin, axes: archivoAxes },
  { from: '@fontsource-variable/archivo/files/archivo-latin-ext-wdth-normal.woff2', to: 'archivo-tr.woff2', chars: turkish, axes: archivoAxes },
  { from: '@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2', to: 'instrument-serif-italic-latin.woff2', chars: latin },
  { from: '@fontsource/instrument-serif/files/instrument-serif-latin-ext-400-italic.woff2', to: 'instrument-serif-italic-tr.woff2', chars: turkish },
];

await mkdir(path('../public/fonts'), { recursive: true });
for (const job of jobs) {
  const source = await readFile(path(`../node_modules/${job.from}`));
  const subset = await subsetFont(source, job.chars, { targetFormat: 'woff2', ...(job.axes && { variationAxes: job.axes }) });
  await writeFile(path(`../public/fonts/${job.to}`), subset);
  console.log(`${job.to}: ${(subset.length / 1024).toFixed(1)} KB (from ${(source.length / 1024).toFixed(1)} KB)`);
}
