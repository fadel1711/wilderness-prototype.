import * as THREE from 'three';
import {LEGACY_KEY,V03_KEY,V04_KEY,SAVE_KEY,PRE_IMPORT_KEY,ITEM,startingInventory,count,freeCapacity,addItem,payCosts,normalizeSave,makeSave,exportWrapper} from './save-system.js?v=0.5.2';
import {BUILD_TYPES,COSTS,wallType,localXZ,snappedPosition,placementVerdict,normalizedRotation,hasFoundation,raisedCabin,supportHeight,cabinFoundationCount,STOCK_BLUEPRINTS,resolveBlueprint,sortParts,blueprintVerdict,sumCosts} from './construction.js?v=0.5.2';

// Wilderness v0.5.2 — entrance access and creative supply hotfix; v0.5 elevated cabins, floor/foundation stacking, blueprints and land development.
// Deliberately retains the v0.1 save key, format, resource IDs, and procedural positions.
// No accounts, analytics, microtransactions, or online save requests.
const $ = id => document.getElementById(id);
const WORLD = 46;
const clock = new THREE.Clock(), cameraDistance = 7.4, PLAYER_RADIUS = 0.32;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#a9b8b5');
scene.fog = new THREE.Fog('#a9b8b5', 38, 91);
const camera = new THREE.PerspectiveCamera(66, innerWidth / innerHeight, 0.1, 125);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power', alpha: false });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
$('world').appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight('#e6ecdf', '#695f4d', 2.0));
const sunlight = new THREE.DirectionalLight('#f7ead3', 1.65);
sunlight.position.set(-28, 43, 19); scene.add(sunlight);

function makeTexture(kind, seed) {
  // Tiny tileable textures generated entirely on-device. No image downloads.
  const canvas = document.createElement('canvas'); canvas.width = 128; canvas.height = 128;
  const ctx = canvas.getContext('2d'); if (!ctx) return null;
  let state = seed >>> 0;
  const roll = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
  if (kind === 'grass') {
    ctx.fillStyle = '#797f64'; ctx.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 2600; i++) {
      const v = Math.floor(95 + roll() * 45);
      ctx.fillStyle = `rgba(${Math.floor(v*.75)},${v},${Math.floor(v*.66)},${.07 + roll()*.14})`;
      ctx.fillRect(roll()*128, roll()*128, 1 + roll()*3, 1 + roll()*3);
    }
    for (let i = 0; i < 110; i++) {
      ctx.strokeStyle = roll() > .5 ? '#8b8c7055' : '#394e3a3a'; ctx.lineWidth = .55;
      const x=roll()*128, y=roll()*128; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+(roll()-.5)*4,y-3-roll()*4); ctx.stroke();
    }
  } else if (kind === 'wood') {
    ctx.fillStyle = '#92765b'; ctx.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 185; i++) {
      const x=roll()*128;
      ctx.strokeStyle = roll()>.42 ? '#54432c30' : '#e0c49430';ctx.lineWidth=.6+roll()*1.7;
      ctx.beginPath();ctx.moveTo(x,0);ctx.bezierCurveTo(x+roll()*5,41,x-roll()*5,88,x+roll()*4,128);ctx.stroke();
    }
  } else if (kind === 'stone') {
    ctx.fillStyle='#888b83';ctx.fillRect(0,0,128,128);
    for(let i=0;i<1800;i++){const v=Math.floor(90+roll()*75);ctx.fillStyle=`rgba(${v},${v+2},${v},${.025+roll()*.09})`;ctx.fillRect(roll()*128,roll()*128,1+roll()*3,1+roll()*3);}
  } else if (kind === 'roof') {
    ctx.fillStyle='#655f54';ctx.fillRect(0,0,128,128);
    for(let y=4;y<128;y+=19){ctx.fillStyle='#25272328';ctx.fillRect(0,y,128,2);for(let x=(y%38)*2-32;x<128;x+=35){ctx.fillRect(x,y,2,19);}}
  }
  const t=new THREE.CanvasTexture(canvas);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return t;
}
const grassTexture = makeTexture('grass', 906), woodTexture=makeTexture('wood',317),stoneTexture=makeTexture('stone',44),roofTexture=makeTexture('roof',72);
if(grassTexture)grassTexture.repeat.set(31,31);
const mat=(color,texture=null,roughness=1)=>new THREE.MeshStandardMaterial({color, map:texture||null, roughness});
const grassMat=mat('#a2a58e',grassTexture), earth=mat('#7f755e'), pathMat=mat('#a59a7a');
const trunk=mat('#80705c',woodTexture), foliage=[mat('#54705a'),mat('#627962'),mat('#486652'),mat('#647b59')];
const rockMat=mat('#b4b7af',stoneTexture), rockDark=mat('#989b94',stoneTexture);
const timber=mat('#b5a084',woodTexture),timberDark=mat('#92745b',woodTexture), beam=mat('#6a5945',woodTexture);
const roofMat=mat('#9c9285',roofTexture), glassMat=mat('#9ab1ae',null,.24);
const coat=mat('#5b6960'),coatDark=mat('#455047'),trousers=mat('#5c5148'),skin=mat('#d4ad8d'),hair=mat('#483e34'),bootMat=mat('#3b342c');
const shadowMat=new THREE.MeshBasicMaterial({color:'#1b2119',transparent:true,opacity:.17,depthWrite:false});
function mesh(geometry,material,parent,x=0,y=0,z=0){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m;}
const box=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
function disk(parent,x,z,r,material=shadowMat,y=-.052){const m=mesh(new THREE.CircleGeometry(r,16),material,parent,x,y,z);m.rotation.x=-Math.PI/2;return m;}
mesh(new THREE.PlaneGeometry(110,110),grassMat,scene,0,-.09,0).rotation.x=-Math.PI/2;

// Old deterministic RNG consumption is preserved so previously collected resource IDs
// stay in their original positions after upgrading a saved v0.1.1 world.
let rng=13371337;
function random(){rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;}
const patches=[mat('#6e8064'),mat('#7d886a'),mat('#86876a')];
for(let i=0;i<16;i++){
  const x=(random()-.5)*80,z=(random()-.5)*80,r=1.6+random()*2;
  const p=mesh(new THREE.CircleGeometry(r,12),patches[i%3],scene,x,-.078,z);p.rotation.x=-Math.PI/2;
}
const grassBlade=[mat('#738566'),mat('#8a9470'),mat('#a3a17e')];
for(let i=0;i<95;i++){
  const x=(random()-.5)*88,z=(random()-.5)*88;
  if(Math.hypot(x,z)<8)continue;
  const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
  for(let j=0;j<3;j++){
    const h=.30+random()*.32,ox=(random()-.5)*.4,oz=(random()-.5)*.4,turn=(random()-.5)*.5;
    const b=mesh(new THREE.ConeGeometry(.07,h,4),grassBlade[i%3],g,ox,h/2,oz);b.rotation.z=turn;
  }
}
const distantHill=mat('#758779');
for(let i=0;i<17;i++){
  const a=i/17*Math.PI*2,r=58+random()*20,rr=7+random()*9,h=12+random()*17;
  const hill=mesh(new THREE.ConeGeometry(rr,h,7),distantHill,scene,Math.sin(a)*r,4,Math.cos(a)*r);hill.rotation.y=random()*6;
}

