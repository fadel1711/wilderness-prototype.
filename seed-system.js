// Wilderness v0.14: renewable wild seeds; no tool or purchase required.
// Permanent IDs are retained for save compatibility.
export const SEED_PATCHES=Object.freeze([
  Object.freeze({id:'meadow',name:'Home Meadow',x:-11,z:6,seed:'carrot_seed',qty:3,icon:'🥕'}),
  Object.freeze({id:'creek',name:'Creekside Patch',x:-11,z:-12,seed:'potato_seed',qty:3,icon:'🥔'}),
  Object.freeze({id:'grove',name:'Grassy Grove',x:13,z:9,seed:'wheat_seed',qty:4,icon:'🌾'})
]);
export const PATCH_COOLDOWN_MS=35000;
export const FORAGE_RANGE=2.5;
const ALL=new Map(SEED_PATCHES.map(x=>[x.id,x]));
const validTime=x=>Number.isSafeInteger(x)&&x>=0&&x<=4102444800000;
export function normalizeForage(raw){
  if(raw==null)return {cooldowns:{}};
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Invalid seed patch record.');
  const src=raw.cooldowns??{};
  if(!src||typeof src!=='object'||Array.isArray(src))throw Error('Invalid seed cooldowns.');
  const cooldowns={};
  for(const [id,when] of Object.entries(src)){
    if(!ALL.has(id)||!validTime(when))throw Error('Invalid seed patch cooldown.');
    cooldowns[id]=when;
  }
  return {cooldowns};
}
export const nextReady=(forage,id)=>forage?.cooldowns?.[id]??0;
export const patchReady=(forage,id,now=Date.now())=>ALL.has(id)&&now>=nextReady(forage,id);
export function gatherWildSeeds(forage,id,now=Date.now()){
  const patch=ALL.get(id);
  if(!patch||!validTime(now)||!patchReady(forage,id,now))return null;
  const next={cooldowns:{...forage.cooldowns,[id]:Math.min(now+PATCH_COOLDOWN_MS,4102444800000)}};
  return {forage:next,rewards:{[patch.seed]:patch.qty},patch};
}
export function closestSeedPatch(position,range=FORAGE_RANGE){
  return SEED_PATCHES.map(p=>({patch:p,d:Math.hypot(p.x-position.x,p.z-position.z)}))
    .filter(x=>x.d<range).sort((a,b)=>a.d-b.d)[0]?.patch??null;
}
