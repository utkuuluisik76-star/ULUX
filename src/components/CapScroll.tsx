'use client';

import { useEffect, useRef } from 'react';

type Props = { labels: readonly string[]; description: string; dragLabel:string; resetLabel:string; keyboardHelp:string };
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const ease=(v:number)=>{const p=clamp(v);return p*p*(3-2*p);};

export function CapScroll({labels,description,dragLabel,resetLabel,keyboardHelp}:Props) {
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const host=ref.current,section=document.getElementById('first-look');
    if(!host||!section)return;
    const root=section;
    const photo=root.querySelector<HTMLElement>('.hero-product');
    const heading=root.querySelector<HTMLElement>('.hero-heading');
    const title=root.querySelector<HTMLElement>('[data-cap-title]');
    const note=root.querySelector<HTMLElement>('[data-cap-note]');
    const progressBar=root.querySelector<HTMLElement>('[data-cap-progress]');
    const dots=[...root.querySelectorAll<HTMLElement>('[data-cap-step]')];
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer=matchMedia('(pointer:fine) and (hover:hover)');
    const resetButton=root.querySelector<HTMLButtonElement>('[data-cap-reset]');
    const anglePictures=[...root.querySelectorAll<HTMLElement>('[data-product-angle]')];
    const angleName=root.querySelector<HTMLElement>('[data-cap-angle-name]');
    const angleButtons=[...root.querySelectorAll<HTMLButtonElement>('[data-angle-direction]')];
    let angle=0,anglesLoaded=false,dragOriginAngle=0;
    const setAngle=(next:number)=>{
      if(!anglesLoaded&&next!==0)return;
      angle=((next%anglePictures.length)+anglePictures.length)%anglePictures.length;
      anglePictures.forEach((el,i)=>{el.hidden=i!==angle;});
      if(photo)photo.dataset.capAngle=String(angle);
      if(angleName)angleName.textContent=labels[angle];
      angleButtons.forEach(button=>{
        const destination=(angle+Number(button.dataset.angleDirection)+anglePictures.length)%anglePictures.length;
        button.setAttribute('aria-label',labels[destination]);
      });
    };
    // Decode all external views before enabling switches; no intermediate blended silhouettes.
    const loadAngles=async()=>{
      try{await Promise.all(anglePictures.flatMap(el=>[...el.querySelectorAll('img')]).map(img=>{img.loading='eager';return img.decode();}));
        if(!cancelled){anglesLoaded=true;setAngle(angle);angleButtons.forEach(b=>b.disabled=false);root.dataset.capAnglesReady='true';}
      }catch{root.dataset.capAnglesReady='false';}
    };
    let scene=false,cancelled=false,loading=false,inView=false,raf=0,lastPhase=-1;
    let progress=0,targetProgress=0,lastTime=0,lastScrollTime=-Infinity,top=0,distance=1;
    let x=0,y=0,targetX=0,targetY=0,hoverX=0,hoverY=0,rx=0,ry=0;
    let maxX=80,maxY=50,centerX=0,centerY=0,viewerWidth=1,viewerHeight=1;
    let dragging=false,pointerId=-1,startX=0,startY=0,originX=0,originY=0;
    let timeout:ReturnType<typeof setTimeout>|undefined;
    let idle:number|undefined;
    let resizeObserver:ResizeObserver|undefined;

    const reset=()=>{
      root.classList.remove('cap-scene-ready');
      host.tabIndex=-1;
      root.dataset.capProgress='0';
      host.style.opacity='0';
      host.style.removeProperty('will-change');host.removeAttribute('data-dragging');
      photo?.style.removeProperty('transform');
      photo?.removeAttribute('data-active');
      photo?.style.removeProperty('opacity');heading?.style.removeProperty('opacity');
      title?.style.removeProperty('opacity');note?.style.removeProperty('opacity');
      if(progressBar)progressBar.style.transform='scaleX(0)';
      if(title)title.textContent=labels[0];
      lastPhase=-1;
    };
    const measure=()=>{
      // Cache section geometry on resize; the animation frames only read scrollY and write transforms/opacity.
      const introOffset=root.querySelector<HTMLElement>('#cap-view')?.offsetTop??0;
      top=root.getBoundingClientRect().top+scrollY+introOffset;distance=Math.max(1,root.offsetHeight-innerHeight-introOffset);
      const box=host.getBoundingClientRect();viewerWidth=box.width;viewerHeight=box.height;
      centerX=box.left+box.width/2;centerY=box.top+box.height/2;
      maxX=Math.min(90,box.width*.1);maxY=Math.min(55,box.height*.09);
      targetX=Math.max(-maxX,Math.min(maxX,targetX));targetY=Math.max(-maxY,Math.min(maxY,targetY));
      schedule();
    };
    const update=(time:number)=>{
      raf=0;
      if(!scene||!inView||reduced.matches||document.hidden)return;
      targetProgress=clamp((scrollY-top)/distance);
      const dt=lastTime?Math.min(40,time-lastTime):16.67;lastTime=time;
      const follow=1-Math.exp(-dt/70),move=1-Math.exp(-dt/90);
      progress+=(targetProgress-progress)*follow;
      if(Math.abs(targetProgress-progress)<.00005)progress=targetProgress;
      x+=(targetX+hoverX-x)*move;y+=(targetY+hoverY-y)*move;
      const desiredRX=Math.max(-5,Math.min(5,-y/12)),desiredRY=Math.max(-7,Math.min(7,x/12));
      rx+=(desiredRX-rx)*move;ry+=(desiredRY-ry)*move;
      const p=progress;
      // A quiet scroll frame is not a stopped gesture: trackpads can deliver spaced events.
      // Wait before resolving to one photograph, otherwise slow scrolling flickers between angles.
      const scrollActive=time-lastScrollTime<150;
      // One unchanged photograph: uniform scale and in-plane rotation cannot morph its shape.
      if(photo)photo.style.transform=`translateX(-50%) translate3d(${x}px,${y-12*p}px,0) rotate(${-2*p+x*.008}deg) scale(${1+.035*p})`;
      host.style.opacity='1';
      if(photo)photo.style.opacity='1';
      const phase=p<.35?0:p<.67?1:2;
      if(phase!==lastPhase){
        if(title)title.textContent=labels[phase];
        dots.forEach((dot,i)=>dot.setAttribute('aria-current',i===phase?'step':'false'));
        root.dataset.capView=String(phase);lastPhase=phase;
      }
      if(title)title.style.opacity=String(ease(p/.12));
      if(note)note.style.opacity=String(ease((p-.64)/.1));
      if(progressBar)progressBar.style.transform=`scaleX(${p})`;
      // A rounded value makes the scroll state inspectable without exposing a global renderer.
      root.dataset.capProgress=p.toFixed(3);
      host.dataset.capX=x.toFixed(1);host.dataset.capY=y.toFixed(1);
      const unsettled=scrollActive||Math.abs(targetProgress-progress)>.00005||Math.abs(targetX+hoverX-x)>.04||Math.abs(targetY+hoverY-y)>.04;
      host.dataset.animating=String(unsettled);
      if(unsettled)schedule();else lastTime=0;
    };
    const schedule=()=>{if(!raf)raf=requestAnimationFrame(update);};
    const start=async()=>{
      if(cancelled||loading||scene||reduced.matches||!document.documentElement.classList.contains('motion'))return;
      loading=true;
      try{
        // No generated angle sequence: animate the server-rendered product photo directly.
        if(cancelled||reduced.matches){loading=false;return;}
        scene=true;root.classList.add('cap-scene-ready');if(photo)photo.dataset.active=String(inView);
        void loadAngles();
        host.tabIndex=0;
        measure();progress=clamp((scrollY-top)/distance);
        resizeObserver=new ResizeObserver(measure);resizeObserver.observe(host);resizeObserver.observe(root);
        schedule();
      }catch{
        // If an angle cannot load, preserve the original product photograph.
        root.classList.add('cap-scene-fallback');reset();
      }finally{loading=false;}
    };
    const queueStart=()=>{
      if('requestIdleCallback' in window)idle=requestIdleCallback(()=>void start(),{timeout:1800});
      else timeout=setTimeout(()=>void start(),150);
    };
    const observer=new IntersectionObserver(([entry])=>{
      inView=entry.isIntersecting;
      host.dataset.active=String(inView);lastTime=0;
      if(photo)photo.dataset.active=String(inView&&scene);
      if(inView){if(!scene)queueStart();schedule();}
      else if(raf){cancelAnimationFrame(raf);raf=0;}
    },{rootMargin:'0px'});
    observer.observe(root);
    const change=()=>{
      if(reduced.matches){scene=false;resizeObserver?.disconnect();reset();}
      else if(inView){root.classList.remove('cap-scene-fallback');queueStart();}
    };
    const limited=(value:number,limit:number)=>Math.max(-limit,Math.min(limit,value));
    const pointerEnter=()=>{
      // Sticky positioning changes viewport coordinates without resizing the viewer.
      const box=host.getBoundingClientRect();
      centerX=box.left+box.width/2;centerY=box.top+box.height/2;
    };
    const pointerDown=(event:PointerEvent)=>{
      if(!scene||reduced.matches||event.pointerType!=='mouse'||event.button!==0)return;
      pointerEnter();
      event.preventDefault();dragging=true;pointerId=event.pointerId;
      host.dataset.pointerFocus='true';
      startX=event.clientX;startY=event.clientY;originX=targetX;originY=targetY;
      dragOriginAngle=angle;
      hoverX=hoverY=0;host.setPointerCapture(pointerId);host.dataset.dragging='true';
      host.focus({preventScroll:true});schedule();
    };
    const pointerMove=(event:PointerEvent)=>{
      if(!scene||reduced.matches||!finePointer.matches)return;
      // Deliberate, longer gestures: small mouse corrections keep the current photograph.
      if(dragging){setAngle(dragOriginAngle+Math.trunc((event.clientX-startX)/200));}
      else{hoverX=limited((event.clientX-centerX)/viewerWidth, .5)*12;hoverY=limited((event.clientY-centerY)/viewerHeight,.5)*8;}
      schedule();
    };
    const pointerUp=()=>{
      if(!dragging)return;dragging=false;host.removeAttribute('data-dragging');
      if(host.hasPointerCapture(pointerId))host.releasePointerCapture(pointerId);pointerId=-1;schedule();
    };
    const pointerLeave=()=>{if(!dragging){hoverX=hoverY=0;schedule();}};
    const blur=()=>{pointerUp();hoverX=hoverY=0;lastTime=0;schedule();};
    const visibility=()=>{if(document.hidden)blur();else{lastTime=0;schedule();}};
    const scroll=()=>{lastScrollTime=performance.now();schedule();};
    const resetPosition=()=>{targetX=targetY=hoverX=hoverY=0;setAngle(0);pointerUp();schedule();};
    const keyDown=(event:KeyboardEvent)=>{
      if(!scene||reduced.matches)return;
      host.removeAttribute('data-pointer-focus');
      const amount=event.shiftKey?28:14;
      if(event.key==='ArrowLeft')setAngle(angle-1);
      else if(event.key==='ArrowRight')setAngle(angle+1);
      else if(event.key==='ArrowUp')targetY=limited(targetY-amount,maxY);
      else if(event.key==='ArrowDown')targetY=limited(targetY+amount,maxY);
      else if(event.key.toLowerCase()==='r'||event.key==='Escape'){resetPosition();event.preventDefault();return;}
      else return;
      event.preventDefault();hoverX=hoverY=0;schedule();
    };
    host.addEventListener('pointerdown',pointerDown);host.addEventListener('pointermove',pointerMove);
    host.addEventListener('pointerenter',pointerEnter);
    host.addEventListener('pointerup',pointerUp);host.addEventListener('pointercancel',pointerUp);
    host.addEventListener('lostpointercapture',pointerUp);host.addEventListener('pointerleave',pointerLeave);
    host.addEventListener('keydown',keyDown);resetButton?.addEventListener('click',resetPosition);
    const angleClick=(event:Event)=>setAngle(angle+Number((event.currentTarget as HTMLElement).dataset.angleDirection));
    angleButtons.forEach(b=>b.addEventListener('click',angleClick));
    if(reduced.matches)void loadAngles();
    window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('blur',blur);
    window.addEventListener('resize',measure,{passive:true});
    document.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',change);
    return()=>{
      cancelled=true;observer.disconnect();resizeObserver?.disconnect();
      angleButtons.forEach(b=>b.removeEventListener('click',angleClick));
      if(raf)cancelAnimationFrame(raf);if(idle!==undefined)cancelIdleCallback(idle);if(timeout)clearTimeout(timeout);
      window.removeEventListener('scroll',scroll);window.removeEventListener('blur',blur);window.removeEventListener('resize',measure);
      host.removeEventListener('pointerenter',pointerEnter);
      host.removeEventListener('pointerdown',pointerDown);host.removeEventListener('pointermove',pointerMove);
      host.removeEventListener('pointerup',pointerUp);host.removeEventListener('pointercancel',pointerUp);
      host.removeEventListener('lostpointercapture',pointerUp);host.removeEventListener('pointerleave',pointerLeave);
      host.removeEventListener('keydown',keyDown);resetButton?.removeEventListener('click',resetPosition);
      document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',change);
      reset();
    };
  },[labels]);
  return <><div ref={ref} className="cap-viewer" role="group" tabIndex={-1} aria-label={`${description}. ${keyboardHelp}`} />
    <div className="cap-controls"><span>{dragLabel}</span><div className="cap-angle-buttons"><button type="button" data-angle-direction="-1" disabled aria-label={labels[labels.length-1]}>‹</button><span data-cap-angle-name aria-live="polite">{labels[0]}</span><button type="button" data-angle-direction="1" disabled aria-label={labels[1]}>›</button></div><button type="button" data-cap-reset>{resetLabel}<span aria-hidden="true">↺</span></button></div></>;
}
