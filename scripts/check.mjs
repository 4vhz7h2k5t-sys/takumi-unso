import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {validateContent} from '../worker/index.js';
import {initialRecruitment} from '../src/content.js';
for(const page of ['index.html','company/index.html','recruit/index.html','admin/index.html']){
 const html=readFileSync('dist/'+page,'utf8');assert.match(html,/<html lang="ja">/);assert.match(html,/noindex,nofollow,noarchive/);assert.match(html,/非公式デモ/);assert.equal((html.match(/<h1[ >]/g)||[]).length,1);
 for(const [,src] of html.matchAll(/(?:src|href)="(\/(?:images|assets|fonts)\/[^"?#]+)"/g))assert.ok(existsSync('dist'+src),`Missing ${src}`);
}
const good={...initialRecruitment,version:1};assert.equal(validateContent(good).jobs.length,2);
for(const bad of [null,{...good,version:0},{...good,notice:''},{...good,jobs:[]},{...good,jobs:[{...good.jobs[0],status:'maybe'},good.jobs[1]]},{...good,jobs:[{...good.jobs[0],salary:'x'.repeat(1001)},good.jobs[1]]}])assert.throws(()=>validateContent(bad));
console.log('PASS: built pages, noindex, local assets, recruitment validation');