// Character: an intentionally modest, textured-feeling indie model, not AAA art.
const player = new THREE.Group();scene.add(player);
const legs=new THREE.Group(),arms=new THREE.Group();player.add(legs,arms);
const torso=mesh(new THREE.CapsuleGeometry(.34,.73,4,10),coat,player,0,1.44,0);torso.scale.z=.82;
const collar=mesh(new THREE.CylinderGeometry(.20,.25,.14,10),coatDark,player,0,1.94,0);
mesh(new THREE.SphereGeometry(.29,14,10),skin,player,0,2.21,0);
const cap=mesh(new THREE.SphereGeometry(.295,12,8,0,Math.PI*2,0,Math.PI*.47),hair,player,0,2.26,0);
mesh(box(.47,.60,.17),timberDark,player,0,1.41,-.35); // small travelling pack
mesh(box(.12,.45,.11),beam,player,0,1.45,-.46);
const armL=mesh(new THREE.CapsuleGeometry(.12,.5,3,8),coat,arms,-.50,1.39,0);
const armR=mesh(new THREE.CapsuleGeometry(.12,.5,3,8),coat,arms,.50,1.39,0);
const legL=mesh(new THREE.CapsuleGeometry(.135,.52,3,8),trousers,legs,-.18,.53,0);
const legR=mesh(new THREE.CapsuleGeometry(.135,.52,3,8),trousers,legs,.18,.53,0);
mesh(box(.28,.15,.40),bootMat,legL,0,-.36,.07);mesh(box(.28,.15,.40),bootMat,legR,0,-.36,.07);
const playerShadow = disk(player,0,0,.50,shadowMat,.007);
// Modest visible tools follow the right hand rather than floating in the scene.
const weaponMount=new THREE.Group();weaponMount.position.set(.02,-.53,.13);armR.add(weaponMount);
const handleMat=mat('#79624a',woodTexture),ironMat=mat('#858f8c',stoneTexture);
const axeModel=new THREE.Group(),pickModel=new THREE.Group();weaponMount.add(axeModel,pickModel);
mesh(new THREE.CylinderGeometry(.052,.060,.97,8),handleMat,axeModel,0,-.28,0);
mesh(box(.37,.23,.11),ironMat,axeModel,-.15,-.69,0);
mesh(new THREE.CylinderGeometry(.052,.060,1.03,8),handleMat,pickModel,0,-.23,0);
mesh(box(.66,.12,.12),rockMat,pickModel,0,-.72,0);
mesh(new THREE.ConeGeometry(.095,.27,6),ironMat,pickModel,-.35,-.73,0).rotation.z=Math.PI/2;
mesh(new THREE.ConeGeometry(.095,.27,6),ironMat,pickModel,.35,-.73,0).rotation.z=-Math.PI/2;
player.position.set(0,0,0);

const resourceRoot=new THREE.Group();scene.add(resourceRoot);
const resources=[];const cameraOccluders=[];
function addTree(id,x,z,s){
  const g=new THREE.Group();g.position.set(x,0,z);resourceRoot.add(g);
  const trunkMesh=mesh(new THREE.CylinderGeometry(.22*s,.36*s,2.14*s,9),trunk,g,0,1.07*s,0);cameraOccluders.push(trunkMesh);
  // Broadleaf trees break up the silhouette; pine trees keep the recognizable woodland look.
  if(Number(id.slice(1))%5===0){
    for(let j=0;j<5;j++){
      const a=j*Math.PI*2/5+0.2;
      const b=mesh(new THREE.SphereGeometry((1.13+(j%2)*.14)*s,9,7),foliage[(j+2)%4],g,Math.cos(a)*.60*s,(2.75+(j%2)*.27)*s,Math.sin(a)*.6*s);
      b.scale.set(.88,.75,.88);
    }
  } else {
    for(let j=0;j<3;j++){
      const cone=mesh(new THREE.ConeGeometry((1.48-j*.20)*s,(2.7-j*.07)*s,8),foliage[(j+Number(id.slice(1)))%4],g,0,(2.28+j*.82)*s,0);
      cone.rotation.y=(j*.23);
    }
  }
  disk(g,0,0,.60*s); resources.push({id,type:'tree',x,z,hits:3,group:g,radius:.38*s});
}
function addRock(id,x,z,s){
  const g=new THREE.Group();g.position.set(x,0,z);resourceRoot.add(g);
  const m=mesh(new THREE.DodecahedronGeometry(.93*s,0),Number(id.slice(1))%2?rockMat:rockDark,g,0,.51*s,0);
  m.scale.set(1.26,.66,1.0);m.rotation.set(.15,random()*4,.13);cameraOccluders.push(m);
  disk(g,0,0,.81*s);resources.push({id,type:'rock',x,z,hits:2,group:g,radius:.70*s});
}
for(let i=0;i<34;i++){
  const a=random()*Math.PI*2,r=10+Math.sqrt(random())*36,x=Math.cos(a)*r,z=Math.sin(a)*r;
  if(Math.abs(x)>WORLD||Math.abs(z)>WORLD)continue;addTree('t'+i,x,z,.75+random()*.6);
}
for(let i=0;i<27;i++){
  const a=random()*Math.PI*2,r=9+Math.sqrt(random())*35,x=Math.cos(a)*r,z=Math.sin(a)*r;
  if(Math.abs(x)>WORLD||Math.abs(z)>WORLD)continue;addRock('r'+i,x,z,.75+random()*.8);
}
// Decorative shrubs use an independent RNG, so v0.1 resource locations never shift.
let detailSeed=48112;function detailRand(){detailSeed=(Math.imul(detailSeed,1664525)+1013904223)>>>0;return detailSeed/4294967296;}
for(let i=0;i<45;i++){
  const x=(detailRand()-.5)*88,z=(detailRand()-.5)*88;
  if(Math.hypot(x,z)<8||resources.some(r=>Math.hypot(x-r.x,z-r.z)<1.7))continue;
  const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
  for(let j=0;j<3;j++){
    const b=mesh(new THREE.IcosahedronGeometry(.28+detailRand()*.14,0),foliage[(i+j)%4],g,(detailRand()-.5)*.36,.23+detailRand()*.12,(detailRand()-.5)*.36);b.scale.set(1,.75,1);
  }
}
// A faint, walkable dirt patch makes the home clearing visually distinct.
const clearing=mesh(new THREE.CircleGeometry(4.3,26),pathMat,scene,0,-.071,0);clearing.rotation.x=-Math.PI/2;clearing.material=new THREE.MeshStandardMaterial({color:'#999178',transparent:true,opacity:.22,depthWrite:false});

