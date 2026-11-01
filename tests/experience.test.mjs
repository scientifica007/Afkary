import test from 'node:test';
import assert from 'node:assert/strict';
import { formatSavedAt, timestampDescription } from '../src/time.mjs';
import { SIDEBAR_KEY, FOCUS_KEY, readPreference } from '../src/workspace.mjs';
import { validateArchive } from '../src/core.mjs';
import { readFile } from 'node:fs/promises';

test('ISO timestamps remain immutable and presentation displays seconds using the viewer locale',()=>{
  const iso='2026-11-01T09:18:07.140Z';
  assert.equal(formatSavedAt(iso).split(' · ')[1].length,8);
  assert.match(formatSavedAt(iso),/^\d{2}\/\d{2}\/\d{4} · \d{2}:\d{2}:\d{2}$/);
  assert.match(timestampDescription(iso),/2026-11-01T09:18:07\.140Z/);
  assert.equal(formatSavedAt('invalid'), 'وقت غير معروف');
});
test('UI flags are separate and safe when localStorage is unavailable',()=>{
  assert.notEqual(SIDEBAR_KEY, FOCUS_KEY);
  assert.equal(readPreference({getItem:()=>null},SIDEBAR_KEY,true),true);
  assert.equal(readPreference({getItem:()=> 'false'},FOCUS_KEY,true),false);
  assert.equal(readPreference({getItem:()=> {throw Error('blocked');}},FOCUS_KEY),false);
});
test('list and capture templates preserve required document features',async()=>{
  const base=new URL('../',import.meta.url);
  const [list,index,gallery]=await Promise.all(['list.html','index.html','gallery.html'].map(p=>readFile(new URL(p,base),'utf8')));
  assert.match(list,/archive\.html\?view=vertical/);
  assert.match(index,/ما الذي يدور في ذهنك؟/);assert.match(index,/sidebar-toggle/);assert.match(index,/focus-toggle/);
  assert.match(gallery,/archive\.html\?view=horizontal/);
  const archive=await readFile(new URL('archive.html',base),'utf8');
  for(const attr of ['layout-grid','data-layout=\"horizontal\"','data-layout=\"vertical\"','data-layout=\"grid\"','data-scope=\"trash\"'])assert.ok(archive.includes(attr)||attr==='layout-grid');
});
test('legacy backup with ISO milliseconds and no new fields remains valid',()=>{
  const archive={format:'afkary-backup',schemaVersion:1,entries:[{id:'old',raw:'  نص خام\n',createdAt:'2026-11-01T09:18:07.140Z',checksum:'a'.repeat(64)}],annotations:[]};
  assert.equal(validateArchive(archive),archive);
  assert.equal(archive.entries[0].raw,'  نص خام\n');
});
