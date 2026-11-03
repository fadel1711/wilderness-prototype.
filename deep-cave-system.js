// Wilderness v0.20 — deterministic, collidable Echo Depths maze + renewable ore.
// This module does not access cloud state. All cells stay inside the old 86m world.
export const DEEP_CAVE_VERSION = '0.20';
export const COLS=7,ROWS=4,CELL=3.05;
export const WEST=46.30, NORTH=-71.65;
export const EAST=WEST+COLS*CELL, SOUTH=NORTH-ROWS*CELL;
export const ENTRANCE={col:6,row:0};
const key=(c,r)=>r*COLS+c;
const center=(c,r)=>({x:WEST+(c+.5)*CELL,z:NORTH-(r+.5)*CELL});
function generate(){
  const walls=Array.from({length:COLS*ROWS},()=>({N:true,E:true,S:true,W:true}));
  const visited=new Set([key(ENTRANCE.col,ENTRANCE.row)]);
  const stack=[{...ENTRANCE}];let seed=90417;
  const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  while(stack.length){
    const {col,row}=stack[stack.length-1];
    const choices=[['N',col,row-1,'S'],['E',col+1,row,'W'],['S',col,row+1,'N'],['W',col-1,row,'E']]
      .filter(([,c,r])=>c>=0&&c<COLS&&r>=0&&r<ROWS&&!visited.has(key(c,r)));
    if(!choices.length){stack.pop();continue;}
    const [d,c,r,opp]=choices[Math.floor(rand()*choices.length)];
    walls[key(col,row)][d]=false;walls[key(c,r)][opp]=false;
    visited.add(key(c,r));stack.push({col:c,row:r});
  }
  // Only the original Echo Cave continuation is open to the new maze.
  walls[key(6,0)].N=false;
  return walls;
}
export const CELL_WALLS=generate();
export const MAZE_WALLS=Object.freeze((()=>{
  const list=[];const t=.44;
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
    const w=CELL_WALLS[key(c,r)],p=center(c,r);
    if(w.N)list.push({x:p.x,z:NORTH-r*CELL,w:CELL+t,d:t});
    if(w.W)list.push({x:WEST+c*CELL,z:p.z,w:t,d:CELL+t});
    if(r===ROWS-1&&w.S)list.push({x:p.x,z:SOUTH,w:CELL+t,d:t});
    if(c===COLS-1&&w.E)list.push({x:EAST,z:p.z,w:t,d:CELL+t});
  }
  return list;
})());
export function insideDeepCave(x,z){return x>=WEST&&x<=EAST&&z>=SOUTH&&z<=NORTH;}
export function caveRockZone(x,z){return x>WEST-.65&&x<EAST+.7&&z>SOUTH-.7&&z<NORTH+.20;}
export function deepCaveWallAt(x,z,radius=.32){
  for(const b of MAZE_WALLS){
    const dx=Math.max(Math.abs(x-b.x)-b.w/2,0),dz=Math.max(Math.abs(z-b.z)-b.d/2,0);
    if(dx*dx+dz*dz<radius*radius)return true;
  }
  return false;
}
const neighbors=(c,r)=>[['N',c,r-1],['E',c+1,r],['S',c,r+1],['W',c-1,r]]
  .filter(([d,x,z])=>x>=0&&x<COLS&&z>=0&&z<ROWS&&!CELL_WALLS[key(c,r)][d]);
export function reachableCells(){
  const start=ENTRANCE,queue=[{...start,steps:0}],seen=new Set([key(start.col,start.row)]);
  for(let n=0;n<queue.length;n++){
    const cur=queue[n];
    for(const [,c,r] of neighbors(cur.col,cur.row)){
      if(seen.has(key(c,r)))continue;
      seen.add(key(c,r));queue.push({col:c,row:r,steps:cur.steps+1});
    }
  }
  return queue;
}
export const ROUTE=reachableCells();
const farthest=ROUTE.reduce((a,b)=>b.steps>a.steps?b:a,ROUTE[0]);
export const DEEP_CACHE={...center(farthest.col,farthest.row),name:'Echo Depths Reliquary',id:'deep_cache'};
export const DEEP_ENTRANCE={x:66.1,z:-74.5,id:'deep',name:'Echo Depths'};
export const ORE_VEINS=Object.freeze(ROUTE.filter(({steps})=>steps>=3)
  .filter((_,i)=>i%3===0).slice(0,8).map((cell,i)=>({
    id:'vein'+i,x:center(cell.col,cell.row).x+(i%2?-.51:.47),
    z:center(cell.col,cell.row).z+(i%2?.39:-.35),color:i%3===0?'#6baaa0':'#aea4b5',label:i%3===0?'Mineral seam':'Iron-rich vein'
  })));