const builds=[],buildRoot=new THREE.Group();scene.add(buildRoot);
const costs=COSTS;
function cabinShape(group,ghost=false){
  mesh(box(5,.28,5),timber,group,0,.14,0);
  const back=mesh(box(5,2.65,.22),timberDark,group,0,1.58,-2.4);
  const left=mesh(box(.22,2.65,5),timberDark,group,-2.4,1.58,0);
  const right=mesh(box(.22,2.65,5),timberDark,group,2.4,1.58,0);
  const frontL=mesh(box(1.45,2.65,.22),timberDark,group,-1.775,1.58,2.4);
  const frontR=mesh(box(1.45,2.65,.22),timberDark,group,1.775,1.58,2.4);
  const lintel=mesh(box(2.12,.38,.22),timberDark,group,0,2.72,2.4);
  // Actual doorway is open; the solid wall colliders exactly match this geometry.
  for(const m of [back,left,right,frontL,frontR,lintel]){
    if(!ghost){m.material.side=THREE.DoubleSide;cameraOccluders.push(m);}
  }
  const roofA=mesh(box(3.04,.28,5.7),roofMat,group,-1.2,3.6,0);roofA.rotation.z=.59;
  const roofB=mesh(box(3.04,.28,5.7),roofMat,group,1.2,3.6,0);roofB.rotation.z=-.59;
  roofA.userData.roof=true;roofB.userData.roof=true;
  if(!ghost)cameraOccluders.push(roofA,roofB);
  mesh(box(.12,2.5,.15),beam,group,-1.07,1.38,2.55);mesh(box(.12,2.5,.15),beam,group,1.07,1.38,2.55);
  mesh(box(2.08,.12,.15),beam,group,0,2.57,2.56);
  mesh(box(1.19,.90,.06),glassMat,group,1.72,1.80,-2.55);
  const frame=mesh(box(1.3,.08,.14),beam,group,1.72,2.26,-2.58);
  frame.userData.decoration=true;
}
function modularShape(type,group,ghost){
  if(type==='foundation'){
    mesh(box(1.98,.54,1.98),rockMat,group,0,.27,0);
    for(const z of [-.77,.77])mesh(box(1.98,.13,.11),beam,group,0,.57,z);
  }
  if(type==='floor')mesh(box(1.98,.24,1.98),timber,group,0,.12,0);
  if(type==='wall')mesh(box(1.98,2.65,.20),timberDark,group,0,1.45,0);
  if(type==='door'){
    for(const x of [-.91,.91])mesh(box(.18,2.65,.22),timberDark,group,x,1.45,0);
    mesh(box(1.82,.38,.22),timberDark,group,0,2.59,0);
    mesh(box(1.7,.07,.22),beam,group,0,.06,0); // Low threshold, walkable
  }
  if(type==='window'){
    mesh(box(1.98,.83,.2),timberDark,group,0,.42,0);
    mesh(box(1.98,.67,.2),timberDark,group,0,2.44,0);
    mesh(box(1.35,1.10,.12),glassMat,group,0,1.39,0);
    for(const x of [-.89,.89])mesh(box(.18,1.1,.23),beam,group,x,1.39,0);
    mesh(box(.11,1.1,.13),beam,group,0,1.39,.03);
  }
  if(type==='roof'){
    // A pair of pitched slabs: each tile sits over its matching floor.
    const a=mesh(box(1.17,.19,2.13),roofMat,group,-.48,3.07,0);a.rotation.z=.47;
    const b=mesh(box(1.17,.19,2.13),roofMat,group,.48,3.07,0);b.rotation.z=-.47;
    a.userData.roof=true;b.userData.roof=true;
  }
  if(type==='path')mesh(box(1.91,.055,1.91),pathMat,group,0,.032,0);
  if(type==='fence'){
    for(const x of [-.91,.91])mesh(box(.13,.92,.13),beam,group,x,.46,0);
    for(const y of [.36,.68])mesh(box(1.89,.11,.14),timberDark,group,0,y,0);
  }
  if(type==='planter'){
    mesh(box(1.52,.23,1.48),timberDark,group,0,.15,0);
    mesh(box(1.31,.08,1.24),earth,group,0,.30,0);
    for(let i=0;i<4;i++){
      const x=(i%2?1:-1)*.35,z=(i>1?1:-1)*.31;
      const leaf=mesh(new THREE.ConeGeometry(.14,.36,5),foliage[(i+1)%4],group,x,.52,z);
      leaf.rotation.z=(i%2?.2:-.2);
    }
  }
  if(type==='stairs'){
    // Four overlapping treads bridge into the raised tile. The top tread
    // physically overlaps the foundation/floor edge to prevent a visual gap.
    for(let i=0;i<4;i++){
      // Last tread reaches the elevated doorway, not just the foundation edge.
      const tread=mesh(box(1.56,.13,i===3?1.22:.62),timber,group,0,.55*(i+1)/4-.065,i===3?-.96:.76-i*.50);
      tread.userData.stairTread=i;
    }
    for(const x of [-.70,.70]){
      const rail=mesh(box(.10,.9,2.12),beam,group,x,.47,-.04);
      rail.rotation.x=-.16;rail.userData.stairRail=true;
    }
  }
  if(!ghost){group.traverse(o=>{if(o.isMesh&&(wallType(type)||type==='roof')){o.material.side=THREE.DoubleSide;cameraOccluders.push(o);}});}
}
function createBuild(type,x,z,rot,ghost=false,parent=buildRoot){
  const group=new THREE.Group();group.position.set(x,0,z);group.rotation.y=rot;parent.add(group);
  if(type==='cabin')cabinShape(group,ghost);
  else modularShape(type,group,ghost);
  if(ghost){group.traverse(o=>{if(o.isMesh)o.material=new THREE.MeshBasicMaterial({color:'#98d9ac',transparent:true,opacity:.40,depthWrite:false,side:THREE.DoubleSide});});}
  return group;
}
const foundationAt=(x,z)=>hasFoundation(builds,x,z);
function raisedStairTarget(b){
  // The upper end of a stair meets the raised tile two metres ahead.
  const x=b.x-2*Math.sin(b.rot),z=b.z-2*Math.cos(b.rot);
  const topCabin=builds.some(t=>t.type==='cabin'&&t.group?.position.y>.1&&
    Math.hypot(t.x+2*Math.sin(t.rot)-x,t.z+2*Math.cos(t.rot)-z)<.35);
  if(topCabin)return .83;
  const topFloor=builds.some(t=>t.type==='floor'&&Math.hypot(t.x-x,t.z-z)<.35);
  return topFloor&&foundationAt(x,z)?.79:.55;
}
function applyStairProfile(group,target){
  group.traverse(o=>{
    if(o.userData.stairTread!==undefined)o.position.y=target*(o.userData.stairTread+1)/4-.065;
    if(o.userData.stairRail){o.position.y=target/2+.20;o.scale.y=(target+.35)/.9;}
  });
}
function refreshElevations(){
  for(const b of builds){
    if(!b.group)continue;
    b.group.position.y=supportHeight(b,builds);
    if(b.type==='floor')b.walkTop=b.group.position.y+.24;
    if(b.type==='cabin')b.walkTop=b.group.position.y+.28;
    if(b.type==='foundation')b.walkTop=.55;
    if(b.type==='stairs'){b.walkTop=raisedStairTarget(b);applyStairProfile(b.group,b.walkTop);}
  }
}
function disposeGhost(){if(!preview)return;preview.traverse(o=>{if(o.isMesh&&o.material.isMeshBasicMaterial)o.material.dispose();});buildRoot.remove(preview);preview=null;previewSignature='';}

