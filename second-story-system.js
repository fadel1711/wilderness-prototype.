// Wilderness v0.21 — renderer-independent, two-storey support and ramp geometry.
// Existing ground-level objects retain their historical coordinates, IDs and collision.
export const UPPER_TYPES=Object.freeze(['loft_floor','loft_wall','loft_door','loft_window','loft_roof','loft_stairs']);
export const LOFT_BASE_Y=3.08;
export const LOFT_WALK_Y=LOFT_BASE_Y+.24;
export const LOFT_RAMP_LENGTH=4.80;
export const LOFT_FURNISH_TYPES=Object.freeze(['workbench','chest','table','chair','bed','shelf']);
const near=(a,b,r)=>Math.hypot(a.x-b.x,a.z-b.z)<r;
export const isUpper=t=>UPPER_TYPES.includes(t);
export function stairTop(b){return {x:b.x-4*Math.sin(b.rot),z:b.z-4*Math.cos(b.rot)};}
export function stairRise(b,x,z){
  const dx=x-b.x,dz=z-b.z,c=Math.cos(b.rot),s=Math.sin(b.rot);
  const xx=c*dx-s*dz,zz=s*dx+c*dz;
  if(Math.abs(xx)>.80||zz>1.93||zz< -3.05)return null;
  return LOFT_WALK_Y*Math.max(0,Math.min(1,(1.93-zz)/LOFT_RAMP_LENGTH));
}
export function supportingGroundTile(builds,x,z){
  return builds.some(b=>['floor','foundation'].includes(b.type)&&near(b,{x,z},.35));
}
export function groundSupportWalls(builds,x,z){
  return builds.filter(b=>['wall','door','window'].includes(b.type)&&near(b,{x,z},1.50)).length;
}
export function loftFloorSupported(builds,x,z){
  if(!supportingGroundTile(builds,x,z))return false;
  if(groundSupportWalls(builds,x,z)>=2)return true;
  // A shared side can support one additional tile, provided the tile also has a base floor.
  return groundSupportWalls(builds,x,z)>=1&&builds.some(b=>b.type==='loft_floor'&&Math.abs(Math.hypot(x-b.x,z-b.z)-2)<.20);
}
export function upperFootprintOverlaps(b,candidate){
  return b.type===candidate.type&&near(b,candidate,.36);
}
function wallEdgeSupported(candidate,builds){
  const sn=Math.sin(candidate.rot),cs=Math.cos(candidate.rot);
  return builds.some(b=>b.type==='loft_floor'&&
    (near(b,{x:candidate.x-sn,z:candidate.z-cs},.36)||near(b,{x:candidate.x+sn,z:candidate.z+cs},.36)));
}
export function upperPlacementVerdict(candidate,builds,resources,player,world=46){
  if(!isUpper(candidate.type))return 'Not an upper-floor part';
  if(![candidate.x,candidate.z,candidate.rot].every(Number.isFinite))return 'Invalid placement';
  const {type,x,z}=candidate;
  if(Math.abs(x)>world-4||Math.abs(z)>world-4)return 'Outside the map';
  if(builds.some(b=>upperFootprintOverlaps(b,candidate)))return 'This upper-level piece already exists';
  if(builds.some(b=>b.type==='cabin'&&Math.abs(x-b.x)<3.2&&Math.abs(z-b.z)<3.2))return 'Prefabricated cabin roof blocks an upper level — build a modular house';
  if(type==='loft_floor'){
    if(builds.some(b=>b.type==='roof'&&near(b,candidate,.95)))return 'Remove the ground-floor roof first';
    if(!loftFloorSupported(builds,x,z))return 'Needs a ground floor and two supporting walls (or a supported adjacent loft tile)';
  }
  if(['loft_wall','loft_door','loft_window'].includes(type)){
    if(!wallEdgeSupported(candidate,builds))return 'Build an upper floor under this edge first';
    if(builds.some(b=>['loft_wall','loft_door','loft_window'].includes(b.type)&&near(b,candidate,.36)))return 'Upper wall edge already occupied';
  }
  if(type==='loft_roof'){
    if(!builds.some(b=>b.type==='loft_floor'&&near(b,candidate,.36)))return 'Upper roof needs its matching upper floor';
    if(builds.filter(b=>['loft_wall','loft_door','loft_window'].includes(b.type)&&near(b,candidate,1.5)).length<2)return 'Upper roof needs two nearby upper walls';
  }
  if(type==='loft_stairs'){
    const top=stairTop(candidate);
    if(!builds.some(b=>b.type==='loft_floor'&&near(b,top,.36)))return 'Rotate/shift stairs so the high end reaches an upper floor four metres ahead';
    if(Math.hypot(player.x-x,player.z-z)<.85)return 'Too close to your character';
    for(const b of builds){
      if(b.type==='loft_stairs'&&near(b,candidate,3.2))return 'Another tall staircase occupies this spot';
      // Prevent staircase intersecting a ground-level wall or a prefabricated cabin.
      if(['wall','door','window','cabin'].includes(b.type)){
        for(let i=0;i<=10;i++){
          const t=i/10,zz=1.9-4.7*t;
          const wx=x+Math.sin(candidate.rot)*zz,wz=z+Math.cos(candidate.rot)*zz;
          if(b.type==='cabin'&&Math.abs(wx-b.x)<2.9&&Math.abs(wz-b.z)<2.9)return 'Clear ground walls/cabins from the stairway';
          if(b.type!=='cabin'&&Math.hypot(wx-b.x,wz-b.z)<.65)return 'Ground wall blocks staircase';
        }
      }
    }
    for(const r of resources){if(r.hits>0&&Math.hypot(r.x-x,r.z-z)<1.4+r.radius)return 'Resource blocks the foot of the staircase';}
  }
  return '';
}
export function canRemoveSupport(part,builds){
  const other=builds.filter(b=>b!==part);
  const same=(a,b)=>near(a,b,.36);
  for(const child of other){
    if(child.level===1&&LOFT_FURNISH_TYPES.includes(child.type)&&!other.some(b=>b.type==='loft_floor'&&near(b,child,1.07)))return 'Upstairs furnishing depends on this upper floor';
    if(child.type==='loft_floor'&&loftFloorSupported(builds,child.x,child.z)&&!loftFloorSupported(other,child.x,child.z))return 'Upper floor depends on this support — dismantle upstairs first';
    if(['loft_wall','loft_door','loft_window'].includes(child.type)&&!wallEdgeSupported(child,other))return 'Upper wall depends on this loft floor';
    if(child.type==='loft_roof'){
      if(!other.some(b=>b.type==='loft_floor'&&same(b,child))||
         other.filter(b=>['loft_wall','loft_door','loft_window'].includes(b.type)&&near(b,child,1.5)).length<2)
        return 'Upper roof depends on these walls and floor';
    }
    if(child.type==='loft_stairs'&&!other.some(b=>b.type==='loft_floor'&&same(b,stairTop(child))))return 'Tall stairs need their landing floor';
  }
  return '';
}
