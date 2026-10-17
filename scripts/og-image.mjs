// Social share images (1200×630) in the site's own fonts and colours: npm run og
// Text: the business name (src/content/site.ts) and ogTitle per language (content/pages/seo.json),
// over the hero photo with a shade. Output: public/og-tr.jpg and public/og-en.jpg.
// Uses a locally installed Chromium browser (Edge by default on Windows; set CHROME_PATH otherwise).
// Run again whenever the name, the share titles or the hero photo change.
import { spawn } from 'node:child_process';
import { closeBrowser } from './qa/browser.mjs';
import { readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

const path = (p) => fileURLToPath(new URL(p, import.meta.url));
const asset = (p) => pathToFileURL(path(`../public/${p}`)).href;
const browser = process.env.CHROME_PATH ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const clean = (text) => text.replace(/\[\[|\]\]/g, '');
const escape = (text) => text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const css = await readFile(path('../src/app/globals.css'), 'utf8');
const token = (name) => css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-f]{6})`, 'i'))?.[1] ?? '#000000';
const name = clean((await readFile(path('../src/content/site.ts'), 'utf8')).match(/name:\s*'([^']+)'/)?.[1] ?? '');
const seo = JSON.parse(await readFile(path('../content/pages/seo.json'), 'utf8'));

const html = (title) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Display; src: url(${asset('fonts/archivo-latin.woff2')}); font-weight: 200 800; font-stretch: 75% 100%; }
@font-face { font-family: Display; src: url(${asset('fonts/archivo-tr.woff2')}); font-weight: 200 800; font-stretch: 75% 100%; unicode-range: U+011E-011F, U+0130-0131, U+015E-015F; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; overflow: hidden; background: ${token('ink')}; color: #fff; font-family: Display; position: relative; }
.photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.shade { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.78), rgba(0,0,0,.25)); }
.wrap { position: absolute; inset: 56px 64px; display: flex; flex-direction: column; justify-content: space-between; }
.name { font-size: 30px; font-weight: 800; font-stretch: 85%; letter-spacing: -.02em; }
h1 { font-weight: 800; font-stretch: 82%; font-size: 76px; line-height: .95; letter-spacing: -.03em; max-width: 15ch; }
</style></head><body>
<img class="photo" src="${asset('images/hero-1280.webp')}">
<div class="shade"></div>
<div class="wrap"><div class="name">${escape(name)}</div><h1>${escape(clean(title))}</h1></div>
</body></html>`;

const profile = join(tmpdir(), `og-browser-${Date.now()}`);
const proc = spawn(browser, ['--headless=new', '--hide-scrollbars', '--allow-file-access-from-files', '--remote-debugging-port=9250', `--user-data-dir=${profile}`, 'about:blank']);
let targets;
for (let i = 0; i < 40 && !targets; i++) {
  await new Promise((r) => setTimeout(r, 500));
  targets = await fetch('http://127.0.0.1:9250/json').then((r) => r.json()).catch(() => undefined);
}
const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (pending.has(m.id)) pending.get(m.id)(m.result ?? m), pending.delete(m.id);
};
const send = (method, params = {}) => new Promise((r) => (pending.set(++id, r), ws.send(JSON.stringify({ id, method, params }))));

await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });
for (const locale of ['tr', 'en']) {
  const file = join(tmpdir(), `og-${locale}.html`);
  await writeFile(file, html(seo[locale].ogTitle));
  await send('Page.navigate', { url: pathToFileURL(file).href });
  await new Promise((r) => setTimeout(r, 1500));
  await send('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true });
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const info = await sharp(Buffer.from(shot.data, 'base64')).jpeg({ quality: 82, mozjpeg: true }).toFile(path(`../public/og-${locale}.jpg`));
  console.log(`og-${locale}.jpg: ${info.width}x${info.height} ${(info.size / 1024) | 0} KB`);
  await rm(file);
}
ws.close();
await closeBrowser(9250, proc);
