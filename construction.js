// Wilderness v0.5 — pure, renderer-independent construction, support and blueprint rules.
// Existing v0.4 positions and types remain unchanged; elevated placements are derived.
export const BUILD_TYPES=Object.freeze(['cabin','floor','wall','foundation','door','window','roof','stairs','path','fence','planter']);
export const WALL_TYPES=Object.freeze(['wall','door','window','fence']);
export const COSTS=Object.freeze({
  cabin:{wood:12,stone:5},floor:{wood:2,stone:0},wall:{wood:3,stone:0},
  foundation:{wood:2,stone:2},door:{wood:3,stone:0},window:{wood:3,stone:1},
  roof:{wood:4,stone:0},stairs:{wood:3,stone:0},path:{wood:0,stone:1},
  fence:{wood:2,stone:0},planter:{wood:2,stone:1}
});
const PI=Math.PI;
const near=(a,b,r)=>Math.hypot(a.x-b.x,a.z-b.z)<r;
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
export const hasFoundation=(builds,x,z)=>builds.some(b=>b.type==='foundation'&&near({x,z},b,.35));
export function cabinFootprint(candidate){
  // A 5x5-metre cabin fits fully on nine touching 2x2-metre foundation tiles.
  const result=[];
  for(const dx of [-2,0,2])for(const dz of [-2,0,2])result.push({x:candidate.x+dx,z:candidate.z+dz});
  return result;
}
export const cabinFoundationCount=(candidate,builds)=>cabinFootprint(candidate).filter(p=>hasFoundation(builds,p.x,p.z)).length;
export const raisedCabin=(candidate,builds)=>cabinFoundationCount(candidate,builds)===9;
export function supportHeight(candidate,builds){
  if(candidate.type==='cabin')return raisedCabin(candidate,builds)?.55:0;
  if(['floor','roof','planter'].includes(candidate.type))return hasFoundation(builds,candidate.x,candidate.z)?.55:0;
  if(['wall','door','window','fence'].includes(candidate.type)){
    const sn=Math.sin(candidate.rot),cs=Math.cos(candidate.rot);
    return (hasFoundation(builds,candidate.x-sn,candidate.z-cs)||hasFoundation(builds,candidate.x+sn,candidate.z+cs))?.55:0;
  }
  return 0;
}
function floorUnder(wall,b){
  if(!['floor','foundation'].includes(b.type))return false;
  const p=localXZ(wall.x,wall.z,{x:b.x,z:b.z,rot:wall.rot});
  return Math.abs(p.x)<.18&&Math.abs(Math.abs(p.z)-1)<.18;
}
export function placementVerdict(candidate,builds,resources,player,world=46){
  const {type,x,z,rot}=candidate;
  if(!BUILD_TYPES.includes(type)||![x,z,rot].every(Number.isFinite))return 'Invalid building';
  const radius=type==='cabin'?3.35:wallType(type)?1.06:type==='path'?.95:1.30;
  if(Math.abs(x)>world-radius-.4||Math.abs(z)>world-radius-.4)return 'Outside the map';
  if(Math.hypot(x-player.x,z-player.z)<(type==='cabin'?3.25:wallType(type)?.80:1.0))return 'Too close to your character';
  for(const r of resources){if(r.hits>0&&near(r,candidate,radius+r.radius+.28))return 'Resource in the way';}
  const footprintCount=type==='cabin'?cabinFoundationCount(candidate,builds):0;
  // Cabins are either completely on the ground or completely supported by a 3x3 pad.
  if(type==='cabin'&&footprintCount>0&&footprintCount<9)return `Cabin needs 9 foundation tiles (${footprintCount}/9)`;
  for(const b of builds){
    if(b.type==='cabin'){
      const q=localXZ(x,z,b);
      // Keep the interior solid, but allow new modular rooms next to the cabin.
      const clearance=type==='cabin'?5.1:wallType(type)?2.72:3.45;
      if(Math.abs(q.x)<clearance&&Math.abs(q.z)<clearance)return 'Cabin already occupies this area';
    }
    if(type==='cabin'){
      // Only the nine supporting foundation tiles are allowed underneath a cabin.
      if(b.type==='foundation'&&Math.abs(x-b.x)<3.01&&Math.abs(z-b.z)<3.01)continue;
      if(near(candidate,b,4.0))return 'Remove nearby pieces before placing cabin';
    }
    if(wallType(type)&&wallType(b.type)&&near(candidate,b,.35))return 'Edge already occupied';
    if(type===b.type&&['floor','foundation','path','planter'].includes(type)&&near(candidate,b,.35))return 'Tile already occupied';
    if(type==='floor'&&b.type==='cabin'&&near(candidate,b,3))return 'Cabin already has a floor';
    if(type==='roof'&&b.type==='roof'&&near(candidate,b,.35))return 'Roof already occupied';
    if(type==='stairs'&&b.type==='stairs'&&near(candidate,b,.35))return 'Stairs already occupied';
    if(type==='stairs'&&['floor','foundation'].includes(b.type)&&near(candidate,b,.35))return 'Stairs need an open tile';
    if(type==='foundation'&&b.type==='floor'&&near(candidate,b,.35))return 'Remove this floor before adding foundation';
    if(type==='foundation'&&b.type==='planter'&&near(candidate,b,.35))return 'Planter occupies this tile';
  }
  if(['wall','door','window'].includes(type)&&!builds.some(b=>floorUnder(candidate,b)))return 'Place a floor or foundation first';
  if(type==='roof'){
    const beneath=builds.some(b=>['floor','foundation'].includes(b.type)&&near(candidate,b,.35));
    if(!beneath)return 'Roof needs a floor below';
    const adjacent=builds.filter(b=>['wall','door','window'].includes(b.type)&&near(candidate,b,1.45)).length;
    if(adjacent<2)return 'Roof needs two nearby wall pieces';
  }
  if(type==='stairs'){
    const top={x:x-2*Math.sin(rot),z:z-2*Math.cos(rot)};
    if(!hasFoundation(builds,top.x,top.z))return 'Rotate steps so their high end meets a foundation';
  }
  return '';
}
export const sumCosts=pieces=>pieces.reduce((out,p)=>{
  const c=COSTS[p.type];if(!c)throw Error('Unknown building part');
  out.wood+=c.wood;out.stone+=c.stone;return out;
},{wood:0,stone:0});
export const shiftPart=(part,x,z,rot)=>{
  const c=Math.cos(rot),s=Math.sin(rot);
  return {type:part.type,x:Math.round((x+c*part.dx+s*part.dz)*2)/2,
    z:Math.round((z-s*part.dx+c*part.dz)*2)/2,rot:normalizedRotation(rot+part.rot)};
};
export function resolveBlueprint(plan,x,z,rot){return plan.parts.map(p=>shiftPart(p,x,z,rot));}
export const sortParts=parts=>[...parts].sort((a,b)=>{
  const order={foundation:0,path:1,floor:2,cabin:3,stairs:4,wall:5,door:5,window:5,fence:5,planter:6,roof:7};
  return order[a.type]-order[b.type];
});
export function blueprintVerdict(parts,builds,resources,player,world=46){
  const test=[...builds];
  for(const p of sortParts(parts)){
    const result=placementVerdict(p,test,resources,player,world);
    if(result)return `${p.type}: ${result}`;
    test.push(p);
  }
  return '';
}
export const STOCK_BLUEPRINTS=Object.freeze([
  {name:'Raised Deck',parts:[
    ...[[0,0],[2,0],[0,2],[2,2]].map(([dx,dz])=>({type:'foundation',dx,dz,rot:0})),
    ...[[0,0],[2,0],[0,2],[2,2]].map(([dx,dz])=>({type:'floor',dx,dz,rot:0})),
    {type:'stairs',dx:0,dz:4,rot:0}]},
  {name:'Garden Corner',parts:[
    ...[[0,0],[2,0],[0,2],[2,2]].map(([dx,dz])=>({type:'path',dx,dz,rot:0})),
    {type:'planter',dx:4,dz:0,rot:0},{type:'planter',dx:4,dz:2,rot:0},
    {type:'fence',dx:1,dz:0,rot:Math.PI/2}]}
]);
