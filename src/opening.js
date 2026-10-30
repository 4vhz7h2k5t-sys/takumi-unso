import gsap from 'gsap';
import truck from './truck-loader.svg?raw';

// One bounded sequence: no canvas, looping particles, animated blur or scroll lock.
export function initLightningOpening(reduced) {
  if (document.body.dataset.page !== 'top' || reduced) return;
  try {
    if (sessionStorage.getItem('takumi-lightning-v1')) return;
    sessionStorage.setItem('takumi-lightning-v1', '1');
  } catch { return; }
  const paths = [
    'M-80 94H520L670 60H880L1030 94H1680',
    'M-80 102H520L670 68H880L1030 102H1680',
    'M-80 110H520L670 76H880L1030 110H1680',
  ];
  const sparkPositions = [[660,72],[675,66],[1030,102],[1045,104],[1335,101],[1350,103]];
  const layer = document.createElement('div');
  layer.className = 'lightning-opening';
  layer.setAttribute('aria-hidden','true');
  layer.dataset.phase='lines';
  layer.innerHTML = `<svg class="lightning-trace" viewBox="0 0 1600 180" preserveAspectRatio="none" fill="none" aria-hidden="true">${paths.map((d,i)=>`<g class="lightning-strand strand-${i}"><path class="lightning-halo" d="${d}"/><path class="lightning-line" d="${d}"/><path class="lightning-trail" d="${d}"/><path class="lightning-tip" d="${d}"/></g>`).join('')}${sparkPositions.map(([x,y],i)=>`<g class="lightning-spark" style="color:${i%2?'#efd08a':'#e694ac'}"><circle cx="${x}" cy="${y}" r="1.4" fill="currentColor"/><path d="m${x-4} ${y+2} 7 -5" stroke="currentColor" stroke-width=".8"/></g>`).join('')}</svg><div class="lightning-truck" aria-hidden="true">${truck}</div>`;
  document.body.append(layer);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let finished = false;
  let fallback;
  const onMotion = e => { if (e.matches) finish(); };
  const intro = gsap.timeline({onComplete: () => finish()});
  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(fallback);
    intro.kill();
    motion.removeEventListener('change', onMotion);
    layer.remove();
  }
  motion.addEventListener('change', onMotion);
  gsap.set(layer.querySelector('.lightning-truck'), {xPercent:-135});
  layer.querySelectorAll('.lightning-strand').forEach((strand,i) => {
    const start = .04 + i * .115;
    const line = strand.querySelector('.lightning-line');
    const halo = strand.querySelector('.lightning-halo');
    const length = line.getTotalLength();
    gsap.set([line,halo], {strokeDasharray:length, strokeDashoffset:length});
    intro.to([line,halo], {strokeDashoffset:0, duration:.46, ease:'power2.inOut'}, start);
    for (const [selector,dash] of [['.lightning-trail',110],['.lightning-tip',18]]) {
      const el = strand.querySelector(selector);
      gsap.set(el, {strokeDasharray:`${dash} ${length+200}`,strokeDashoffset:length,opacity:0});
      intro.set(el, {opacity:1}, start)
        .to(el,{strokeDashoffset:-dash,duration:.5,ease:'power2.inOut'},start)
        .to(el,{opacity:0,duration:.12},start+.43);
    }
  });
  layer.querySelectorAll('.lightning-spark').forEach((spark,i) => {
    gsap.set(spark,{opacity:0,transformOrigin:'center'});
    const start=.25+i*.065;
    intro.fromTo(spark,{opacity:0,x:0,y:0,scale:.4},{opacity:.8,duration:.035},start)
      .to(spark,{opacity:0,x:12+i%2*6,y:-5-i%3*3,scale:1.1,duration:.17,ease:'power2.out'},start+.035);
  });
  intro.set(layer,{attr:{'data-phase':'truck'}},.76).fromTo(layer.querySelector('.lightning-truck'),{xPercent:-135},{xPercent:0,duration:.7,ease:'power3.out',force3D:true},.76)
    .to(layer.querySelectorAll('.lightning-truck .wheel'),{rotation:720,transformOrigin:'50% 50%',duration:.7,ease:'power3.out'},.76)
    .set(layer,{attr:{'data-phase':'hold'}},1.46)
    .to(layer.querySelectorAll('.lightning-halo'),{opacity:.025,duration:.35},1.15)
    .to(layer,{opacity:0,duration:.32,ease:'power2.inOut'},1.72);
  fallback=setTimeout(finish,2200);
}
