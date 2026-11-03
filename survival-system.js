// Wilderness v0.13: relaxing, renderer-independent player needs.
// Drain happens only while actively playing, never from device clock or offline time.
import {DAY_SECONDS} from './atmosphere-system.js';
export const START_NEEDS=Object.freeze({hunger:88,thirst:85,energy:90,mode:'survival'});
export const EDIBLES=Object.freeze({
  carrot:Object.freeze({hunger:13,thirst:3}),
  potato:Object.freeze({hunger:18,thirst:0}),
  egg:Object.freeze({hunger:17,thirst:0}),
  stew:Object.freeze({hunger:40,thirst:14,energy:5}),
  water:Object.freeze({thirst:40})
});
const finiteLevel=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=100;
export const clampNeed=n=>Math.max(0,Math.min(100,n));
export function normalizeSurvival(data){
  if(data==null)return {...START_NEEDS};
  if(!data||typeof data!=='object'||Array.isArray(data))throw Error('Invalid survival record');
  for(const k of ['hunger','thirst','energy'])if(!finiteLevel(data[k]))throw Error('Invalid survival '+k);
  if(!['survival','creative'].includes(data.mode))throw Error('Invalid survival mode');
  return {hunger:data.hunger,thirst:data.thirst,energy:data.energy,mode:data.mode};
}
export function advanceSurvival(raw,seconds,{moving=false,sprinting=false}={}){
  const s=normalizeSurvival(raw);
  if(s.mode==='creative'||!Number.isFinite(seconds)||seconds<=0)return s;
  const dt=Math.min(seconds,1); // Never apply a huge catch-up drain after tab suspension.
  const effort=sprinting?1.45:moving?1.14:1;
  return {mode:s.mode,
    hunger:clampNeed(s.hunger-dt*.022*effort),
    thirst:clampNeed(s.thirst-dt*.034*effort),
    energy:clampNeed(s.energy-dt*(sprinting?.028:moving?.018:.012))};
}
export function consumeSurvival(raw,id){
  if(!Object.prototype.hasOwnProperty.call(EDIBLES,id))return null;
  const s=normalizeSurvival(raw),n=EDIBLES[id];
  return {...s,hunger:clampNeed(s.hunger+(n.hunger||0)),thirst:clampNeed(s.thirst+(n.thirst||0)),energy:clampNeed(s.energy+(n.energy||0))};
}
export function drinkAtSpring(raw){return {...normalizeSurvival(raw),thirst:100};}
export function needsPenalty(raw){
  const s=normalizeSurvival(raw);
  if(s.mode==='creative')return {speed:1,stamina:1};
  const low=Math.min(s.hunger,s.thirst,s.energy);
  return {speed:low<12?.82:low<25?.92:1,stamina:low<12?.58:low<25?.78:1};
}
export function sleepUntilMorning(elapsed){
  if(!Number.isFinite(elapsed)||elapsed<0)return 7/24*DAY_SECONDS;
  const day=Math.floor(elapsed/DAY_SECONDS),dayPart=elapsed%DAY_SECONDS;
  const dawn=DAY_SECONDS*7/24;
  return (day+(dayPart>=dawn?1:0))*DAY_SECONDS+dawn;
}
export function sleepSurvival(raw){
  const s=normalizeSurvival(raw);
  return {hunger:clampNeed(s.hunger-(s.mode==='creative'?0:3)),thirst:clampNeed(s.thirst-(s.mode==='creative'?0:4)),energy:100,mode:s.mode};
}
