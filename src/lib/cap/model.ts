import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const HALF_PI = Math.PI / 2;
const TAU = Math.PI * 2;

/** Open, double-shell cap. The interior is an illustrative construction, not a production spec. */
function surface(fn: (u: number, v: number) => THREE.Vector3, columns = 64, rows = 32, reverse = false) {
  const positions: number[] = [], uvs: number[] = [], indices: number[] = [];
  for (let j = 0; j <= rows; j++) for (let i = 0; i <= columns; i++) {
    const p = fn(i / columns, j / rows);
    positions.push(p.x, p.y, p.z); uvs.push(i / columns, j / rows);
  }
  for (let j = 0; j < rows; j++) for (let i = 0; i < columns; i++) {
    const a = j * (columns + 1) + i, b = a + columns + 1;
    indices.push(...(reverse ? [a, b, a + 1, a + 1, b, b + 1] : [a, a + 1, b, a + 1, b + 1, b]));
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(indices); g.computeVertexNormals();
  return g;
}

function lowerEdge(theta: number) {
  const distance = Math.abs(Math.atan2(Math.sin(theta - Math.PI), Math.cos(theta - Math.PI)));
  return distance < .48 ? Math.asin(.45 * Math.sqrt(1 - (distance / .48) ** 2) / 1.38) / HALF_PI : 0;
}

function crown(theta: number, v: number, inset = 0) {
  const phi = v * HALF_PI;
  const r = Math.cos(phi);
  // A gentle panel fullness, with narrow sewn seams at each of the six boundaries.
  const fullness = 1 + .008 * Math.sin(theta * 3) ** 2 * Math.sin(phi * 2);
  return new THREE.Vector3(
    Math.sin(theta) * r * (1 - inset) * fullness,
    Math.sin(phi) * (1.38 - inset),
    Math.cos(theta) * r * (1.065 - inset) * fullness,
  );
}

function brim(u: number, v: number, underside = false) {
  const t = (u * 2 - 1), theta = t * 1.13;
  const rootX = Math.sin(theta), rootZ = 1.065 * Math.cos(theta);
  const tipX = 1.19 * Math.sin(t * HALF_PI);
  const tipZ = .46 + 1.77 * Math.cos(t * HALF_PI) ** .78;
  return new THREE.Vector3(
    THREE.MathUtils.lerp(rootX, tipX, v),
    -.028 + .105 * t * t - .15 * (1 - t * t) * v - .018 * v * v - (underside ? .036 : 0),
    THREE.MathUtils.lerp(rootZ, tipZ, v),
  );
}

function fabricTexture() {
  const size = 256, pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const weave = ((x + y) % 6 < 3 ? 16 : -16) + (x % 2 === 0 ? 7 : -7) + (y % 3 === 0 ? 6 : 0);
    const n = 130 + weave;
    const i = (y * size + x) * 4;
    pixels[i] = pixels[i + 1] = pixels[i + 2] = n; pixels[i + 3] = 255;
  }
  const texture = new THREE.DataTexture(pixels, size, size);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 9); texture.needsUpdate = true;
  return texture;
}

function textTexture(text: string, dark = false) {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 192;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = dark ? '#173f34' : '#ece4d4'; ctx.fillRect(0, 0, 512, 192);
  ctx.fillStyle = dark ? '#ece4d4' : '#173f34'; ctx.font = '64px Georgia';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 256, 100);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function smooth(p: number) { const t = THREE.MathUtils.clamp(p, 0, 1); return t * t * (3 - 2 * t); }

