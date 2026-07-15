import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const htmlFiles = ['index.html', 'auditoria.html'];
const htmlDocuments = await Promise.all(htmlFiles.map((file) => readFile(file, 'utf8')));
const localAssets = htmlDocuments.flatMap((html) =>
  [...html.matchAll(/(?:href|src)="((?:assets|styles|scripts)\/[^"?]+)(?:\?[^\"]*)?"/g)]
    .map((match) => match[1])
);

assert(localAssets.length > 0, 'HTML must reference local assets');
await Promise.all(localAssets.map((asset) => access(asset)));
htmlDocuments.forEach((html, index) => {
  assert(!html.includes('/Users/'), `${htmlFiles[index]} must not contain local user paths`);
});

console.log(`Static validation passed (${localAssets.length} referenced assets).`);
