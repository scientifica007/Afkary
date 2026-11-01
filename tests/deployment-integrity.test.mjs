import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
test('archive JavaScript is complete, pages refer to the unified archive and legacy URLs redirect',async()=>{
 const [code,archive,index,oldHorizontal,oldVertical]=await Promise.all(['src/archive.mjs','archive.html','index.html','gallery.html','list.html'].map(read));
 assert.ok(code.length>7000,'archive script appears truncated');
 for(const token of ["from './store.mjs'",'async function refresh()','function showIdea(idea)','function render()','function bind()','start();','restoreIdea','deletePermanently'])assert.ok(code.includes(token),'missing '+token);
 for(const id of ['view-horizontal','view-vertical','view-grid','archive-results','show-trash'])assert.ok(archive.includes(`id="${id}"`));
 assert.match(archive,/src="\.\/src\/archive\.mjs"/);assert.match(index,/href="\.\/archive\.html"/);
 assert.match(oldHorizontal,/archive\.html\?view=horizontal/);assert.match(oldVertical,/archive\.html\?view=vertical/);
});