export async function createCapScene(host: HTMLElement) {
  const canvas=document.createElement('canvas');
  const context=canvas.getContext('webgl2',{alpha:true,antialias:true,powerPreference:'low-power'});
  if(!context)throw new Error('WebGL2 is unavailable');
  const renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(devicePixelRatio, matchMedia('(pointer: coarse)').matches ? 1.25 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .72;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-3, 3, 2, -2, .1, 50);
  camera.position.set(4, 2.6, 6); camera.lookAt(0, .05, 0);
  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(environment, .06);
  scene.environment = env.texture; environment.dispose(); pmrem.dispose();
  scene.add(new THREE.HemisphereLight('#fffaf0', '#7d8270', .65));
  const key = new THREE.DirectionalLight('#ffefd9', 1.9); key.position.set(-3, 5, 6); scene.add(key);
  const fill = new THREE.DirectionalLight('#f4f6ff', .5); fill.position.set(4, 1, -4); scene.add(fill);
  // Illuminate the hollow interior when it rotates into view.
  const front = new THREE.DirectionalLight('#fff7e8', .65); front.position.set(2, 2, 6); scene.add(front);

  const pivot = new THREE.Group(), cap = new THREE.Group();
  cap.position.set(0, -.64, -.43); pivot.add(cap); scene.add(pivot);
  const weave = fabricTexture();
  const ivory = new THREE.MeshStandardMaterial({ color: '#ddd0b7', roughness: .93, bumpMap: weave, bumpScale: .009, envMapIntensity: .2 });
  const lining = ivory.clone(); lining.color.set('#cfc1a6'); lining.side = THREE.BackSide;lining.vertexColors=true;
  const seamMaterial = new THREE.MeshStandardMaterial({ color: '#c8bca4', roughness: 1 });
  const tapeMaterial = new THREE.MeshStandardMaterial({ color: '#ad9975', roughness: .95, side: THREE.DoubleSide, bumpMap: weave, bumpScale: .003 });
  const greenMaterial = new THREE.MeshStandardMaterial({ color: '#214536', roughness: 1, side: THREE.DoubleSide });
  const brownMaterial = new THREE.MeshStandardMaterial({ color: '#75482d', roughness: .76, side: THREE.DoubleSide, bumpMap: weave, bumpScale: .002 });
  const goldMaterial = new THREE.MeshStandardMaterial({ color: '#b19762', metalness: .86, roughness: .31 });
  const threadMaterial = new THREE.LineBasicMaterial({ color: '#f4ead4' });
  const threadPoints: number[] = [];
  const line = (points: THREE.Vector3[], radius = .004, material = seamMaterial) => {
    const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), Math.max(16, points.length), radius, 4, false);
    const m = new THREE.Mesh(g, material); cap.add(m); return m;
  };
  const stitches = (fn: (t: number) => THREE.Vector3, count: number) => {
    for (let i = 0; i < count; i++) { const a = fn(i / count), b = fn((i + .48) / count); threadPoints.push(a.x, a.y, a.z, b.x, b.y, b.z); }
  };

  for (let panel = 0; panel < 6; panel++) {
    const start = panel * TAU / 6, end = (panel + 1) * TAU / 6;
    const shape = (u: number, v: number, inset = 0) => {
      const theta = THREE.MathUtils.lerp(start, end, u), lower = lowerEdge(theta);
      return crown(theta, THREE.MathUtils.lerp(lower, .9998, v), inset);
    };
    cap.add(new THREE.Mesh(surface((u,v) => shape(u,v), 32, 32), ivory));
    const inner=surface((u,v) => shape(u,v,.021),32,32);
    const colors:number[]=[];
    const pos=inner.getAttribute('position');
    for(let i=0;i<pos.count;i++){const shade=.94-.3*Math.min(1,pos.getY(i)/1.38);colors.push(shade,shade,shade);}
    inner.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
    cap.add(new THREE.Mesh(inner,lining));
    const lower = lowerEdge(start);
    line(Array.from({length:49},(_,i)=>crown(start,THREE.MathUtils.lerp(lower,.998,i/48),-.003)),.004);
    // Sewn reinforcement tape sits against the inner shell, leaving the bowl open.
    cap.add(new THREE.Mesh(surface((u,v) => {
      const theta = start + (u - .5) * .046;
      return crown(theta, THREE.MathUtils.lerp(Math.max(lowerEdge(theta), .025), .985, v), .038);
    }, 4, 40), tapeMaterial));
    for(const offset of [-.018,.018]) stitches(t=>crown(start+offset,THREE.MathUtils.lerp(Math.max(lowerEdge(start+offset),.018),.97,t),-.007),75);
    // Six tiny stitched ventilation eyelets follow the crown's surface normal.
    const theta = start + Math.PI/6, phi = .55;
    const p = crown(theta,phi,-.008);
    const n = new THREE.Vector3(Math.sin(theta)*Math.cos(phi*HALF_PI),Math.sin(phi*HALF_PI)/1.38,Math.cos(theta)*Math.cos(phi*HALF_PI)).normalize();
    const eyelet = new THREE.Mesh(new THREE.TorusGeometry(.025,.007,6,20),ivory);
    eyelet.position.copy(p); eyelet.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),n);cap.add(eyelet);
    const hole = new THREE.Mesh(new THREE.CircleGeometry(.017,20),new THREE.MeshStandardMaterial({color:'#867c68',roughness:1}));
    hole.position.copy(p).addScaledVector(n,.002);hole.quaternion.copy(eyelet.quaternion);cap.add(hole);
  }
  const button = new THREE.Mesh(new THREE.SphereGeometry(.092,24,12),ivory);
  button.scale.set(1,.38,1);button.position.y=1.395;cap.add(button);

  const brimTop = surface((u,v)=>brim(u,v),80,24,true);
  cap.add(new THREE.Mesh(brimTop,ivory));
  const brimUnderMaterial = ivory.clone();brimUnderMaterial.color.set('#d1c2a6');brimUnderMaterial.side=THREE.DoubleSide;
  cap.add(new THREE.Mesh(surface((u,v)=>brim(u,v,true),80,24),brimUnderMaterial));
  line(Array.from({length:81},(_,i)=>brim(i/80,1)),.018,ivory);
  for(let row=0;row<6;row++) stitches(t=>brim(.015+.97*t,.39+row*.098),130);

  // A continuous inner sweatband, interrupted at the rear adjustment opening.
  cap.add(new THREE.Mesh(surface((u,v)=>{
    const theta=.0+u*(TAU-1.04)+Math.PI+.52;
    return new THREE.Vector3(Math.sin(theta)*.972,.005+v*.15,Math.cos(theta)*1.036);
  },100,4,true),greenMaterial));
  line(Array.from({length:100},(_,i)=>{
    const theta=Math.PI+.51+i/99*(TAU-1.02);return new THREE.Vector3(Math.sin(theta)*.976,.153,Math.cos(theta)*1.04);
  }),.006,ivory);

  const rearRim:THREE.Vector3[]=[];
  for(let i=0;i<=80;i++){const theta=Math.PI-.48+i/80*.96;rearRim.push(crown(theta,lowerEdge(theta),-.005));}
  line(rearRim,.012,ivory);
  cap.add(new THREE.Mesh(surface((u,v)=>{
    const x=THREE.MathUtils.lerp(-.46,.46,u);
    return new THREE.Vector3(x,.008+v*.135,-Math.sqrt(1-x*x)*1.065-.01);
  },48,4),brownMaterial));
  for(const y of [.03,.121])stitches(t=>{
    const x=-.45+.9*t;return new THREE.Vector3(x,y,-Math.sqrt(1-x*x)*1.065-.02);
  },50);
  const buckle = new THREE.Group();
  for(const x of [-.073,.073]){const side=new THREE.Mesh(new THREE.BoxGeometry(.023,.198,.035),goldMaterial);side.position.x=x;buckle.add(side);}
  for(const y of [-.088,.088]){const side=new THREE.Mesh(new THREE.BoxGeometry(.146,.023,.035),goldMaterial);side.position.y=y;buckle.add(side);}
  const tongue=new THREE.Mesh(new THREE.BoxGeometry(.016,.126,.03),goldMaterial);tongue.rotation.z=.17;buckle.add(tongue);
  buckle.position.set(.2,.075,-1.067);buckle.rotation.y=-.18;cap.add(buckle);

  // The supplied brand artwork is curved onto the side panel instead of floating on a flat plane.
  let logo:THREE.Texture|undefined;
  try {
    logo=await new THREE.TextureLoader().loadAsync('/images/ulux-logo.png');
    logo.colorSpace=THREE.SRGBColorSpace;logo.anisotropy=4;
    const logoMaterial=new THREE.MeshStandardMaterial({map:logo,transparent:true,alphaTest:.15,roughness:.92,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
    const decal=surface((u,v)=>{
      const theta=THREE.MathUtils.lerp(1.35,.78,u);
      return crown(theta,THREE.MathUtils.lerp(.08,.35,v),-.012);
    },32,16,true);
    const uv=decal.getAttribute('uv');for(let i=0;i<uv.count;i++){uv.setX(i,1-uv.getX(i));uv.setY(i,.12+.88*uv.getY(i));}
    cap.add(new THREE.Mesh(decal,logoMaterial));
  } catch { /* The cap remains usable if a logo texture cannot be loaded. */ }

  const labelTexture=textTexture('ULUX');
  const label=new THREE.Mesh(new THREE.PlaneGeometry(.31,.115),new THREE.MeshStandardMaterial({map:labelTexture,roughness:1,side:THREE.DoubleSide}));
  label.position.set(0,.52,-.92);label.rotation.x=-.38;cap.add(label);
  const threads=new THREE.BufferGeometry();threads.setAttribute('position',new THREE.Float32BufferAttribute(threadPoints,3));
  cap.add(new THREE.LineSegments(threads,threadMaterial));

  let width=0,height=0;
  const resize=()=>{
    const rect=host.getBoundingClientRect();
    if(!rect.width||!rect.height)return;
    width=rect.width;height=rect.height;renderer.setSize(width,height,false);
    const aspect=width/height,vertical=Math.max(2.8,3.6/aspect);
    camera.left=-vertical*aspect/2;camera.right=vertical*aspect/2;
    camera.top=vertical/2;camera.bottom=-vertical/2;camera.updateProjectionMatrix();
  };
  const render=(progress:number)=>{
    const p=THREE.MathUtils.clamp(progress,0,1);
    if(!width||!height)resize();
    const inside=smooth((p-.7)/.24);
    // The rear view has a short hold, then the cap completes its turn and opens toward the camera.
    const yaw=p<.34?THREE.MathUtils.lerp(-.12,-2.58,smooth((p-.1)/.24)):
      p<.54?-2.58:THREE.MathUtils.lerp(-2.58,-TAU-.12,smooth((p-.54)/.16));
    pivot.rotation.set(-2.12*inside,yaw+.32*inside,-.12*inside,'YXZ');
    pivot.position.y=.02-.12*inside;
    pivot.scale.setScalar(1-.28*inside);
    renderer.render(scene,camera);
  };
  resize();render(0);
  return {
    resize,render,
    dispose(){
      const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>(),textures=new Set<THREE.Texture>();
      scene.traverse(object=>{
        const mesh=object as THREE.Mesh;
        if(mesh.geometry)geometries.add(mesh.geometry);
        if(mesh.material)for(const m of Array.isArray(mesh.material)?mesh.material:[mesh.material])materials.add(m);
      });
      for(const m of materials){const material=m as THREE.MeshStandardMaterial;if(material.map)textures.add(material.map);if(material.bumpMap)textures.add(material.bumpMap);m.dispose();}
      for(const g of geometries)g.dispose();for(const t of textures)t.dispose();
      env.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();
    },
  };
}
