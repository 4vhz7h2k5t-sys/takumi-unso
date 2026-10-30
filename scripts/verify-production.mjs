import assert from 'node:assert/strict';import{readFileSync,writeFileSync}from'node:fs';
const base='https://takumi-unso.ur24-jp.workers.dev';const checks=[];
for(const path of ['/','/company/','/recruit/','/admin/']){const r=await fetch(base+path);const html=await r.text();assert.equal(r.status,200);assert.match(r.headers.get('X-Robots-Tag'),/noindex/);assert.match(html,/<meta name="robots" content="noindex,nofollow,noarchive">/);assert.match(html,/非公式/);checks.push({path,status:r.status,noindex:true})}
const robots=await fetch(base+'/robots.txt');assert.match(await robots.text(),/Disallow: \//);
const pub=await fetch(base+'/api/recruitment');assert.equal(pub.status,200);const data=await pub.json();assert.equal(data.jobs.length,2);assert.ok(Number.isSafeInteger(data.version)&&data.version>=1);assert.ok(data.jobs.every(j=>['inquiry','open','closed'].includes(j.status)));checks.push({path:'/api/recruitment',status:200,jobs:data.jobs.length,version:data.version});
const key=readFileSync('.dev.vars','utf8').match(/^ADMIN_KEY=(.+)$/m)[1];
const login=await fetch(base+'/api/admin/login',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({key})});assert.equal(login.status,200);assert.match(login.headers.get('Set-Cookie'),/; Secure/);const cookie=login.headers.get('Set-Cookie').split(';')[0];
const admin=await fetch(base+'/api/admin/recruitment',{headers:{Cookie:cookie}});assert.equal(admin.status,200);assert.equal((await admin.json()).version,data.version);
const logout=await fetch(base+'/api/admin/logout',{method:'POST',headers:{Origin:base,'Content-Type':'application/json',Cookie:cookie},body:'{}'});assert.equal(logout.status,200);
assert.equal((await fetch(base+'/api/admin/recruitment')).status,401);assert.equal((await fetch(base+'/missing-page')).status,404);checks.push({cmsAuthentication:true,secureCookie:true,privateApiGuard:true,notFound:true});
writeFileSync('docs/production-check.json',JSON.stringify({checkedAt:new Date().toISOString(),base,checks},null,2)+'\n');console.log('PASS: production pages, noindex, robots, recruitment DB, CMS authentication, Secure cookie, logout, 401 guard, 404');
