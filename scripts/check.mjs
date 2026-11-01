import { readFile,access } from 'node:fs/promises';
const root=new URL('../',import.meta.url);
for(const p of ['index.html','archive.html','gallery.html','list.html','styles.css','src/app.mjs','src/store.mjs','src/model.mjs','src/archive.mjs','src/speech.mjs'])await access(new URL(p,root));
const code=await readFile(new URL('src/archive.mjs',root),'utf8');
if(code.length<7000||!code.includes('async function refresh()')||!code.includes('function showIdea(idea)'))throw Error('Archive module incomplete: release blocked');
console.log('Afkary release assets validated.');