const validInt=(n,min,max)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
export const VEIN_HITS=3,ORE_REGROW_MS=180000;
export function normalizeDeepCave(data){
  if(data==null)return {veins:{}};
  if(!data||typeof data!=='object'||Array.isArray(data)||!data.veins||typeof data.veins!=='object'||Array.isArray(data.veins))throw Error('Invalid deep cave state.');
  const ids=new Set(ORE_VEINS.map(v=>v.id)),veins={};
  for(const [id,v] of Object.entries(data.veins)){
    if(!ids.has(id)||!v||typeof v!=='object'||!validInt(v.hits,0,VEIN_HITS)||!validInt(v.readyAt,0,4102444800000)||((v.hits>0)&&v.readyAt!==0))throw Error('Invalid mineral vein state.');
    veins[id]={hits:v.hits,readyAt:v.readyAt};
  }
  return {veins};
}
export function veinStatus(data,id,now=Date.now()){
  const v=ORE_VEINS.find(x=>x.id===id);if(!v)throw Error('Unknown ore vein.');
  const state=data?.veins?.[id];
  return !state||state.hits===0&&state.readyAt<=now?{hits:VEIN_HITS,readyAt:0}:state;
}
export function mineVein(data,id,now=Date.now(),power=1){
  if(!ORE_VEINS.some(v=>v.id===id)||!validInt(power,1,2))return null;
  const state=veinStatus(data,id,now);
  if(state.hits===0)return null;
  const hits=Math.max(0,state.hits-power),completed=hits===0;
  const veins={...data.veins,[id]:{hits,readyAt:completed?now+ORE_REGROW_MS:0}};
  return {deepCave:{veins},hits,completed,reward:completed?{stone:5,iron_ore:3}:null};
}
export function nearestVein(position,range=2.35){
  let best=null,bestDist=range;
  for(const v of ORE_VEINS){const d=Math.hypot(v.x-position.x,v.z-position.z);if(d<bestDist){best=v;bestDist=d;}}
  return best;
}
export function createDeepCave(THREE,parent){
  const root=new THREE.Group();parent.add(root);
  const roof=new THREE.Group();root.add(roof);
  const stone=new THREE.MeshStandardMaterial({color:'#666e69',roughness:1,flatShading:true});
  const dark=new THREE.MeshStandardMaterial({color:'#4b5753',roughness:1,flatShading:true});
  const gravel=new THREE.MeshStandardMaterial({color:'#626259',roughness:1,flatShading:true});
  const glow=new THREE.MeshStandardMaterial({color:'#c7bca4',emissive:'#ad9374',emissiveIntensity:.47,roughness:.9});
  const mineral=new THREE.MeshStandardMaterial({color:'#8aada7',emissive:'#527e7b',emissiveIntensity:.28,roughness:.75});
  const wallMesh=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),stone,MAZE_WALLS.length);
  const dummy=new THREE.Object3D();
  MAZE_WALLS.forEach((w,i)=>{dummy.position.set(w.x,1.86,w.z);dummy.scale.set(w.w,3.7,w.d);dummy.rotation.set(0,0,0);dummy.updateMatrix();wallMesh.setMatrixAt(i,dummy.matrix);});
  wallMesh.instanceMatrix.needsUpdate=true;root.add(wallMesh);
  // Rough polygon relief on the walls, baked as a single instanced draw call.
  const chips=[];for(let i=0;i<MAZE_WALLS.length;i++)for(let j=0;j<3;j++)chips.push([MAZE_WALLS[i],i,j]);
  const chipMesh=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.62,0),dark,chips.length);
  chips.forEach(([w,i,j],k)=>{
    const a=((i*41+j*17)%23)/22-.5;
    dummy.position.set(w.x+(w.w>w.d?a*w.w*.72:0),.6+((i+j)%4)*.80,w.z+(w.d>w.w?a*w.d*.72:0));
    dummy.rotation.set(.2*i,.41*i,.27*j);dummy.scale.set(w.w>w.d?.62:1.0,.55,w.d>w.w?.62:1.0);dummy.updateMatrix();chipMesh.setMatrixAt(k,dummy.matrix);
  });chipMesh.instanceMatrix.needsUpdate=true;root.add(chipMesh);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(COLS*CELL,ROWS*CELL),gravel);
  floor.rotation.x=-Math.PI/2;floor.position.set((WEST+EAST)/2,-.052,(NORTH+SOUTH)/2);root.add(floor);
  const ceiling=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),stone,COLS*ROWS);
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
    const p=center(c,r),i=key(c,r);dummy.position.set(p.x,3.94,p.z);dummy.rotation.set(.13*r,.27*c,0);
    dummy.scale.set(CELL*.87,.66+(i%3)*.12,CELL*.83);dummy.updateMatrix();ceiling.setMatrixAt(i,dummy.matrix);
  }ceiling.instanceMatrix.needsUpdate=true;roof.add(ceiling);
  // Entrance lip visually bridges the previous Echo Cave tunnel into the maze.
  for(const x of [64.3,67.9]){
    const m=new THREE.Mesh(new THREE.IcosahedronGeometry(1,1),dark);m.position.set(x,1.3,-72.65);m.scale.set(.75,1.5,1.2);root.add(m);
  }
  // Exterior stone berm: disguises the maze as the underside of a ridge from outdoors.
  // Decorative only; the maze's own collision boundaries remain the gameplay truth.
  const shell=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),dark,38);
  for(let i=0;i<38;i++){
    const side=i%4,slot=Math.floor(i/4),fraction=(slot+.33)/10;
    let x,z;
    if(side===0){x=WEST-.95;z=NORTH-fraction*ROWS*CELL;}
    else if(side===1){x=EAST+.98;z=NORTH-fraction*ROWS*CELL;}
    else if(side===2){x=WEST+fraction*COLS*CELL;z=SOUTH-.93;}
    else {x=WEST+fraction*COLS*CELL;z=NORTH+.92;}
    // Keep the original cave-to-maze portal completely unobstructed.
    if(side===3&&x>63.0){x=WEST+.2+fraction*7.5;z=NORTH+1.3;}
    dummy.position.set(x,1.53+Math.sin(i)*.28,z);
    dummy.rotation.set(.1*i,.17*i,.08*i);dummy.scale.set(1.15+(i%3)*.39,1.3+(i%4)*.20,1.05+(i%5)*.31);
    dummy.updateMatrix();shell.setMatrixAt(i,dummy.matrix);
  }shell.instanceMatrix.needsUpdate=true;root.add(shell);
  const torchGroup=new THREE.Group();root.add(torchGroup);
  const light=new THREE.MeshBasicMaterial({color:'#f8c77b'});
  for(const {col,row,steps} of ROUTE.filter(n=>n.steps>0&&n.steps%8===0).slice(0,4)){
    const p=center(col,row),torch=new THREE.Mesh(new THREE.ConeGeometry(.13,.35,6),light);
    torch.position.set(p.x,1.3,p.z);torchGroup.add(torch);
  }
  const veinModels=new Map();const oreGeometry=new THREE.IcosahedronGeometry(.47,1);
  for(const v of ORE_VEINS){
    const g=new THREE.Group();g.position.set(v.x,0,v.z);root.add(g);
    const rock=new THREE.Mesh(oreGeometry,dark);rock.position.y=.42;rock.scale.set(1.18,.85,1.03);g.add(rock);
    for(let j=0;j<4;j++){
      const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(.13+(j%2)*.08,0),mineral);
      crystal.position.set(Math.sin(j*2.4)*.29,.51+(j%2)*.15,Math.cos(j*2.4)*.23);crystal.rotation.z=j*.43;g.add(crystal);
    }
    veinModels.set(v.id,g);
  }
  const chestGroup=new THREE.Group();chestGroup.position.set(DEEP_CACHE.x,0,DEEP_CACHE.z);root.add(chestGroup);
  const chestBase=new THREE.Mesh(new THREE.BoxGeometry(.98,.63,.73),new THREE.MeshStandardMaterial({color:'#77644c',roughness:.9}));
  chestBase.position.y=.32;chestGroup.add(chestBase);
  const lid=new THREE.Mesh(new THREE.BoxGeometry(1.07,.18,.82),glow);lid.position.y=.72;chestGroup.add(lid);
  const marker=new THREE.Mesh(new THREE.OctahedronGeometry(.26,0),mineral);marker.position.y=1.17;chestGroup.add(marker);
  return {root,roof,walls:wallMesh,chest:chestGroup,veinModels,
    update(px,pz,data,low=false){const inside=insideDeepCave(px,pz);roof.visible=!(inside||Math.hypot(px-66,pz+70)<4);
      for(const v of ORE_VEINS){const m=veinModels.get(v.id);const s=veinStatus(data,v.id);m.visible=s.hits>0;}
      torchGroup.visible=!low;marker.visible=!low;
    }};
}
