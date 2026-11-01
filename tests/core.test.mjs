import test from 'node:test';
import assert from 'node:assert/strict';
import {classify, deriveIndex, deriveTitle, deriveTags, normalizeArabic, relatedIdeas, searchIdeas, suggestDirections, validateArchive, validateRaw} from '../src/core.mjs';
const entry=(id, raw, createdAt=`2026-11-01T00:00:00.000Z`)=>({id,raw,createdAt,checksum:'a'.repeat(64)});
test('raw text is returned exactly, including leading, trailing and internal whitespace',()=>{
  const raw=' \n  فكرة غير مرتبة\r\n \t';assert.equal(validateRaw(raw),raw);assert.equal(deriveIndex(entry('a',raw)).raw,raw);
  assert.throws(()=>validateRaw(' \n '));assert.throws(()=>validateRaw('a'.repeat(100001)));
});
test('derive titles from first nonempty line without modifying source',()=>{
  const raw='\n\nنص أول\nنص ثان';assert.equal(deriveTitle(raw),'نص أول');assert.equal(raw,'\n\nنص أول\nنص ثان');
});
test('Arabic normalization and deterministic category classification',()=>{
  assert.equal(normalizeArabic('إِبْدَاعــ'),'ابداع');
  assert.equal(classify('تطبيق ويب لبرمجة موقع إلكتروني'),'technology');
  assert.equal(classify('طرق تقويم التعلم وأساليب التدريس'),'education');
  assert.equal(classify('فكرة عابرة بلا مجال واضح'),'other');
});
test('metadata overrides automatic classification only in derived index',()=>{
  const raw='تطبيق على الحاسوب';const e=entry('a',raw);const idx=deriveIndex(e,{categoryOverride:'research',note:'ملاحظة مستقلة',favorite:true});
  assert.equal(idx.category,'research');assert.equal(idx.inferredCategory,'technology');assert.equal(idx.raw,raw);assert.equal(e.raw,raw);assert.equal(idx.favorite,true);
});
test('tags and suggestions are deterministic and do not replace raw content',()=>{
  const e=deriveIndex(entry('a','بحث علمي حول معادلة رياضية'));
  assert.ok(deriveTags(e.raw).length>0);assert.equal(suggestDirections(e).length,4);assert.match(suggestDirections(e)[1].body,/فرضية/);assert.equal(e.raw,'بحث علمي حول معادلة رياضية');
});
test('related links require keyword overlap, not only broad category',()=>{
  const a=deriveIndex(entry('a','برمجة تطبيق لتحليل البيانات'));
  const b=deriveIndex(entry('b','تطبيق لتحليل البيانات الصحية'));
  const c=deriveIndex(entry('c','موقع لإرسال الرسائل'));
  assert.deepEqual(relatedIdeas(a,[a,b,c]).map(x=>x.item.id),['b']);
});
test('Arabic search, categories, favorite filter and sorting',()=>{
  const arr=[deriveIndex(entry('x','تَدْرِيس التعلّم','2026-11-01T00:00:00.000Z')),deriveIndex(entry('y','تطبيق برمجة','2026-11-02T00:00:00.000Z'),{favorite:true})];
  assert.deepEqual(searchIdeas(arr,{query:'التدريس'}).map(i=>i.id),['x']);
  assert.deepEqual(searchIdeas(arr,{category:'technology'}).map(i=>i.id),['y']);
  assert.deepEqual(searchIdeas(arr,{view:'favorites'}).map(i=>i.id),['y']);
  assert.deepEqual(searchIdeas(arr).map(i=>i.id),['y','x']);
});
test('backup schema rejects malformed data, duplicates, bad checksums and orphan annotations',()=>{
  const base={format:'afkary-backup',schemaVersion:1,entries:[entry('x','نص')],annotations:[]};
  assert.equal(validateArchive(base),base);
  assert.throws(()=>validateArchive({...base,entries:[base.entries[0],base.entries[0]]}),/مكرر/);
  assert.throws(()=>validateArchive({...base,entries:[{...base.entries[0],checksum:'bad'}]}),/بصمة/);
  assert.throws(()=>validateArchive({...base,annotations:[{id:'absent',favorite:false,note:'',categoryOverride:''}]}),/غير صالحة/);
});
