// Wilderness v0.4 — testable, renderer-independent modular construction rules.
// All new modular pieces snap on a consistent 2-metre grid; old builds keep their saved positions.
export const BUILD_TYPES=Object.freeze(['cabin','floor','wall','foundation','door','window','roof','stairs']);
export const WALL_TYPES=Object.freeze(['wall','door','window']);
export const COSTS=Object.freeze({
  cabin:{wood:12,stone:5}, floor:{wood:2,stone:0}, wall:{wood:3,stone:0},
  foundation:{wood:2,stone:2},door:{wood:3,stone:0},window:{wood:3,stone:1},
  roof:{wood:4,stone:0},stairs:{wood:3,stone:0}
});
const PI=Math.PI;
const close=(a,b,eps=.17)=>Math.abs(a-b)<eps;
export const modular=t=>t!=='cabin';
export const wallType=t=>WALL_TYPES.includes(t);
export const normalizedRotation=rot=>((Math.round(rot/(PI/2))%4)+4)%4*(PI/2);
export function snappedPosition(type,x,z,rot){
  if(!BUILD_TYPES.includes(type)||![x,z,rot].every(Number.isFinite))throw Error('Invalid placement');
  const turn=Math.round(normalizedRotation(rot)/(PI/2));
  if(wallType(type))return turn%2===0?
    {x:Math.round(x/2)*2,z:Math.round((z-1)/2)*2+1}:
    {x:Math.round((x-1)/2)*2+1,z:Math.round(z/2)*2};
  return {x:Math.round(x/2)*2,z:Math.round(z/2)*2};
}
export function localXZ(x,z,b){const dx=x-b.x,dz=z-b.z,c=Math.cos(b.rot),s=Math.sin(b.rot);return {x:c*dx-s*dz,z:s*dx+c*dz};}
const near=(a,b,r)=>Math.hypot(a.x-b.x,a.z-b.z)<r;
function floorUnder(wall,b){
  // A wall lives at a tile edge; at least one adjacent tile has a floor or foundation.
  if(!['floor','foundation'].includes(b.type))return false;
  const p=localXZ(wall.x,wall.z,{x:b.x,z:b.z,rot:wall.rot});
  // In wall coordinates: support tile centers sit one metre either side of its local Z axis.
  return Math.abs(p.x)<.18&&Math.abs(Math.abs(p.z)-1)<.18;
}
export function placementVerdict(candidate,builds,resources,player,world=46){
  const {type,x,z,rot}=candidate;
  if(!BUILD_TYPES.includes(type)||![x,z,rot].every(Number.isFinite))return 'Invalid building';
  const radius=type==='cabin'?3.35:wallType(type)?1.06:1.3;
  if(Math.abs(x)>world-radius-.4||Math.abs(z)>world-radius-.4)return 'Outside the map';
  if(Math.hypot(x-player.x,z-player.z)<(type==='cabin'?3.25:wallType(type)?.80:1.0))return 'Too close to your character';
  for(const r of resources){if(r.hits>0&&Math.hypot(r.x-x,r.z-z)<radius+r.radius+.28)return 'Resource in the way';}
  for(const b of builds){
    if(b.type==='cabin'&&Math.abs(x-b.x)<(type==='cabin'?5.1:3.65)&&Math.abs(z-b.z)<(type==='cabin'?5.1:3.65))return 'Cabin already occupies this area';
    if(type==='cabin'&&near(candidate,b,4.0))return 'Existing structure in the way';
    if(wallType(type)&&wallType(b.type)&&near(candidate,b,.35))return 'Wall edge already occupied';
    if(type===b.type&&['floor','foundation'].includes(type)&&near(candidate,b,.35))return 'Tile already occupied';
    if(type==='roof'&&b.type==='roof'&&near(candidate,b,.35))return 'Roof already occupied';
    if(type==='stairs'&&b.type==='stairs'&&near(candidate,b,.35))return 'Stairs already occupied';
    if(type==='stairs'&&['floor','foundation'].includes(b.type)&&near(candidate,b,.35))return 'Stairs need an open tile';
  }
  if(wallType(type)&&!builds.some(b=>floorUnder(candidate,b)))return 'Place a floor or foundation first';
  if(type==='roof'){
    const beneath=builds.some(b=>['floor','foundation'].includes(b.type)&&near(candidate,b,.35));
    if(!beneath)return 'Roof needs a floor below';
    const adjacent=builds.filter(b=>wallType(b.type)&&Math.hypot(b.x-x,b.z-z)<1.45).length;
    if(adjacent<2)return 'Roof needs two nearby wall pieces';
  }
  if(type==='stairs'){
    const top={x:x-2*Math.sin(rot),z:z-2*Math.cos(rot)};
    if(!builds.some(b=>b.type==='foundation'&&near(top,b,.35)))return 'Rotate steps so their high end meets a foundation';
  }
  return '';
}
