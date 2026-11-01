import test from 'node:test';
import assert from 'node:assert/strict';
import {projectIdeas,ideaMatches} from '../src/model.mjs';
import { readFile } from 'node:fs/promises';
const e={id:'a',raw:'  فكرة الأصل\n',createdAt:'2026-11-01T09:00:00.000Z',checksum:'a'.repeat(64)};
const snapshot=()=>({entries:[{...e}],annotations:[],revisions:[],comments:[],collections:[],trash:[]});
test('legacy original remains byte-for-byte intact when revisions are projected',()=>{
 const data=snapshot();data.revisions.push({id:'v1',ideaId:'a',number:1,raw:'نسخة معدلة',checksum:'b'.repeat(64),createdAt:'2026-11-01T10:00:00.000Z'});
 const item=projectIdeas(data)[0];assert.equal(item.raw,'نسخة معدلة');assert.equal(item.originalRaw,'  فكرة الأصل\n');assert.equal(data.entries[0].raw,'  فكرة الأصل\n');assert.equal(item.revisionCount,1);
});
test('trash is invisible to active archive and reversible without deleting records',()=>{
 const data=snapshot();data.trash=[{id:'a',deletedAt:'2026-11-01T10:00:00Z'}];
 assert.equal(projectIdeas(data).length,0);assert.equal(projectIdeas(data,{deleted:true})[0].raw,e.raw);
});
test('custom folders and categories are optional, searchable and do not overwrite inferred classification',()=>{
 const data=snapshot();data.collections=[{id:'folder-1',type:'folder',name:'مشاريعي'},{id:'cat-1',type:'category',name:'أبحاث خاصة'}];
 data.annotations=[{id:'a',favorite:false,note:'',categoryOverride:'',folderId:'folder-1',customCategoryId:'cat-1'}];
 const item=projectIdeas(data)[0];assert.equal(item.folderId,'folder-1');assert.equal(item.customCategoryId,'cat-1');
 assert.ok(ideaMatches(item,{query:'مشاريعي'},data.collections));assert.ok(ideaMatches(item,{folder:'folder-1',customCategory:'cat-1'},data.collections));
 assert.ok(!ideaMatches(item,{folder:'other'},data.collections));
});
test('capture supports optional speech with clear fallback and archive provides three layouts',async()=>{
 const base=new URL('../',import.meta.url);
 const [index,archive,speech]=await Promise.all(['index.html','archive.html','src/speech.mjs'].map(f=>readFile(new URL(f,base),'utf8')));
 assert.match(index,/dictate-button/);assert.match(index,/ما الذي يدور في ذهنك/);
 for(const id of ['view-horizontal','view-vertical','view-grid','show-trash','archive-search'])assert.ok(archive.includes(`id="${id}"`));
 assert.match(speech,/webkitSpeechRecognition/);assert.match(speech,/interimResults=true/);
});
