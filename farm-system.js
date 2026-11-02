// Wilderness v0.9 — relaxed farming rules and light living-world support.
export const CROPS=Object.freeze({
  carrot:Object.freeze({id:'carrot',label:'Carrots',icon:'🥕',seed:'carrot_seed',growMs:45000,yields:{carrot:3,carrot_seed:1}}),
  potato:Object.freeze({id:'potato',label:'Potatoes',icon:'🥔',seed:'potato_seed',growMs:60000,yields:{potato:3,potato_seed:1}}),
  wheat:Object.freeze({id:'wheat',label:'Wheat',icon:'🌾',seed:'wheat_seed',growMs:75000,yields:{wheat:4,wheat_seed:1}})
});
const cropIds=new Set(Object.keys(CROPS));
const int=(n,min,max)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
export function normalizeFarm(value){
  if(value==null)return {plots:{},comfortUntil:0};
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Invalid farm state.');
  const plots={};
  const source=value.plots??{};
  if(!source||typeof source!=='object'||Array.isArray(source))throw Error('Invalid farm plots.');
  for(const [id,plot] of Object.entries(source)){
    if(!/^b[1-9][0-9]{0,5}$/.test(id))throw Error('Invalid farm plot ID.');
    if(plot===null){plots[id]=null;continue;}
    if(!plot||typeof plot!=='object'||Array.isArray(plot))throw Error('Invalid farm plot record.');
    if(!cropIds.has(plot.crop)||!int(plot.plantedAt,0,4102444800000))throw Error('Invalid crop record.');
    plots[id]={crop:plot.crop,plantedAt:plot.plantedAt};
  }
  const comfortUntil=int(value.comfortUntil??0,0,4102444800000)?value.comfortUntil:0;
  return {plots,comfortUntil};
}
export function getCropProgress(plot,now=Date.now()){
  if(!plot||!CROPS[plot.crop])return {stage:0,ready:false,remaining:0,def:null};
  const def=CROPS[plot.crop];
  const elapsed=Math.max(0,now-plot.plantedAt);
  const stage=Math.min(3,Math.floor((elapsed/def.growMs)*3)+1);
  return {stage,ready:elapsed>=def.growMs,remaining:Math.max(0,def.growMs-elapsed),def};
}
export function plotStatus(farm,id,now=Date.now()){
  const plot=farm?.plots?.[id]||null;
  return {plot,...getCropProgress(plot,now)};
}
export function plantCrop(farm,id,crop,now=Date.now()){
  if(!/^b[1-9][0-9]{0,5}$/.test(id)||!cropIds.has(crop))return null;
  if(farm?.plots?.[id])return null;
  return {plots:{...farm.plots,[id]:{crop,plantedAt:now}},comfortUntil:farm.comfortUntil||0};
}
export function harvestCrop(farm,id,now=Date.now()){
  const status=plotStatus(farm,id,now);
  if(!status.plot||!status.ready||!status.def)return null;
  const plots={...farm.plots}; delete plots[id];
  return {farm:{plots,comfortUntil:farm.comfortUntil||0}, rewards:{...status.def.yields}};
}
