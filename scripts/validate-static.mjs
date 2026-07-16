import assert from 'node:assert/strict';
import path from 'node:path';
import { access, readFile } from 'node:fs/promises';

const pages = ['index.html', 'agentes.html', 'agentes/lead-scout.html', 'agentes/gracias.html'];
let assetCount = 0;

for (const page of pages) {
  const html = await readFile(page, 'utf8');
  const localAssets = [...html.matchAll(/(?:href|src)="([^"?#]+)(?:\?[^\"]*)?"/g)]
    .map((match) => match[1])
    .filter((asset) => /\.(?:css|js|png|jpe?g|webp|svg|woff2)$/i.test(asset))
    .map((asset) => path.resolve(path.dirname(page), asset));

  assert(localAssets.length > 0, `${page} must reference local assets`);
  await Promise.all(localAssets.map((asset) => access(asset)));
  assert(!html.includes('/Users/'), `${page} must not contain local user paths`);
  assetCount += localAssets.length;
}

console.log(`Static validation passed (${pages.length} pages, ${assetCount} referenced assets).`);
