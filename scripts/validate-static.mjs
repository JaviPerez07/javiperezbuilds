import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const html = await readFile('index.html', 'utf8');
const localAssets = [...html.matchAll(/(?:href|src)="((?:assets|styles|scripts)\/[^"?]+)(?:\?[^\"]*)?"/g)]
  .map((match) => match[1]);

assert(localAssets.length > 0, 'index.html must reference local assets');
await Promise.all(localAssets.map((asset) => access(asset)));
assert(!html.includes('/Users/'), 'index.html must not contain local user paths');

console.log(`Static validation passed (${localAssets.length} referenced assets).`);
