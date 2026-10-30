import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const base='http://127.0.0.1:8793';const key=readFileSync('.dev.vars','utf8').match(/^ADMIN_KEY=(.+)$/m)[1];
const call=(path,method='GET',body,cookie,origin=base)=>fetch(base+path,{method,headers:{'Content-Type':'application/json',...(method==='GET'?{}:{Origin:origin}),...(cookie?{Cookie:cookie}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{})});
assert.equal((await call('/api/admin/recruitment')).status,401);
assert.equal((await call('/api/admin/login','POST',{key},null,'https://wrong.example')).status,403);
assert.equal((await call('/api/admin/login','POST',{key:'wrong'})).status,401);
const login=await call('/api/admin/login','POST',{key});assert.equal(login.status,200);const cookie=login.headers.get('Set-Cookie').split(';')[0];assert.match(login.headers.get('Set-Cookie'),/HttpOnly; SameSite=Strict/);
const before=await (await call('/api/admin/recruitment','GET',undefined,cookie)).json();const edited={...before,notice:before.notice+' [LOCAL CMS TEST]'};
try{
 const save=await call('/api/admin/recruitment','PUT',edited,cookie);assert.equal(save.status,200);const after=await save.json();assert.equal(after.version,before.version+1);
 assert.equal((await (await call('/api/recruitment')).json()).notice,edited.notice);
 assert.equal((await call('/api/admin/recruitment','PUT',edited,cookie)).status,409);
 assert.equal((await call('/api/admin/recruitment','PUT',{...after,jobs:[]},cookie)).status,400);
 const restore=await call('/api/admin/recruitment','PUT',{...before,version:after.version},cookie);assert.equal(restore.status,200);
 assert.equal((await (await call('/api/recruitment')).json()).notice,before.notice);
}finally{const now=await (await call('/api/admin/recruitment','GET',undefined,cookie)).json();if(now.notice!==before.notice)await call('/api/admin/recruitment','PUT',{...before,version:now.version},cookie)}
const logout=await call('/api/admin/logout','POST',{},cookie);assert.equal(logout.status,200);assert.match(logout.headers.get('Set-Cookie'),/Max-Age=0/);
const page=await call('/');assert.equal(page.status,200);assert.match(page.headers.get('X-Robots-Tag'),/noindex/);assert.match(page.headers.get('Content-Security-Policy'),/frame-ancestors 'none'/);
assert.equal((await call('/unknown-page')).status,404);
console.log('PASS: CMS login, origin guard, cookie, authenticated update, public persistence, conflict, validation, restore, logout, noindex, 404');
