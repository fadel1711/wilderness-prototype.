import {SEED_PATCHES} from './seed-system.js';
import {DEEP_CACHE,DEEP_ENTRANCE} from './deep-cave-system.js';
import {OUTER_ZONES,WORLD_RADIUS} from './world-expansion-system.js';
import {VILLAGE} from './village-system.js';
// Wilderness v0.8: renderer-independent exploration rules.
// These landmark IDs are permanent save identifiers. Never reuse an ID.
export const EXPLORE_RADIUS=WORLD_RADIUS;
export const LANDMARKS=Object.freeze([
  {id:'camp',name:'Forgotten Camp',x:-63,z:38,icon:'⛺',range:7,loot:true,info:'A quiet abandoned campsite with a supply box.'},
  {id:'overlook',name:'Stonewatch Ridge',x:55,z:62,icon:'⛰️',range:8,loot:false,info:'A rocky viewpoint above the southern woods.'},
  {id:'cave',name:'Echo Cave Entrance',x:66,z:-51,icon:'🕳️',range:7,loot:false,info:'A walk-in cave in the eastern cliffs.'},
  {id:'cache',name:'Echo Cave Cache',x:66,z:-67,icon:'💎',range:5,loot:true,info:'The original supply chest remains where it was.'},
  {id:'deep',name:'Echo Depths Maze',x:DEEP_ENTRANCE.x,z:DEEP_ENTRANCE.z,icon:'🪨',range:3.5,loot:false,info:'The passage beyond Echo Cave opens into a branching labyrinth.'},
  {id:'deep_cache',name:'Echo Depths Reliquary',x:DEEP_CACHE.x,z:DEEP_CACHE.z,icon:'💠',range:2.3,loot:true,info:'An old mineral cache in the far end of Echo Depths.'},
  ...OUTER_ZONES,
  VILLAGE
]);
export const LOOT=Object.freeze({camp:Object.freeze({wood:36,stone:22,iron_ore:8}),cache:Object.freeze({wood:24,stone:42,iron_ore:25}),deep_cache:Object.freeze({stone:36,iron_ore:30,iron_bar:5})});
const IDS=new Set(LANDMARKS.map(p=>p.id));
const WAYPOINT_IDS=new Set([...IDS,...SEED_PATCHES.map(p=>'seed:'+p.id)]);
export const distance2D=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export function nearbyLandmarks(position,range=0){return LANDMARKS.filter(l=>distance2D(position,l)<=l.range+range);}
export function normalizeExploration(value){
  if(value==null)return {discovered:[],claimed:[],waypoint:null};
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Invalid exploration record.');
  const validate=(a,label)=>{if(!Array.isArray(a)||a.length>LANDMARKS.length||a.some(id=>typeof id!=='string'||!IDS.has(id))||new Set(a).size!==a.length)throw Error('Invalid '+label+'.');return [...a];};
  const discovered=validate(value.discovered,'discovery list'),claimed=validate(value.claimed,'treasure list');
  if(claimed.some(id=>!Object.hasOwn(LOOT,id)))throw Error('Invalid claimed treasure.');
  const waypoint=value.waypoint==null?null:value.waypoint;
  if(waypoint!==null&&waypoint!=='home'&&!WAYPOINT_IDS.has(waypoint))throw Error('Invalid waypoint.');
  return {discovered,claimed,waypoint};
}
export function claimLoot(exploration,id){
  if(!Object.hasOwn(LOOT,id)||exploration.claimed.includes(id))return null;
  return {...LOOT[id]};
}
export function iconFor(l,found){return found?l.icon:'?';}
