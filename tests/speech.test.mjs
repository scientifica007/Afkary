import test from 'node:test';
import assert from 'node:assert/strict';
import {SpeechLedger,removeReplay} from '../src/speech-ledger.mjs';
import {installSpeech} from '../src/speech.mjs';
const result=(s,isFinal)=>Object.assign([{transcript:s}],{isFinal});
test('cumulative result callbacks never append old final words twice',()=>{
 const l=new SpeechLedger('قبل');l.nextSession();
 l.ingest([result('هذا اختبار مباشر للتسجيل',true)]);
 l.ingest([result('هذا اختبار مباشر للتسجيل',true),result('الصوتي',false)]);
 assert.equal(l.text(),'قبل هذا اختبار مباشر للتسجيل الصوتي');
 l.ingest([result('هذا اختبار مباشر للتسجيل',true),result('الصوتي',true)]);
 l.finalize();assert.equal(l.text(),'قبل هذا اختبار مباشر للتسجيل الصوتي');
});
test('cross-session replay is removed but intentional single words remain',()=>{
 const l=new SpeechLedger('');l.nextSession();l.ingest([result('هذه فكرة مفيدة للغاية',true)]);l.finalize();
 l.nextSession(true);l.ingest([result('فكرة مفيدة للغاية ويمكن تنفيذها',true)]);
 assert.equal(l.text(),'هذه فكرة مفيدة للغاية ويمكن تنفيذها');
 assert.equal(removeReplay('نعم','نعم'),'نعم');
});
test('unconfirmed words are preserved with limited two-word replay protection',()=>{
 const l=new SpeechLedger('');l.nextSession();l.ingest([result('هذه عبارة لم تكتمل',false)]);
 assert.equal(l.finalize({keepInterim:true}).provisional,true);
 l.nextSession(true);l.ingest([result('لم تكتمل وسوف تكتمل',true)]);
 assert.equal(l.text(),'هذه عبارة لم تكتمل وسوف تكتمل');
});
test('unsupported recognizer offers clickable explanation instead of disabling input',()=>{
 const b={textContent:'',disabled:false,addEventListener(_type,fn){this.click=fn;}},s={textContent:''},input={focus(){this.focused=true;}};
 installSpeech({input,button:b,status:s,Recognition:null});
 b.click();assert.equal(input.focused,true);assert.match(s.textContent,/لا يوفّر/);
});
test('focus controls are kept in one row and toolbar button is reparented',async()=>{
 const {readFile}=await import('node:fs/promises');const root=new URL('../',import.meta.url);
 const [html,style,js]=await Promise.all(['index.html','styles.css','src/workspace.mjs'].map(f=>readFile(new URL(f,root),'utf8')));
 assert.match(html,/class="composer-footer">\s*<div class="voice-row">/);
 assert.match(style,/body\.focus-mode \.composer-footer\{display:flex;flex-direction:row/);
 assert.match(js,/controls\.append\(focusButton\)/);
});
