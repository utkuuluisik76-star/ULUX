'use client';

import { useMotion, motionLayout } from '@/lib/motion/runtime';

/** Flat, filled leaf motif used underneath the cap: separate lobes, never a morphing mesh. */
function LeafShape(){
 return <g fill="currentColor">
  <path d="M100 28C86 79 86 145 100 190C114 145 114 79 100 28Z"/>
  <path d="M94 26C69 75 62 129 70 174C84 134 88 76 94 26Z"/>
  <path d="M106 26C131 75 138 129 130 174C116 134 112 76 106 26Z"/>
  <path d="M90 27C52 60 30 104 37 145C55 117 71 62 90 27Z"/>
  <path d="M110 27C148 60 170 104 163 145C145 117 129 62 110 27Z"/>
  <path d="M86 29C42 36 15 62 19 94C40 75 63 46 86 29Z"/>
  <path d="M114 29C158 36 185 62 181 94C160 75 137 46 114 29Z"/>
 </g>;
}

export function LeafIntro({hint}:{hint:string}){
 useMotion(({gsap,ScrollTrigger})=>{
  const root=document.getElementById('first-look');
  const cover=root?.querySelector<HTMLElement>('.leaf-intro-cover');
  const overlay=root?.querySelector<HTMLElement>('.leaf-intro');
  const content=root?.querySelector<HTMLElement>('.cap-stage-content');
  const entry=root?.querySelector<HTMLElement>('#cap-view');
  if(!root||!cover||!overlay||!content||!entry)return;
  const mm=gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)',()=>{
   if(!motionLayout())return;
   const ink=root.querySelector<SVGElement>('.leaf-intro-ink');
   const shapes=[...root.querySelectorAll<SVGElement>('.leaf-intro-scale')];
   const caption=root.querySelector<HTMLElement>('.leaf-intro-caption');
   const link=root.querySelector<HTMLAnchorElement>('.leaf-intro-hint');
   const measure=()=>{
    const w=cover.clientWidth,h=cover.clientHeight,size=Math.min(h*.55,Math.min(360,Math.max(210,w*.26)));
    root.querySelectorAll<SVGSVGElement>('.leaf-intro-symbol').forEach(symbol=>{
     symbol.setAttribute('width',String(size));symbol.setAttribute('height',String(size));
     symbol.setAttribute('x',String((w-size)/2));symbol.setAttribute('y',String((h-size)/2));
    });
   };
   measure();
   const value={p:0};let revealed:boolean|undefined;
   const draw=()=>{
    const p=value.p,scale=Math.exp(Math.log(34)*p);
    // Keep the full-screen green surface at viewport size. Scaling that entire masked surface
    // makes Chromium reuse clipped raster tiles on reverse scrubs (visible green rectangles).
    // Only the vector leaf inside the fixed mask changes scale; its viewport can overflow.
    shapes.forEach(shape=>{shape.style.transform=`scale(${scale})`;});
    cover.style.opacity=String(1-gsap.utils.clamp(0,1,(p-.68)/.3));
    if(ink)ink.style.opacity=String(1-gsap.utils.clamp(0,1,p/.2));
    if(caption)caption.style.opacity=String(1-gsap.utils.clamp(0,1,p/.14));
    const done=p>=.985;
    if(done!==revealed){
     revealed=done;content.inert=!done;overlay.style.pointerEvents=done?'none':'auto';
     overlay.style.visibility=done?'hidden':'visible';if(link)link.tabIndex=done?-1:0;
     root.dataset.introRevealed=String(done);
    }
   };
   const tween=gsap.fromTo(value,{p:0},{p:1,immediateRender:false,ease:'none',onUpdate:draw,scrollTrigger:{
    trigger:root,start:'top top',end:()=>`+=${Math.max(1,entry.offsetTop)}`,scrub:.35,
    invalidateOnRefresh:true,onRefreshInit:measure,
    onRefresh:self=>{self.animation?.progress(self.progress);value.p=self.progress;draw();},
    onToggle:({isActive})=>{cover.style.willChange=isActive?'opacity':'auto';},
   }});
   // The visitor can scroll before this lazy module arrives. Start at the actual scroll position,
   // not at the beginning of the overlay, and retain the full 0→1 range for reverse scrolling.
   ScrollTrigger.refresh();
   tween.progress(tween.scrollTrigger?.progress??0);draw();root.dataset.introReady='true';
   return()=>{
    tween.scrollTrigger?.kill();tween.kill();content.inert=false;
    cover.style.removeProperty('transform');cover.style.removeProperty('opacity');cover.style.removeProperty('will-change');
    shapes.forEach(shape=>shape.style.removeProperty('transform'));
    overlay.style.removeProperty('visibility');overlay.style.removeProperty('pointer-events');
    ink?.style.removeProperty('opacity');caption?.style.removeProperty('opacity');
    if(link)link.tabIndex=0;delete root.dataset.introReady;delete root.dataset.introRevealed;
   };
  });
  return()=>mm.revert();
 },{near:'first-look',start:'idle'});
 return <div className="leaf-intro">
  <div className="leaf-intro-cover" aria-hidden="true">
   <svg width="100%" height="100%" focusable="false">
    <defs><mask id="ulux-leaf-window" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%" style={{maskType:'luminance'}}>
     <rect width="100%" height="100%" fill="white"/>
     <svg className="leaf-intro-symbol" overflow="visible" x="35%" y="25%" width="30%" height="50%" viewBox="0 0 200 200" style={{color:'black'}}><g className="leaf-intro-scale"><LeafShape/></g></svg>
    </mask></defs>
    <rect width="100%" height="100%" fill="#173f34" mask="url(#ulux-leaf-window)"/>
    <svg className="leaf-intro-symbol leaf-intro-ink" overflow="visible" x="35%" y="25%" width="30%" height="50%" viewBox="0 0 200 200" style={{color:'#fff'}}><g className="leaf-intro-scale"><LeafShape/></g></svg>
   </svg>
  </div>
  <div className="leaf-intro-caption"><a className="leaf-intro-hint" href="#cap-view">{hint}<span aria-hidden="true">↓</span></a></div>
 </div>;
}
