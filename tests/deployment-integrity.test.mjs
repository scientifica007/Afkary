import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');

test('gallery entrypoint is complete, not a syntactically valid truncated file', async () => {
  const [gallery, html] = await Promise.all([read('src/gallery.mjs'), read('gallery.html')]);
  assert.ok(gallery.length > 4500, 'Gallery module unexpectedly short; deployment must stop.');
  for (const token of [
    "from './core.mjs'", "from './order.mjs'", "from './store.mjs'",
    "from './theme.mjs'", "from './time.mjs'",
    'function render()', 'function showDetail(id)', 'function bind()',
    'async function start()', 'initTheme();bind();', 'start();'
  ]) {
    assert.ok(gallery.includes(token), 'Gallery module missing: ' + token);
  }
  assert.match(html, /src="\.\/src\/gallery\.mjs(?:\?[^"]*)?"/);
  assert.match(html, /id="gallery-track"/);
  assert.match(html, /id="theme-picker"/);
});

test('idea pages use separate scripts; safe deployment does not bundle private idea data', async () => {
  const [capture, list, gallery] = await Promise.all([
    read('index.html'), read('list.html'), read('gallery.html')
  ]);
  assert.match(capture, /src="\.\/src\/app\.mjs"/);
  assert.match(list, /src="\.\/src\/list\.mjs"/);
  assert.match(gallery, /src="\.\/src\/gallery\.mjs(?:\?[^"]*)?"/);
});
