import gsap from 'gsap';

export function initHeroReveal(reduced) {
  const story=document.querySelector('.hero-scroll-story');
  if(!story)return;
  const hero=story.querySelector('.hero-fullscreen');
  const copy=hero.querySelector('.hero-copy');
  const eyebrow=copy.querySelector('.eyebrow');
  const lines=[...copy.querySelectorAll('.hero-line')];
  const description=copy.querySelector('.hero-description');
  const link=copy.querySelector('.hero-scroll');
  const band=hero.querySelector('.hero-bottom');
  const caption=hero.querySelector('.hero-photo-index');
  if(reduced){gsap.set([copy,band,caption],{autoAlpha:1});return}
  // The photograph stays in the native sticky stage while real scroll reveals copy.
  // A single timeline, no pin spacer, scroll interception or time-based text reveal.
  gsap.set([eyebrow,...lines,description],{opacity:0,y:22});
  gsap.set(link,{autoAlpha:0,y:22});
  gsap.set(copy,{autoAlpha:1});
  gsap.set([band,caption],{autoAlpha:0});
  gsap.set(hero.querySelector('.hero-shade'),{opacity:.28});
  const reveal=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:story,start:'top top',end:'bottom bottom',scrub:true,invalidateOnRefresh:true}});
  reveal.to({}, {duration:1},0)
    .to(hero.querySelector('.hero-photo'),{scale:1.065,duration:1},0)
    .to(hero.querySelector('.hero-shade'),{opacity:1,duration:.35},.04)
    .to(eyebrow,{opacity:1,y:0,duration:.16},.06)
    .to(lines,{opacity:1,y:0,duration:.23,stagger:.075},.15)
    .to(description,{opacity:1,y:0,duration:.19},.46)
    .to(link,{autoAlpha:1,y:0,duration:.18},.61)
    .to(caption,{autoAlpha:1,duration:.18},.5)
    .to(band,{autoAlpha:1,duration:.2},.53);
}
