import test from 'node:test';
import assert from 'node:assert/strict';
import { orderIdeas } from '../src/order.mjs';
import { validTheme, readTheme, THEMES } from '../src/theme.mjs';
const fixture = [
  { id:'b', title:'بداية', category:'technology', createdAt:'2026-11-01T10:00:00.000Z', raw:'  نص  ' },
  { id:'a', title:'أصل', category:'research', createdAt:'2026-11-01T09:00:00.000Z', raw:'أصل\n' },
  { id:'c', title:'جديد', category:'education', createdAt:'2026-11-01T11:00:00.000Z', raw:'رأي' }
];
test('all five sort directions preserve original raw entries and input array',()=>{
  const before=structuredClone(fixture);
  assert.deepEqual(orderIdeas(fixture,'newest').map(x=>x.id),['c','b','a']);
  assert.deepEqual(orderIdeas(fixture,'oldest').map(x=>x.id),['a','b','c']);
  assert.deepEqual(orderIdeas(fixture,'alphabetical').map(x=>x.id),['a','b','c']);
  assert.deepEqual(orderIdeas(fixture,'alphabetical-desc').map(x=>x.id),['c','b','a']);
  assert.deepEqual(orderIdeas(fixture,'category').map(x=>x.id),['c','b','a']);
  assert.deepEqual(fixture,before);
});
test('five theme presets have distinct safe identifiers and invalid storage reverts to default',()=>{
  assert.equal(THEMES.length,5);
  assert.equal(new Set(THEMES.map(t=>t.id)).size,5);
  assert.equal(validTheme('<script>alert(1)</script>'),'charcoal');
  assert.equal(readTheme({getItem:()=> 'oasis'}),'oasis');
  assert.equal(readTheme({getItem:()=> { throw Error('denied');}}),'charcoal');
});