// Cylinder/capsule collisions on XZ, plus accurately rotated cabin/wall segments.
function hitsRect(x,z,hx,hz,r=PLAYER_RADIUS){
  const dx=Math.max(Math.abs(x)-hx,0),dz=Math.max(Math.abs(z)-hz,0);return dx*dx+dz*dz < r*r;
}
function localPoint(x,z,b){const dx=x-b.x,dz=z-b.z,c=Math.cos(b.rot),s=Math.sin(b.rot);return {x:c*dx-s*dz,z:s*dx+c*dz};}
function obstacleAt(x,z){
  if(Math.abs(x)>WORLD-.65||Math.abs(z)>WORLD-.65)return true;
  for(const r of resources){if(r.hits>0&&Math.hypot(x-r.x,z-r.z)<PLAYER_RADIUS+r.radius)return true;}
  for(const b of builds){
    if(['floor','foundation','roof','stairs'].includes(b.type))continue;
    const p=localPoint(x,z,b);
    if(b.type==='wall'||b.type==='window'||b.type==='fence'){
      if(hitsRect(p.x,p.z,1,.11))return true;
    }else if(b.type==='door'){
      // The frame is solid, but the middle is a genuinely walkable gap.
      if(hitsRect(p.x-.91,p.z,.09,.11)||hitsRect(p.x+.91,p.z,.09,.11))return true;
    }else if(b.type==='cabin'&&Math.abs(p.x)<3&&Math.abs(p.z)<3){
      if(hitsRect(p.x,p.z+2.4,2.5,.11)||hitsRect(p.x-2.4,p.z,.11,2.5)||hitsRect(p.x+2.4,p.z,.11,2.5)
        ||hitsRect(p.x+1.775,p.z-2.4,.725,.11)||hitsRect(p.x-1.775,p.z-2.4,.725,.11))return true;
    }
  }
  return false;
}
function groundHeightAt(x,z){
  let h=0;
  // Walk on the actual top of floors, including floors laid over foundations.
  // Check all platforms and ramps; overlap across the stair/foundation join
  // means the character cannot drop into a tiny crack between two meshes.
  for(const b of builds){
    if(b.type==='foundation'){
      const q=localPoint(x,z,b);
      if(Math.abs(q.x)<=1.02&&Math.abs(q.z)<=1.02)h=Math.max(h,.55);
    }
    if(b.type==='floor'){
      const q=localPoint(x,z,b);
      if(Math.abs(q.x)<=1.01&&Math.abs(q.z)<=1.01)h=Math.max(h,b.walkTop??.24);
    }
    if(b.type==='cabin'&&b.group?.position.y>.1){
      const q=localPoint(x,z,b);
      // Elevated cabins share the 0.82-metre finished deck height.
      if(Math.abs(q.x)<=2.48&&Math.abs(q.z)<=2.48)h=Math.max(h,b.walkTop??.83);
    }
    if(b.type==='stairs'){
      const q=localPoint(x,z,b);
      if(Math.abs(q.x)<=.79&&q.z<=1.10&&q.z>=-1.70){
        const progress=Math.max(0,Math.min(1,(1.10-q.z)/2.14));
        h=Math.max(h,(b.walkTop??.55)*progress);
      }
    }
  }
  return h;
}
function roofVisible(){
  for(const b of builds){
    if(!b.group)continue;
    if(b.type==='cabin'){
      const p=localPoint(player.position.x,player.position.z,b);
      const indoors=Math.abs(p.x)<2.25&&Math.abs(p.z)<2.25;
      b.group.traverse(o=>{if(o.userData.roof)o.visible=!indoors;});
    }else if(b.type==='roof'){
      const p=localPoint(player.position.x,player.position.z,b);
      const below=Math.abs(p.x)<1.08&&Math.abs(p.z)<1.08;
      b.group.traverse(o=>{if(o.userData.roof)o.visible=!below;});
    }
  }
}
// v0.3 backpack; starter tools occupy two dedicated slots.
let inventory=startingInventory(),equipped='axe',inventoryOpen=false,plans=[];
let buildMode=false,buildPickerOpen=false,selected='cabin',orientation=0,preview=null,previewSignature='',validPlacement=false;
let nudgeX=0,nudgeZ=0,previewPosition={x:0,z:0},placementReason='';
let yaw=0,pitch=.38,nearby=null,runTime=0,moveVX=0,moveVZ=0;
let actionUntil=0,swingTime=0,impactTarget=null;
const move={x:0,y:0},keys=new Set();let joystickPointer=null,lookPointer=null,lastLookX=0,lastLookY=0,paused=true;
let toastTimeout=null,loadMessage='',suppressUnloadSave=false,saveReadFailed=false;
const amount=id=>count(inventory,id);
const SUPPLY_MARKER='wilderness_v052_creative_grant';
const BEFORE_GRANT='wilderness_v052_before_grant';
function refillMaterials({automatic=false}={}){
  // Atomic inventory update. Never erase existing tools or saved structures.
  const candidate=inventory.map(slot=>slot?{...slot}:null);
  try{
    for(const id of ['wood','stone']){
      const missing=Math.max(0,999-count(candidate,id));
      if(missing)addItem(candidate,id,missing,{expand:true});
    }
  }catch(e){toast('Backpack cannot hold the building supplies');return false;}
  const previous=inventory;
  inventory=candidate;
  if(!saveGame(true)){
    inventory=previous;
    toast('Could not save supplies — storage is unavailable');
    return false;
  }
  updateHud();
  if(!automatic)toast('Creative supplies: at least 999 wood + 999 stone ✓');
  return true;
}
function grantSuppliesOnce(){
  // This is a prototype, so v0.5.2 grants materials only once per Safari site.
  // Preserve the pre-grant v0.5 world for recovery. Do not grant over an invalid save.
  if(saveReadFailed)return;
  try{
    if(localStorage.getItem(SUPPLY_MARKER))return;
    const original=localStorage.getItem(SAVE_KEY);
    if(original!==null&&localStorage.getItem(BEFORE_GRANT)===null)localStorage.setItem(BEFORE_GRANT,original);
    if(refillMaterials({automatic:true})){
      localStorage.setItem(SUPPLY_MARKER,'1');
      loadMessage=loadMessage?loadMessage+' 999 wood and stone added.':'999 wood and stone added for building.';
    }
  }catch(e){console.error('Supply grant failed',e);}
}
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>$('toast').classList.remove('show'),2150);}
function updateHud(){
  $('woodCount').textContent=amount('wood');$('stoneCount').textContent=amount('stone');
  $('task').textContent=builds.length?'Homestead in progress · explore or add new modular rooms.':'Gather wood and stone, then build a cabin or your own modular home.';
  $('axeEquip').classList.toggle('active',equipped==='axe');$('pickEquip').classList.toggle('active',equipped==='pickaxe');
  $('equippedLabel').textContent=ITEM[equipped].name;
  if(inventoryOpen)renderInventory();
}
function saveData(){return makeSave({inventory,equipped,px:player.position.x,pz:player.position.z,
  resources:Object.fromEntries(resources.map(r=>[r.id,r.hits])),builds:builds.map(({type,x,z,rot})=>({type,x,z,rot})),plans});}
