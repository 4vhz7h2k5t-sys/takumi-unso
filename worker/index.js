import {initialRecruitment} from '../src/content.js';
const enc=new TextEncoder();
const noindex={'X-Robots-Tag':'noindex, nofollow, noarchive','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','X-Frame-Options':'DENY'};
const json=(data,status=200,extra={})=>Response.json(data,{status,headers:{...noindex,'Cache-Control':'no-store',...extra}});
const error=(message,status)=>json({error:message},status);
const hex=buffer=>[...new Uint8Array(buffer)].map(v=>v.toString(16).padStart(2,'0')).join('');
async function digest(s){return hex(await crypto.subtle.digest('SHA-256',enc.encode(s)))}
async function hmac(secret,s){const key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',key,enc.encode(s)))}
function constantEqual(a,b){if(a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0}
async function authenticated(request,env){if(!env.ADMIN_KEY)return false;const token=request.headers.get('Cookie')?.match(/(?:^|;\s*)takumi_session=([^;]+)/)?.[1];if(!token)return false;const [expiry,nonce,sig]=token.split('.');if(!/^\d+$/.test(expiry)||!nonce||!sig||Number(expiry)<Date.now())return false;return constantEqual(sig,await hmac(env.ADMIN_KEY,`${expiry}.${nonce}`))}
const cookie=(req,value,seconds)=>`takumi_session=${value}; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=${seconds}${new URL(req.url).protocol==='https:'?'; Secure':''}`;
function validOrigin(req){return req.headers.get('Origin')===new URL(req.url).origin}
async function readJSON(req){if(!req.headers.get('Content-Type')?.startsWith('application/json'))throw new Error('JSON形式で送信してください');if(Number(req.headers.get('Content-Length'))>24000)throw new Error('データが大きすぎます');const body=await req.text();if(body.length>24000)throw new Error('データが大きすぎます');try{return JSON.parse(body)}catch{throw new Error('入力内容を読み取れませんでした')}}
async function readContent(env){if(!env.DB)throw new Error('Database unavailable');const row=await env.DB.prepare('SELECT content, version, updated_at FROM recruitment WHERE id = 1').first();if(!row)throw new Error('Content not initialized');return {...JSON.parse(row.content),version:row.version,updatedAt:row.updated_at}}
const requiredFields=['title','summary','description','area','employment','license','salary','hours','holidays','benefits','support'];
export function validateContent(body){if(!body||typeof body!=='object')throw new Error('入力内容が不正です');if(!Number.isSafeInteger(body.version)||body.version<1)throw new Error('編集バージョンが不正です');if(typeof body.notice!=='string'||body.notice.trim().length<1||body.notice.length>600)throw new Error('掲載案内は1〜600文字で入力してください');if(!Array.isArray(body.jobs)||body.jobs.length!==2)throw new Error('職種情報が不正です');const jobs=body.jobs.map((j,i)=>{const id=i===0?'driver':'dispatcher';if(j.id!==id||!['inquiry','open','closed'].includes(j.status))throw new Error('職種・募集状況が不正です');const next={id,english:i===0?'DRIVER':'DISPATCHER',status:j.status};for(const field of requiredFields){const v=j[field];if(typeof v!=='string'||!v.trim()||v.length>(field==='title'?80:1000))throw new Error('必須項目・文字数を確認してください');next[field]=v.trim()}return next});return {notice:body.notice.trim(),jobs}}
export default {async fetch(request,env){
 const url=new URL(request.url),path=url.pathname;
 try{
  if(path==='/api/recruitment'&&request.method==='GET'){try{return json(await readContent(env))}catch{return json({...initialRecruitment,version:0,notice:'現在、最新の募集情報を取得できません。以下は公開資料に基づく職種紹介です。募集状況・条件は公式窓口にご確認ください。'},503)}}
  if(path.startsWith('/api/admin/')){
   if(!env.ADMIN_KEY||!env.DB)return error('管理機能がまだ設定されていません。',503);
   if(request.method!=='GET'&&!validOrigin(request))return error('この送信元からの操作は許可されていません。',403);
   if(path==='/api/admin/login'&&request.method==='POST'){
    const ip=request.headers.get('CF-Connecting-IP')||'local';const hash=await hmac(env.ADMIN_KEY,ip);const window=Math.floor(Date.now()/900000);const bucket=`${hash}:${window}`;
    const attempt=await env.DB.prepare('INSERT INTO login_limits (bucket, attempts, expires_at) VALUES (?,1,?) ON CONFLICT(bucket) DO UPDATE SET attempts=attempts+1 RETURNING attempts').bind(bucket,Date.now()+900000).first();
    if(attempt.attempts>5)return error('試行回数が上限に達しました。15分後にお試しください。',429);
    const body=await readJSON(request);const correct=typeof body.key==='string'&&body.key.length<=128&&constantEqual(await digest(body.key),await digest(env.ADMIN_KEY));if(!correct)return error('管理キーを確認してください。',401);
    await env.DB.prepare('DELETE FROM login_limits WHERE expires_at < ?').bind(Date.now()).run();
    const value=`${Date.now()+28800000}.${crypto.randomUUID()}`;const token=`${value}.${await hmac(env.ADMIN_KEY,value)}`;return json({ok:true},200,{'Set-Cookie':cookie(request,token,28800)});
   }
   if(path==='/api/admin/logout'&&request.method==='POST')return json({ok:true},200,{'Set-Cookie':cookie(request,'',0)});
   if(!await authenticated(request,env))return error('ログインしてください。',401);
   if(path==='/api/admin/recruitment'){
    if(request.method==='GET')return json(await readContent(env));
    if(request.method==='PUT'){
     const body=await readJSON(request),valid=validateContent(body),now=new Date().toISOString();
     const result=await env.DB.prepare('UPDATE recruitment SET content=?,version=version+1,updated_at=? WHERE id=1 AND version=?').bind(JSON.stringify(valid),now,body.version).run();
     if(result.meta.changes!==1)return error('別の画面で更新されています。再読み込みしてから編集し直してください。',409);
     return json({...valid,version:body.version+1,updatedAt:now});
    }
    return error('許可されていない操作です。',405);
   }
   return error('管理APIが見つかりません。',404);
  }
  if(path.startsWith('/api/'))return error('APIが見つかりません。',404);
  const response=await env.ASSETS.fetch(request);const headers=new Headers(response.headers);for(const [k,v] of Object.entries(noindex))headers.set(k,v);headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  headers.set('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'");
  if(path.startsWith('/admin'))headers.set('Cache-Control','no-store');return new Response(response.body,{status:response.status,headers});
 }catch(e){if(e.message?.includes('入力')||e.message?.includes('文字')||e.message?.includes('不正')||e.message?.includes('必須')||e.message?.includes('JSON')||e.message?.includes('データ'))return error(e.message,400);console.error('Request failed:',path);return error('処理できませんでした。時間をおいてお試しください。',500)}
}};
