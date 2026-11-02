// Wilderness v0.7 combat rules — pure functions, no rendering or browser APIs.
export const MAX_HEALTH=100,MAX_STAMINA=100,SAFE_RADIUS=9,RESPAWN_MS=90000;
export const WOLF_SPAWNS=Object.freeze([{id:'wolf0',x:17,z:14},{id:'wolf1',x:-24,z:19},{id:'wolf2',x:21,z:-24}]);
export const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export function inSafeZone(pos,buildings,radius=SAFE_RADIUS){
  if(Math.hypot(pos.x,pos.z)<radius)return true; // protected origin, even before first cabin
  return buildings.some(b=>b.type==='cabin'&&distance(pos,b)<radius);
}
export function attackResult({hp,stamina,blocked=false,dodging=false,damage=12}){
  if(dodging)return {hp,stamina,hurt:0,blocked:false};
  const blocks=blocked&&stamina>=7;
  const hurt=blocks?Math.max(1,Math.ceil(damage*.18)):damage;
  return {hp:clamp(hp-hurt,0,MAX_HEALTH),stamina:blocks?clamp(stamina-7,0,MAX_STAMINA):stamina,hurt,blocked:blocks};
}
export function canAttack(stamina,weapon=true){return weapon&&stamina>=12;}
export function combatRespawn(buildings){
  const home=buildings.find(b=>b.type==='cabin');
  return home?{x:clamp(home.x+6,-44,44),z:clamp(home.z+6,-44,44)}:{x:0,z:0};
}
export function wolfState(distanceToPlayer,atSafeBoundary){
  if(atSafeBoundary)return 'retreat';
  if(distanceToPlayer<1.6)return 'bite';
  if(distanceToPlayer<11)return 'chase';
  return 'wander';
}
