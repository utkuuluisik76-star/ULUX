// Lists everything still to fill in before launch: npm run todo
//   [[...]] placeholders in content/, src/content/ and public/admin/config.yml,
//   plus the setup values that must not stay empty (domain, DecapBridge site id, …).
// `npm run todo -- --strict` exits with an error while anything is open (use before going live).
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const files = async (dir, ext) =>
  (await readdir(join(root, dir), { withFileTypes: true, recursive: true }))
    .filter((e) => e.isFile() && ext.some((x) => e.name.endsWith(x)) && !(e.parentPath ?? e.path).includes('generated'))
    .map((e) => join(e.parentPath ?? e.path, e.name));

const open = [];
for (const file of [...(await files('content', ['.json'])), ...(await files('src/content', ['.ts'])), join(root, 'public/admin/config.yml'), join(root, 'public/_headers')]) {
  const lines = (await readFile(file, 'utf8')).split('\n');
  lines.forEach((line, i) => {
    for (const match of line.matchAll(/\[\[(.+?)\]\]/g)) open.push(`${relative(root, file)}:${i + 1}  ${match[1]}`);
    if (/TODO-/.test(line)) open.push(`${relative(root, file)}:${i + 1}  ${line.trim()}`);
  });
}

const site = await readFile(join(root, 'src/content/site.ts'), 'utf8');
if (/url:\s*''/.test(site)) open.push("src/content/site.ts  url: '' (the live domain: canonical, sitemap, social previews)");
const settings = JSON.parse(await readFile(join(root, 'content/settings.json'), 'utf8'));
if (/^\+90 500 000 00 00$/.test(settings.phone) || settings.whatsapp === '905000000000') open.push('content/settings.json  phone / whatsapp are still the example numbers');

if (open.length) {
  console.log(`${open.length} open item(s):\n  ${open.join('\n  ')}`);
  if (process.argv.includes('--strict')) process.exit(1);
} else console.log('Nothing open: no placeholders left.');
