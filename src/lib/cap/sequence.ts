/** Photographic angles derived from the approved product mock-up; no synthetic 3D geometry. */
const frames=[
 {name:'front',at:0},
 {name:'side',at:.18},
 {name:'rear-quarter',at:.35},
 {name:'rear',at:.5},
 {name:'tilt',at:.73},
 {name:'inside',at:.91},
] as const;

const ease=(value:number)=>{const x=Math.max(0,Math.min(1,value));return x*x*(3-2*x);};

export async function createCapSequence(host:HTMLElement){
 const stack=document.createElement('div');stack.className='cap-photo-stack';host.appendChild(stack);
 const layers:HTMLPictureElement[]=[];
 const images:HTMLImageElement[]=[];
 try{
  for(const {name} of frames){
   const layer=document.createElement('picture');layer.className='cap-photo-frame';layer.dataset.capFrame=name;
   const avif=document.createElement('source');avif.type='image/avif';
   const img=document.createElement('img');img.alt='';img.width=1536;img.height=1024;
   img.decoding='async';img.fetchPriority='low';img.draggable=false;
   const sizes='(max-width:599px) 100vw, 65vw';
   if(name==='front'){
    avif.srcset='/images/cap-640.avif 640w, /images/cap-1200.avif 1200w';
    img.srcset='/images/cap-640.webp 640w, /images/cap-1200.webp 1200w';
    img.src='/images/cap-1200.webp';
   }else{
    avif.srcset=`/images/cap-sequence/${name}-720.avif 720w, /images/cap-sequence/${name}-1200.avif 1200w`;
    img.srcset=`/images/cap-sequence/${name}-720.webp 720w, /images/cap-sequence/${name}-1200.webp 1200w`;
    img.src=`/images/cap-sequence/${name}-1200.webp`;
   }
   avif.sizes=sizes;img.sizes=sizes;layer.style.opacity='0';
   layer.append(avif,img);stack.appendChild(layer);layers.push(layer);images.push(img);
  }
  // Keep the original hero photograph visible until every required angle has decoded.
  await Promise.all(images.map(img=>img.decode()));
 }catch(error){stack.remove();throw error;}
 const previous=layers.map(()=>0);previous[0]=1;layers[0].style.opacity='1';
 const render=(progress:number,settled=false,delta=16.67)=>{
  const p=Math.max(0,Math.min(1,progress));
  let index=0;while(index<frames.length-1&&p>=frames[index+1].at)index++;
  const next=Math.min(index+1,frames.length-1);
  const length=frames[next].at-frames[index].at;
  const blend=length>0?ease((p-frames[index].at)/length):0;
  const chosen=blend>.5?next:index;
  const follow=1-Math.exp(-Math.min(delta,40)/60);
  let pending=false;
  for(let i=0;i<layers.length;i++){
   const target=settled?(i===chosen?1:0):(i===index?1-blend:i===next?blend:0);
   let opacity=previous[i]+(target-previous[i])*follow;
   if(Math.abs(target-opacity)<.002)opacity=target;else pending=true;
   if(opacity!==previous[i]){layers[i].style.opacity=String(opacity);previous[i]=opacity;}
  }
  host.dataset.capAngle=blend>.5?frames[next].name:frames[index].name;
  return pending;
 };
 render(0);
 return{render,pose(x:number,y:number,rx:number,ry:number){stack.style.transform=`perspective(1100px) translate3d(${x}px,${y}px,0) rotateX(${rx}deg) rotateY(${ry}deg)`;},resize(){},dispose(){stack.remove();}};
}