function saveGame(silent=false){
  if(saveReadFailed){if(!silent)toast('Save protected: export/recover your old world first');return false;}
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(saveData()));if(!silent)toast('World saved to this browser ✓');return true;}
  catch(e){if(!silent)toast('Save failed — export a backup');console.error('Save failed',e);return false;}
}
function findSafePosition(){
  if(!obstacleAt(player.position.x,player.position.z))return;
  const oldX=player.position.x,oldZ=player.position.z;let found=false;
  for(let rad=.5;rad<7&&!found;rad+=.45)for(let i=0;i<24;i++){
    const a=i*2*Math.PI/24,x=oldX+Math.cos(a)*rad,z=oldZ+Math.sin(a)*rad;
    if(!obstacleAt(x,z)){player.position.set(x,0,z);found=true;break;}
  }
  if(!found)player.position.set(0,0,0);
}
function loadGame(){
  let raw=null,origin='';
  try{
    const newer=localStorage.getItem(SAVE_KEY);
    if(newer){raw=JSON.parse(newer);origin='v0.5';}
    else {const prev04=localStorage.getItem(V04_KEY);if(prev04){raw=JSON.parse(prev04);origin='v0.4';}
      else {const prev=localStorage.getItem(V03_KEY);if(prev){raw=JSON.parse(prev);origin='v0.3';}
        else {const older=localStorage.getItem(LEGACY_KEY);if(older){raw=JSON.parse(older);origin='v0.2';}}}}
  }catch(e){saveReadFailed=true;loadMessage='Save could not be read. Stored data was not overwritten.';return;}
  if(!raw)return;
  let data;try{data=normalizeSave(raw);}catch(e){saveReadFailed=true;loadMessage='Save validation failed. Existing browser data was left untouched.';console.error(e);return;}
  inventory=data.inventory;equipped=data.equipped;plans=data.plans||[];player.position.set(data.px,0,data.pz);
  for(const r of resources){
    if(Object.prototype.hasOwnProperty.call(data.resources,r.id)){
      r.hits=data.resources[r.id];
      if(!r.hits)r.group.visible=false;
      else r.group.scale.y=Math.max(.67,1-(r.type==='tree'?3-r.hits:2-r.hits)*.1);
    }
  }
  for(const b of data.builds){const group=createBuild(b.type,b.x,b.z,b.rot);builds.push({...b,group});}
  refreshElevations();findSafePosition();
  if(origin!=='v0.5')loadMessage=saveGame(true)?`Existing ${origin} world upgraded; older save preserved.`:'Old world loaded; export a backup.';
  else loadMessage='v0.5 world loaded.';
}
function renderInventory(){
  const cells=$('inventorySlots');cells.textContent='';
  for(let i=0;i<inventory.length;i++){
    const slot=inventory[i],el=document.createElement('button');el.className='itemslot'+(slot?.id===equipped?' equipped':'');
    if(slot){const def=ITEM[slot.id];const em=document.createElement('span');em.className='sloticon';em.textContent=def.icon;
      const qty=document.createElement('span');qty.className='slotqty';qty.textContent=def.tool?'TOOL':'×'+slot.qty;
      const name=document.createElement('span');name.className='slotname';name.textContent=def.name;
      el.append(em,qty,name);el.title=def.name;
      el.addEventListener('click',()=>def.tool?equip(slot.id):toast(def.name+' · '+slot.qty+' in this stack'));
    }else{el.classList.add('empty');el.setAttribute('aria-label','Empty inventory slot');}
    cells.append(el);
  }
  $('bagSummary').textContent=`${inventory.filter(Boolean).length}/${inventory.length} slots occupied · ${amount('wood')} wood · ${amount('stone')} stone`;
  $('restorePrevious').disabled=!localStorage.getItem(PRE_IMPORT_KEY);
}
function setInventory(open){inventoryOpen=open;$('inventoryPanel').classList.toggle('show',open);
  if(open){if(buildMode)setBuildMode(false);renderInventory();}
  $('bagToggle').classList.toggle('active',open);
}
function equip(id){
  if(!ITEM[id]?.tool||!amount(id))return;
  equipped=id;axeModel.visible=id==='axe';pickModel.visible=id==='pickaxe';updateHud();
  toast(ITEM[id].name+' equipped');saveGame(true);
}
function exportSave(){
  let payload;
  try{payload=JSON.stringify(exportWrapper(saveData()),null,2);}catch(e){toast('Could not create backup');return;}
  try{
    const url=URL.createObjectURL(new Blob([payload],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;
    a.download='Wilderness-v0.5-world-'+new Date().toISOString().slice(0,10)+'.json';
    document.body.append(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),60000);
    toast('Backup prepared. Save the JSON file in Files.');
  }catch(e){toast('Export unavailable in this browser');}
}
async function importSave(file){
  if(!file)return;
  if(file.size>2_000_000){toast('Backup is too large');return;}
  let imported;
  try{imported=normalizeSave(JSON.parse(await file.text()));}
  catch(e){toast('Import rejected: '+e.message);return;}
  const question=`Restore ${imported.builds.length} buildings, ${count(imported.inventory,'wood')} wood and ${count(imported.inventory,'stone')} stone from this backup?\n\nYour current v0.5 world will be replaced. Export it first if needed.`;
  if(!window.confirm(question))return;
  try{
    const previous=localStorage.getItem(SAVE_KEY);
    if(previous!==null)localStorage.setItem(PRE_IMPORT_KEY,previous);
    localStorage.setItem(SAVE_KEY,JSON.stringify(imported));
    suppressUnloadSave=true; // Prevent pagehide from saving the superseded world.
    location.reload();
  }catch(e){toast('Import failed. Your current world is unchanged.');console.error(e);}
}
function undoLastImport(){
  let previous;
  try{previous=normalizeSave(JSON.parse(localStorage.getItem(PRE_IMPORT_KEY)||'null'));}
  catch(e){toast('No valid pre-import recovery found');return;}
  if(!window.confirm('Undo the last world import? This replaces your current v0.5 world with the previous version. Export your current world first if needed.'))return;
  try{
    const current=localStorage.getItem(SAVE_KEY);
    localStorage.setItem(SAVE_KEY,JSON.stringify(previous));
    if(current!==null)localStorage.setItem(PRE_IMPORT_KEY,current);
    suppressUnloadSave=true;location.reload();
  }catch(e){toast('Recovery failed; saved worlds were not intentionally deleted');console.error(e);}
}
loadGame();grantSuppliesOnce();axeModel.visible=equipped==='axe';pickModel.visible=equipped==='pickaxe';updateHud();
function getNearest(){
  let best=3.0,winner=null;
  for(const r of resources){if(r.hits<=0)continue;const d=Math.hypot(r.x-player.position.x,r.z-player.position.z);if(d<best){best=d;winner=r;}}
  return winner;
}
function gather(){
  if(paused||inventoryOpen)return;
  if(buildMode){toast('Close the Build menu first');return;}
  if(performance.now()<actionUntil)return;
  const r=getNearest();if(!r){toast('Move closer to a tree or rock');return;}
  const needed=r.type==='tree'?'axe':'pickaxe';
  if(equipped!==needed){toast('Equip '+ITEM[needed].name+' first');return;}
  const gain=r.type==='tree'?3:2,id=r.type==='tree'?'wood':'stone';
  if(r.hits===1&&freeCapacity(inventory,id)<gain){toast('Backpack full — make space first');return;}
  actionUntil=performance.now()+560;swingTime=.55;impactTarget=r;
  player.rotation.y=Math.atan2(r.x-player.position.x,r.z-player.position.z);
  r.hits--;r.group.scale.y=Math.max(.67,r.group.scale.y-.10);
  if(r.hits<=0){r.group.visible=false;addItem(inventory,id,gain);toast('+'+gain+' '+ITEM[id].name+' collected');}
  else toast(r.type==='tree'?'Axe hit · '+r.hits+' remaining':'Pickaxe hit · '+r.hits+' remaining');
  updateHud();saveGame(true);
}
// The blueprint menu offers built-in sets and up to six user-captured layouts.
const isPlan=()=>selected.startsWith('stock:')||selected.startsWith('saved:');
function selectedPlan(){
  const [group,num]=selected.split(':');
  return group==='stock'?STOCK_BLUEPRINTS[Number(num)]:group==='saved'?plans[Number(num)]:null;
}
function buildSelectionCost(){return isPlan()?sumCosts(selectedPlan().parts):costs[selected];}
function selectedName(){return isPlan()?selectedPlan()?.name||'Blueprint':selected.charAt(0).toUpperCase()+selected.slice(1);}
function projectedPos(){
  const forward=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw)),d=selected==='cabin'||isPlan()?6:4.1;
  const x=THREE.MathUtils.clamp(player.position.x+forward.x*d+nudgeX,-WORLD+3,WORLD-3);
  const z=THREE.MathUtils.clamp(player.position.z+forward.z*d+nudgeZ,-WORLD+3,WORLD-3);
  let pos=snappedPosition(isPlan()?'floor':selected,x,z,orientation);
  if(selected==='cabin'){
    // Snap toward a COMPLETE 3x3 raised foundation deck if one is nearby.
    const candidates=builds.filter(b=>b.type==='foundation').map(b=>({x:b.x,z:b.z}));
    const best=candidates.filter(c=>raisedCabin({type:'cabin',...c},builds))
      .sort((a,b)=>Math.hypot(a.x-pos.x,a.z-pos.z)-Math.hypot(b.x-pos.x,b.z-pos.z))[0];
    if(best&&Math.hypot(best.x-pos.x,best.z-pos.z)<=3.3)pos=best;
  }
  return pos;
}
function resolvedParts(x,z){return resolveBlueprint(selectedPlan(),x,z,orientation);}
function createPlanGhost(parts,x,z){
  const parent=new THREE.Group();parent.position.set(x,0,z);buildRoot.add(parent);
  const future=[...builds];
  for(const p of sortParts(parts)){
    const group=createBuild(p.type,p.x-x,p.z-z,p.rot,true,parent);
    const support=supportHeight(p,future);
    group.position.y=support;
    if(p.type==='stairs')applyStairProfile(group,raisedStairTarget(p));
    future.push(p);
  }
  return parent;
}
function updatePreview(){
  if(!buildMode||buildPickerOpen)return;
  const {x,z}=projectedPos();previewPosition={x,z};
  const parts=isPlan()?resolvedParts(x,z):[{type:selected,x,z,rot:orientation}];
  const signature=selected+':'+x+':'+z+':'+orientation+':'+builds.length;
  if(!preview||previewSignature!==signature){
    disposeGhost();
    preview=isPlan()?createPlanGhost(parts,x,z):createBuild(selected,x,z,orientation,true);
    previewSignature=signature;
  }
  if(!isPlan()){
    preview.position.set(x,supportHeight(parts[0],builds),z);preview.rotation.y=orientation;
    if(selected==='stairs')applyStairProfile(preview,raisedStairTarget({x,z,rot:orientation}));
  }
  placementReason=isPlan()?blueprintVerdict(parts,builds,resources,player.position,WORLD):
    placementVerdict(parts[0],builds,resources,player.position,WORLD);
  validPlacement=!placementReason;
  const c=buildSelectionCost(),enough=amount('wood')>=c.wood&&amount('stone')>=c.stone;
  const color=validPlacement?(enough?'#97c8a1':'#d8bc87'):'#d28779';
  preview.traverse(o=>{if(o.isMesh&&o.material?.color)o.material.color.set(color);});
  $('place').disabled=!validPlacement||!enough;
  $('place').textContent=!validPlacement?'Blocked':enough?'✓ Place':'Need supplies';
  const deficit=[c.wood>amount('wood')?(c.wood-amount('wood'))+' wood':'',c.stone>amount('stone')?(c.stone-amount('stone'))+' stone':''].filter(Boolean).join(' + ');
  $('buildStatus').textContent=`${selectedName()} · ${x}, ${z} · ${placementReason||(deficit?'Need '+deficit:'Ready to place')}`;
}
function choose(type){
  if(!BUILD_TYPES.includes(type)&&!/^stock:[01]$/.test(type)&&!/^saved:[0-5]$/.test(type))return;
  if(type.startsWith('saved:')&&!plans[Number(type.slice(6))])return;
  selected=type;orientation=0;nudgeX=0;nudgeZ=0;
  document.querySelectorAll('[data-type]').forEach(b=>b.classList.toggle('active',b.dataset.type===type));
  buildPickerOpen=false;syncBuildUi();disposeGhost();updatePreview();
}
function renderSavedBlueprints(){
  const el=$('savedPlans');el.textContent='';
  if(!plans.length){const hint=document.createElement('span');hint.textContent='No saved designs yet. Build something, then use Save nearby design.';hint.className='planshint';el.append(hint);return;}
  plans.forEach((plan,i)=>{
    const b=document.createElement('button');b.className='planbutton';b.dataset.type='saved:'+i;
    b.textContent=`📐 ${plan.name} (${plan.parts.length} pcs)`;
    b.addEventListener('click',()=>choose('saved:'+i));el.append(b);
  });
}
function syncBuildUi(){
  $('buildPanel').classList.toggle('show',buildMode&&buildPickerOpen);
  $('placementDock').classList.toggle('show',buildMode&&!buildPickerOpen);
  $('pieceLabel').textContent=selectedName();
}
function openBuildPicker(){
  if(!buildMode)return;
  buildPickerOpen=true;disposeGhost();renderSavedBlueprints();syncBuildUi();
}
function setBuildMode(enabled){
  if(enabled&&inventoryOpen)setInventory(false);
  buildMode=enabled;buildPickerOpen=enabled;renderSavedBlueprints();syncBuildUi();
  $('toolStrip').style.display=enabled?'none':'flex';
  $('buildToggle').textContent=enabled?'✕ Close Build':'🔨 Build';$('action').style.display=enabled?'none':'block';
  if(!enabled)disposeGhost();
}
function nudge(dx,dz){nudgeX=THREE.MathUtils.clamp(nudgeX+dx,-8,8);nudgeZ=THREE.MathUtils.clamp(nudgeZ+dz,-8,8);updatePreview();}
function nudgeRelative(right,forward){
  nudge(-Math.cos(yaw)*right*2+Math.sin(yaw)*forward*2,Math.sin(yaw)*right*2+Math.cos(yaw)*forward*2);
}
function place(){
  if(!buildMode||buildPickerOpen||paused)return;updatePreview();if(!validPlacement){toast(placementReason||'Find a clear area');return;}
  const {x,z}=previewPosition;
  const parts=isPlan()?sortParts(resolvedParts(x,z)):[{type:selected,x,z,rot:orientation}];
  if(builds.length+parts.length>500){toast('World building limit reached');return;}
  const c=buildSelectionCost();if(!payCosts(inventory,c)){toast('Gather more materials first');return;}
  for(const p of parts){const group=createBuild(p.type,p.x,p.z,p.rot);builds.push({...p,group});}
  refreshElevations();disposeGhost();updateHud();saveGame(true);
  toast(isPlan()?`${selectedName()} placed · ${parts.length} pieces`:
    selected==='cabin'?'Cabin built! Doorway stays open.':`${selectedName()} placed at ${x}, ${z}`);
  updatePreview();
}
function saveNearbyDesign(){
  if(!buildMode||paused)return;
  if(plans.length>=6){toast('Maximum 6 custom blueprints');return;}
  const anchor=snappedPosition('floor',player.position.x,player.position.z,0);
  const selectedPieces=builds.filter(b=>Math.hypot(b.x-anchor.x,b.z-anchor.z)<=6.1);
  if(!selectedPieces.length){toast('Move near a building to save its design');return;}
  if(selectedPieces.length>30){toast('Move closer: maximum 30 pieces per design');return;}
  const name=`My Design ${plans.length+1}`;
  const parts=selectedPieces.map(b=>({type:b.type,dx:b.x-anchor.x,dz:b.z-anchor.z,rot:b.rot}));
  plans.push({name,parts});saveGame(true);renderSavedBlueprints();toast(`${name} saved · ${parts.length} pieces`);
}
function canRemoveBuilding(b){
  const other=builds.filter(x=>x!==b);
  if(b.type==='foundation'){
    const supported=builds.some(t=>t!==b&&t.type==='cabin'&&raisedCabin(t,builds)&&cabinFoundationCount(t,other)<9);
    if(supported)return 'Remove the raised cabin first';
    if(builds.some(t=>t!==b&&t.type==='floor'&&Math.hypot(t.x-b.x,t.z-b.z)<.35))return 'Remove the floor on this foundation first';
    if(builds.some(t=>t!==b&&['wall','door','window','roof'].includes(t.type)&&Math.hypot(t.x-b.x,t.z-b.z)<1.45))return 'Remove supported wall/roof pieces first';
  }
  if(b.type==='floor'){
    if(builds.some(t=>t!==b&&['wall','door','window','roof'].includes(t.type)&&Math.hypot(t.x-b.x,t.z-b.z)<1.45))return 'Remove supported wall/roof pieces first';
  }
  return '';
}
function dismantleNearest(){
  if(!buildMode||paused)return;
  const candidate=builds.filter(b=>Math.hypot(b.x-player.position.x,b.z-player.position.z)<3.6)
    .sort((a,b)=>Math.hypot(a.x-player.position.x,a.z-player.position.z)-Math.hypot(b.x-player.position.x,b.z-player.position.z))[0];
  if(!candidate){toast('Walk closer to a structure first');return;}
  const error=canRemoveBuilding(candidate);if(error){toast(error);return;}
  const c=costs[candidate.type];
  const test=inventory.map(s=>s?{...s}:null);
  try{if(c.wood)addItem(test,'wood',c.wood,{expand:true});if(c.stone)addItem(test,'stone',c.stone,{expand:true});}
  catch(e){toast('Backpack full — cannot refund materials');return;}
  if(!window.confirm(`Dismantle ${candidate.type} at ${candidate.x}, ${candidate.z}? All ${c.wood} wood and ${c.stone} stone will be refunded.`))return;
  inventory=test;
  builds.splice(builds.indexOf(candidate),1);
  candidate.group.traverse(o=>{if(o.isMesh){const idx=cameraOccluders.indexOf(o);if(idx>=0)cameraOccluders.splice(idx,1);}});
  buildRoot.remove(candidate.group);
  refreshElevations();disposeGhost();updateHud();saveGame(true);toast(candidate.type+' dismantled and refunded');
  if(!buildPickerOpen)updatePreview();
}
$('start').addEventListener('click',()=>{$('modal').classList.add('hidden');paused=false;toast(loadMessage||'Explore and build your homestead!');});
$('bagToggle').addEventListener('click',()=>setInventory(!inventoryOpen));
$('closeBag').addEventListener('click',()=>setInventory(false));
$('axeEquip').addEventListener('click',()=>equip('axe'));
$('pickEquip').addEventListener('click',()=>equip('pickaxe'));
$('exportBackup').addEventListener('click',exportSave);
$('refillSupplies').addEventListener('click',()=>refillMaterials());
$('restorePrevious').addEventListener('click',undoLastImport);
$('importBackup').addEventListener('click',()=>$('backupFile').click());
$('backupFile').addEventListener('change',async e=>{const file=e.target.files?.[0];e.target.value='';await importSave(file);});
$('action').addEventListener('click',gather);
$('save').addEventListener('click',()=>saveGame());
$('buildToggle').addEventListener('click',()=>setBuildMode(!buildMode));
$('closeBuild').addEventListener('click',()=>setBuildMode(false));
$('changePiece').addEventListener('click',openBuildPicker);
$('rotate').addEventListener('click',()=>{orientation=normalizedRotation(orientation+Math.PI/2);updatePreview();});
$('resetNudge').addEventListener('click',()=>{nudgeX=nudgeZ=0;updatePreview();});
$('nudgeLeft').addEventListener('click',()=>nudgeRelative(-1,0));
$('nudgeRight').addEventListener('click',()=>nudgeRelative(1,0));
$('nudgeForward').addEventListener('click',()=>nudgeRelative(0,1));
$('nudgeBack').addEventListener('click',()=>nudgeRelative(0,-1));
$('place').addEventListener('click',place);
$('saveNearby').addEventListener('click',saveNearbyDesign);
$('dismantleNearest').addEventListener('click',dismantleNearest);
document.querySelectorAll('[data-type]').forEach(b=>b.addEventListener('click',()=>choose(b.dataset.type)));

