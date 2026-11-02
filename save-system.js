// Wilderness v0.5. Old Safari keys are only READ, never overwritten by migration.
// The v0.5 key stores extended decorations and up to six custom building blueprints.
export const LEGACY_KEY='wilderness_v01_singleplayer';
export const V03_KEY='wilderness_v03_singleplayer';
export const V04_KEY='wilderness_v04_singleplayer';
export const SAVE_KEY='wilderness_v05_singleplayer';
export const PRE_IMPORT_KEY='wilderness_v05_pre_import_recovery';
export const BACKUP_FORMAT='wilderness-world-backup';
export const ITEM=Object.freeze({
  axe:{name:'Wooden axe',icon:'🪓',max:1,tool:true},
  pickaxe:{name:'Stone pickaxe',icon:'⛏️',max:1,tool:true},
  wood:{name:'Wood',icon:'🪵',max:99},stone:{name:'Stone',icon:'🪨',max:99}
});
export const MIN_SLOTS=24,MAX_SLOTS=160;
const has=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const numberIn=(n,min,max)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
const integerIn=(n,min,max)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
const types=['cabin','floor','wall','foundation','door','window','roof','stairs','path','fence','planter'];
const earlier=['cabin','floor','wall','foundation','door','window','roof','stairs'];
export function startingInventory(){const a=Array(MIN_SLOTS).fill(null);a[0]={id:'axe',qty:1};a[1]={id:'pickaxe',qty:1};return a;}
export function count(inv,id){return inv.reduce((n,s)=>n+(s?.id===id?s.qty:0),0);}
export function freeCapacity(inv,id){const d=ITEM[id];return d?inv.reduce((n,s)=>n+(s?.id===id?d.max-s.qty:!s?d.max:0),0):0;}
export function addItem(inv,id,qty,{expand=false}={}){
  const d=ITEM[id];if(!d||d.tool||!integerIn(qty,0,100000000))throw Error('Invalid item');
  if(!expand&&freeCapacity(inv,id)<qty)return false;
  const clone=inv.map(s=>s?{...s}:null);let remaining=qty;
  for(const s of clone)if(remaining&&s?.id===id){const a=Math.min(remaining,d.max-s.qty);s.qty+=a;remaining-=a;}
  for(let i=0;remaining&&i<clone.length;i++)if(!clone[i]){const a=Math.min(remaining,d.max);clone[i]={id,qty:a};remaining-=a;}
  while(remaining&&expand&&clone.length<MAX_SLOTS){const a=Math.min(remaining,d.max);clone.push({id,qty:a});remaining-=a;}
  if(remaining)throw Error('Inventory cannot hold all items');
  inv.splice(0,inv.length,...clone);return true;
}
export function payCosts(inv,costs){
  for(const [id,qty] of Object.entries(costs))if(!ITEM[id]||!integerIn(qty,0,100000)||count(inv,id)<qty)return false;
  for(const [id,qty] of Object.entries(costs)){let left=qty;
    for(let i=inv.length-1;i>=0&&left;i--){const s=inv[i];if(s?.id!==id)continue;const n=Math.min(left,s.qty);s.qty-=n;left-=n;if(!s.qty)inv[i]=null;}
  }
  return true;
}
function fields(s,version){
  if(!s||typeof s!=='object'||Array.isArray(s)||!numberIn(s.px,-46,46)||!numberIn(s.pz,-46,46))throw Error('Invalid player position.');
  if(!s.resources||typeof s.resources!=='object'||Array.isArray(s.resources))throw Error('Missing resource states.');
  const resources={};
  for(const [id,hits] of Object.entries(s.resources)){
    if(!/^(?:t(?:[0-9]|[12][0-9]|3[0-3])|r(?:[0-9]|1[0-9]|2[0-6]))$/.test(id))throw Error('Unknown resource ID.');
    if(!integerIn(hits,0,id.startsWith('t')?3:2))throw Error('Invalid resource hits.');
    resources[id]=hits;
  }
  if(!Array.isArray(s.builds)||s.builds.length>500)throw Error('Invalid building list.');
  const builds=s.builds.map(b=>{
    if(!b||!types.includes(b.type)||(version===1&&!['cabin','floor','wall'].includes(b.type))||(version===2&&!['cabin','floor','wall'].includes(b.type))||(version===3&&!earlier.includes(b.type))||!numberIn(b.x,-46,46)||!numberIn(b.z,-46,46)||!numberIn(b.rot,-1000,1000))throw Error('Damaged or unsupported building.');
    return {type:b.type,x:b.x,z:b.z,rot:b.rot};
  });
  return {px:s.px,pz:s.pz,resources,builds};
}
function blueprintsFrom(s){
  const plans=s.plans??[];
  if(!Array.isArray(plans)||plans.length>6)throw Error('Invalid custom blueprints.');
  return plans.map(plan=>{
    if(!plan||typeof plan.name!=='string'||plan.name.length>40||!/^[\w\s-]{1,40}$/.test(plan.name)||!Array.isArray(plan.parts)||!plan.parts.length||plan.parts.length>30)throw Error('Invalid custom blueprint.');
    const parts=plan.parts.map(p=>{
      if(!p||!types.includes(p.type)||!numberIn(p.dx,-12,12)||!numberIn(p.dz,-12,12)||!numberIn(p.rot,-1000,1000))throw Error('Invalid blueprint part.');
      return {type:p.type,dx:p.dx,dz:p.dz,rot:p.rot};
    });
    return {name:plan.name,parts};
  });
}
export function normalizeSave(input){
  const s=input?.format===BACKUP_FORMAT?input.save:input;
  if(!s||![1,2,3,4].includes(s.version))throw Error('Not a supported Wilderness save.');
  const world=fields(s,s.version);let inv,equipped='axe';
  if(s.version===1){
    if(!integerIn(s.wood,0,1000000)||!integerIn(s.stone,0,1000000))throw Error('Invalid legacy resources.');
    inv=startingInventory();addItem(inv,'wood',s.wood,{expand:true});addItem(inv,'stone',s.stone,{expand:true});
  }else{
    if(!Array.isArray(s.inventory)||s.inventory.length<1||s.inventory.length>MAX_SLOTS)throw Error('Invalid backpack.');
    inv=s.inventory.map(slot=>{
      if(slot===null)return null;
      if(!slot||typeof slot!=='object'||!has(ITEM,slot.id)||!integerIn(slot.qty,1,ITEM[slot.id].max))throw Error('Invalid backpack item.');
      return {id:slot.id,qty:slot.qty};
    });
    if(count(inv,'axe')!==1||count(inv,'pickaxe')!==1)throw Error('Tools are missing or duplicated.');
    equipped=['axe','pickaxe'].includes(s.equipped)?s.equipped:'axe';
    while(inv.length<MIN_SLOTS)inv.push(null);
  }
  return {version:4,inventory:inv,equipped,...world,plans:s.version===4?blueprintsFrom(s):[]};
}
export const makeSave=({inventory,equipped,px,pz,resources,builds,plans=[]})=>normalizeSave({version:4,inventory,equipped,px,pz,resources,builds,plans});
export const exportWrapper=save=>({format:BACKUP_FORMAT,game:'Wilderness',exportedAt:new Date().toISOString(),save:makeSave(save)});
