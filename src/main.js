import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import scene from './scene.svg?raw';
import {initialRecruitment} from './content.js';
import {initAdmin} from './admin.js';
import {renderJobMarkup} from './render-jobs.js';
gsap.registerPlugin(ScrollTrigger);
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const menu=document.querySelector('.menu-button'), mobileNav=document.querySelector('.mobile-nav');
function closeMenu(){document.querySelector('main').inert=false;document.querySelector('.site-footer').inert=false;menu.setAttribute('aria-expanded','false');mobileNav.classList.remove('is-open');mobileNav.inert=true;document.body.classList.remove('menu-open')}
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));mobileNav.classList.toggle('is-open',open);mobileNav.inert=!open;document.body.classList.toggle('menu-open',open);document.querySelector('main').inert=open;document.querySelector('.site-footer').inert=open;if(open)requestAnimationFrame(()=>mobileNav.querySelector('a').focus())});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus()}if(e.key==='Tab'&&menu?.getAttribute('aria-expanded')==='true'){const links=[menu,...mobileNav.querySelectorAll('a')];if(e.shiftKey&&document.activeElement===links[0]){e.preventDefault();links.at(-1).focus()}else if(!e.shiftKey&&document.activeElement===links.at(-1)){e.preventDefault();links[0].focus()}}});
matchMedia('(min-width: 761px)').addEventListener('change',e=>{if(e.matches)closeMenu()});
if(!reduced){gsap.utils.toArray('.reveal').forEach(el=>gsap.from(el,{y:32,opacity:0,duration:1,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 92%',once:true}}))}
function initJourney(){
 const section=document.querySelector('.journey');if(!section)return;
 const stage=section.querySelector('.journey-stage');stage.querySelector('.scene-mount').innerHTML=scene;
 const mobile=matchMedia('(max-width:760px)').matches;
 const $=s=>stage.querySelector(s);const $$=s=>[...stage.querySelectorAll(s)];
 const steps=[{en:'LOAD.',ja:'その一荷に、<br>向き合う。',desc:'形も、重さも、毎回違う。<br>荷物に合わせた一台から、輸送が始まる。',label:'01 — 積載 / LOADING'}, {en:'SECURE.',ja:'動かさない、<br>という技術。',desc:'積むだけでは、走り出せない。<br>荷物を守る確認が、次の道をつくる。',label:'02 — 固縛 / SECURING'}, {en:'TRANSPORT.',ja:'その先で、<br>待つ人のもとへ。',desc:'広島・黒瀬から、日本全国へ。<br>濃緑の一台が、次の現場をつないでいく。',label:'03 — 輸送 / ON THE ROAD'}, {en:'DELIVER.',ja:'届けた先で、<br>また、動き出す。',desc:'一つの輸送が、次の仕事の始まりになる。<br>運ぶのは、現場を動かす力。',label:'04 — 到着 / ARRIVAL'}];
 let current=-1;
 function showStep(i){if(current===i)return;current=i;$('.journey-number').textContent=`0${i+1} / 04`;$('.journey-en').textContent=steps[i].en;$('.journey-text h2').innerHTML=steps[i].ja;$('.journey-description').innerHTML=steps[i].desc;$('.annotation-text').textContent=steps[i].label;$$('[data-chapter]').forEach((b,n)=>n===i?b.setAttribute('aria-current','step'):b.removeAttribute('aria-current'));}
 const tl=gsap.timeline({paused:true,defaults:{ease:'power1.inOut'}});
 gsap.set($('#vehicle-camera'),{scale:mobile?.66:1,svgOrigin:'800 660'});
 gsap.set($('#cargo'),{y:-95});gsap.set($('#crane-hook'),{y:-95});gsap.set([$('#straps'),$('#strap-buckles')],{autoAlpha:0});
 const strapPaths=$$('#straps path');strapPaths.forEach(p=>{const len=p.getTotalLength();gsap.set(p,{strokeDasharray:len,strokeDashoffset:len})});
 tl.to({}, {duration:12},0)
 .to($('#cargo'),{y:0,duration:1.65},.3).to($('#crane-hook'),{y:0,duration:1.65},.3)
 .to($('#lifting-slings'),{autoAlpha:0,duration:.4},2)
 .to($('#crane-hook'),{y:-95,duration:1},2.2)
 .set($('#straps'),{autoAlpha:1},3).to(strapPaths,{strokeDashoffset:0,duration:1.15,stagger:.15},3)
 .to($('#strap-buckles'),{autoAlpha:1,duration:.4},4)
 .to($('#warehouse'),{x:-600,autoAlpha:0,duration:1.2},5)
 .to($('#crane'),{x:-600,autoAlpha:0,duration:1.2},5)
 .to([$('#guides'),$('#scene-labels')],{autoAlpha:0,duration:.4},5)
 .to($('#landscape'),{autoAlpha:1,duration:1.1},5.2)
 .to(stage,{backgroundColor:'#183e30',duration:1.5},5.2)
 .to($('#ground'),{fill:'#4a6550',duration:1.5},5.2)
 .to([$('#road'),$('#road-markings')],{autoAlpha:1,duration:.9},5.6)
 .to($('#far-mountains'),{x:-260,duration:3.8,ease:'none'},5.5)
 .to($('#near-mountains'),{x:-450,duration:3.8,ease:'none'},5.5)
 .to($('#trees'),{x:-780,duration:3.8,ease:'none'},5.5)
 .to($('#road-markings'),{x:-850,duration:3.8,ease:'none'},5.5)
 .to($$('.wheel'),{rotation:990,transformOrigin:'50% 50%',duration:3.8,ease:'none'},5.5)
 .to($('#truck'),{y:'-=2',duration:.12,yoyo:true,repeat:19,ease:'none'},6)
 .to($('#landscape'),{autoAlpha:0,duration:1.1},9)
 .fromTo($('#destination'),{x:400,autoAlpha:0},{x:0,autoAlpha:1,duration:1.2},9)
 .to(stage,{backgroundColor:'#e1e4d7',duration:1.2},9)
 .to($('#ground'),{fill:'#c4c9b8',duration:1.2},9)
 .to([$('#road'),$('#road-markings')],{autoAlpha:0,duration:1},9)
 .set($('#crane'),{x:0},10)
 .to($('#crane'),{autoAlpha:1,duration:.5},10)
 .to($('#crane-hook'),{y:0,duration:.65},10)
 .to($('#lifting-slings'),{autoAlpha:1,duration:.3},10.5)
 .to([$('#straps'),$('#strap-buckles')],{autoAlpha:0,duration:.35},10.6)
 .to($('#cargo'),{y:-95,duration:.9},10.95)
 .to($('#crane-hook'),{y:-95,duration:.9},10.95);
 function update(p){showStep(Math.min(3,Math.floor(p*4)));stage.classList.toggle('is-night',p>.505&&p<.79);gsap.set($('.journey-progress>i'),{scaleX:p})}
 tl.eventCallback('onUpdate',()=>{const y=Number(gsap.getProperty($('#crane-hook'),'y'));$('#crane-cables path').setAttribute('d',`M653 174V${270+y}M682 174V${270+y}`);update(tl.progress())});
 if(!reduced){ScrollTrigger.create({trigger:section,start:'top top',end:'bottom bottom',scrub:.65,animation:tl,invalidateOnRefresh:true});showStep(0)}else{tl.progress(.37);showStep(1);gsap.set($('.journey-progress>i'),{scaleX:.37})}
 $$('[data-chapter]').forEach(b=>b.addEventListener('click',()=>{const i=Number(b.dataset.chapter);const p=[.01,.29,.57,.86][i];if(reduced){tl.progress(p);update(p)}else{const top=section.getBoundingClientRect().top+scrollY;window.scrollTo({top:top+(section.offsetHeight-innerHeight)*p,behavior:'smooth'})}}));
 // Refresh when the responsive layout changes, preserving the real vehicle proportions.
 const mq=matchMedia('(max-width:760px)');mq.addEventListener('change',()=>{gsap.set($('#vehicle-camera'),{scale:mq.matches?.66:1,svgOrigin:'800 660'});ScrollTrigger.refresh()});
 window.addEventListener('load',()=>ScrollTrigger.refresh(),{once:true});
}
function renderJobs(data,offline=false){
 const list=document.querySelector('#job-list');if(!list)return;
 document.querySelector('#recruitment-notice').textContent=(offline?'通信により最新情報を取得できなかったため、公開資料に基づく職種紹介を表示しています。 ':'')+data.notice;
 list.innerHTML=renderJobMarkup(data);
 list.setAttribute('aria-busy','false');document.querySelector('#jobs-update').textContent=`CONTENT UPDATED / ${String(data.updatedAt).slice(0,10)}${offline?' — PUBLIC SOURCE REFERENCE':''}`;
}
async function initRecruitment(){if(!document.querySelector('#job-list'))return;try{const r=await fetch('/api/recruitment',{signal:AbortSignal.timeout(6000)});if(!r.ok)throw new Error('Unable to load');const data=await r.json();if(!Array.isArray(data.jobs))throw new Error('Invalid response');renderJobs(data)}catch{renderJobs(initialRecruitment,true)}}
initJourney();initRecruitment();if(document.body.dataset.page==='admin')initAdmin();