const stick=$('stick'),knob=$('knob');
function joy(e){
  const rect=stick.getBoundingClientRect(),cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
  const dx=e.clientX-cx,dy=e.clientY-cy,max=Math.max(27,rect.width*.30);
  const mag=Math.hypot(dx,dy),scale=mag>max?max/mag:1;
  move.x=dx*scale/max;move.y=-dy*scale/max;
  knob.style.transform=`translate(${dx*scale}px,${dy*scale}px)`;
}
stick.addEventListener('pointerdown',e=>{e.preventDefault();joystickPointer=e.pointerId;stick.setPointerCapture(e.pointerId);joy(e);});
stick.addEventListener('pointermove',e=>{if(e.pointerId===joystickPointer)joy(e);});
function releaseJoy(e){if(e.pointerId===joystickPointer){joystickPointer=null;move.x=move.y=0;knob.style.transform='translate(0,0)';}}
for(const ev of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(ev,releaseJoy);
const canvas=renderer.domElement;
canvas.addEventListener('pointerdown',e=>{if(paused||e.clientX<innerWidth*.31||lookPointer!==null)return;lookPointer=e.pointerId;lastLookX=e.clientX;lastLookY=e.clientY;canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(e.pointerId!==lookPointer)return;
  yaw-=(e.clientX-lastLookX)*.0055;
  pitch=THREE.MathUtils.clamp(pitch+(lastLookY-e.clientY)*.004,.17,.94);
  lastLookX=e.clientX;lastLookY=e.clientY;
});
for(const ev of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(ev,e=>{if(e.pointerId===lookPointer)lookPointer=null;});
addEventListener('keydown',e=>{
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();
  keys.add(e.key.toLowerCase());if(e.repeat||paused)return;
  if(e.key.toLowerCase()==='e')gather();
  if(e.key==='1')equip('axe');if(e.key==='2')equip('pickaxe');
  if(e.key.toLowerCase()==='i')setInventory(!inventoryOpen);
  if(e.key.toLowerCase()==='b')setBuildMode(!buildMode);
  if(e.key.toLowerCase()==='f')place();
  if(e.key.toLowerCase()==='r'&&buildMode){orientation=normalizedRotation(orientation+Math.PI/2);updatePreview();}
  if(buildMode&&['h','j','k','l'].includes(e.key.toLowerCase())){const dirs={h:[-1,0],l:[1,0],k:[0,1],j:[0,-1]};nudgeRelative(...dirs[e.key.toLowerCase()]);}
});
addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
addEventListener('blur',()=>{keys.clear();move.x=move.y=0;joystickPointer=null;knob.style.transform='translate(0,0)';});
addEventListener('resize',()=>{
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
});
const viewRay=new THREE.Raycaster();let uiTimer=0,saveTimer=0,roofTimer=0;
function updateCamera(dt){
  const forward=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));
  const target=new THREE.Vector3(player.position.x,1.53+player.position.y,player.position.z);
  const desired=target.clone().addScaledVector(forward,-cameraDistance*Math.cos(pitch));
  desired.y+=cameraDistance*Math.sin(pitch);
  // Pull the camera forward when a solid house surface blocks its line of sight.
  const diff=desired.clone().sub(target),distance=diff.length();viewRay.set(target,diff.normalize());
  const hits=viewRay.intersectObjects(cameraOccluders.filter(o=>o.visible&&o.parent?.visible!==false),false);
  if(hits.length&&hits[0].distance<distance){
    desired.copy(target).addScaledVector(diff,Math.max(.9,hits[0].distance-.25));
  }
  camera.position.lerp(desired,Math.min(1,dt*9));camera.lookAt(target);
}
function tick(){
  requestAnimationFrame(tick);const dt=Math.min(clock.getDelta(),.05);
  if(!paused){
    const axisX=inventoryOpen?0:move.x+(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0);
    const axisZ=inventoryOpen?0:move.y+(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0);
    const amount=Math.min(1,Math.hypot(axisX,axisZ));
    let dx=0,dz=0;
    if(amount>.055){
      const vx=axisX/Math.max(1,Math.hypot(axisX,axisZ)),vz=axisZ/Math.max(1,Math.hypot(axisX,axisZ));
      // This direction mapping is intentionally identical to the user-approved v0.1.1 fix.
      dx=-Math.cos(yaw)*vx+Math.sin(yaw)*vz;
      dz=Math.sin(yaw)*vx+Math.cos(yaw)*vz;
    }
    const speed=keys.has('shift')?5.4:amount>.84?4.6:3.65;
    moveVX=THREE.MathUtils.damp(moveVX,dx*speed,12,dt);
    moveVZ=THREE.MathUtils.damp(moveVZ,dz*speed,12,dt);
    // Separately resolve X and Z to glide naturally along obstacles.
    const nextX=player.position.x+moveVX*dt;
    if(!obstacleAt(nextX,player.position.z)&&groundHeightAt(nextX,player.position.z)-groundHeightAt(player.position.x,player.position.z)<.40)player.position.x=nextX;else moveVX=0;
    const nextZ=player.position.z+moveVZ*dt;
    if(!obstacleAt(player.position.x,nextZ)&&groundHeightAt(player.position.x,nextZ)-groundHeightAt(player.position.x,player.position.z)<.40)player.position.z=nextZ;else moveVZ=0;
    const moving=Math.hypot(moveVX,moveVZ)>.17;
    if(moving&&swingTime<=0){
      const angle=Math.atan2(moveVX,moveVZ);
      player.rotation.y+=Math.atan2(Math.sin(angle-player.rotation.y),Math.cos(angle-player.rotation.y))*Math.min(1,dt*13);
      runTime+=dt*(speed>4?11:8);
      armL.rotation.x=Math.sin(runTime)*.40;armR.rotation.x=-Math.sin(runTime)*.40;
      legL.rotation.x=-Math.sin(runTime)*.39;legR.rotation.x=Math.sin(runTime)*.39;
    }else{
      armL.rotation.x*=.78;armR.rotation.x*=.78;legL.rotation.x*=.78;legR.rotation.x*=.78;
    }
    if(swingTime>0){
      swingTime=Math.max(0,swingTime-dt);
      const progress=1-swingTime/.55;
      armR.rotation.x=-.35-Math.sin(progress*Math.PI)*1.52;
      armR.rotation.z=-.16;
      if(impactTarget?.hits>0&&progress>.30&&progress<.70)impactTarget.group.rotation.z=Math.sin(progress*Math.PI*5)*.055;
      if(!swingTime){armR.rotation.z=0;if(impactTarget)impactTarget.group.rotation.z=0;impactTarget=null;}
    }
    const ground=groundHeightAt(player.position.x,player.position.z);
    player.position.y=THREE.MathUtils.damp(player.position.y,ground,14,dt);
    roofTimer+=dt;if(roofTimer>.09){roofVisible();roofTimer=0;}
    updateCamera(dt);
    if(buildMode)updatePreview();
    uiTimer+=dt;saveTimer+=dt;
    if(uiTimer>.16){
      uiTimer=0;nearby=getNearest();$('interaction').style.display=!buildMode&&!inventoryOpen&&nearby?'block':'none';
      if(nearby){
        const required=nearby.type==='tree'?'axe':'pickaxe';
        $('interaction').textContent=`${nearby.type==='tree'?'Tree':'Rock'} · ${nearby.hits} hits · ${equipped===required?'Ready':'Equip '+ITEM[required].name}`;
        $('action').textContent=nearby.type==='tree'?'🪓 Chop':'⛏ Mine';
      }else $('action').textContent='Gather';
    }
    if(saveTimer>12){saveTimer=0;saveGame(true);}
  }
  renderer.render(scene,camera);
}
camera.position.set(0,4.8,-7);camera.lookAt(0,1.53,0);
window.__wildernessDebug=()=>({version:'0.5.2',x:player.position.x,z:player.position.z,wood:amount('wood'),stone:amount('stone'),equipped,inventory:inventory.map(s=>s?{...s}:null),plans:plans.map(p=>({name:p.name,parts:p.parts.length})),builds:builds.map(b=>({type:b.type,x:b.x,z:b.z,rot:b.rot})),resources:resources.map(r=>({id:r.id,x:r.x,z:r.z,hits:r.hits})),buildMode,buildPickerOpen,selected,orientation,previewPosition,placementReason,validPlacement,paused});
window.__gameReady=true;tick();
addEventListener('pagehide',()=>{if(!suppressUnloadSave)saveGame(true);});
