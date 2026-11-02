// Wilderness v0.8. Prior Safari save keys are READ only, never overwritten by migration.
import {normalizeExploration} from './exploration-system.js';
import {normalizeFarm} from './farm-system.js';
// The v0.5 key stores extended decorations and up to six custom building blueprints.
export const LEGACY_KEY='wilderness_v01_singleplayer';
export const V03_KEY='wilderness_v03_singleplayer';
export const V04_KEY='wilderness_v04_singleplayer';
export const V05_KEY='wilderness_v05_singleplayer';
export const V06_KEY='wilderness_v06_singleplayer';
export const V07_KEY='wilderness_v07_singleplayer';
export const V08_KEY='wilderness_v08_singleplayer';
export const SAVE_KEY='wilderness_v09_singleplayer';
export const PRE_IMPORT_KEY='wilderness_v09_pre_import_recovery';
export const BACKUP_FORMAT='wilderness-world-backup';
export const ITEM=Object.freeze({
  axe:{name:'Wooden axe',icon:'🪓',max:1,tool:true},
  pickaxe:{name:'Stone pickaxe',icon:'⛏️',max:1,tool:true},
  wood:{name:'Wood',icon:'🪵',max:99},stone:{name:'Stone',icon:'🪨',max:99},
  iron_ore:{name:'Iron ore',icon:'⛰️',max:99},charcoal:{name:'Charcoal',icon:'🔥',max:99},iron_bar:{name:'Iron ingot',icon:'🔩',max:99},
  carrot_seed:{name:'Carrot seeds',icon:'🫘',max:99},potato_seed:{name:'Potato eyes',icon:'🫘',max:99},wheat_seed:{name:'Grain seeds',icon:'🫘',max:99},
  carrot:{name:'Carrot',icon:'🥕',max:99},potato:{name:'Potato',icon:'🥔',max:99},wheat:{name:'Wheat',icon:'🌾',max:99},egg:{name:'Egg',icon:'🥚',max:99},stew:{name:'Vegetable stew',icon:'🍲',max:99},
  stone_axe:{name:'Stone axe',icon:'🪓',max:1,tool:true},iron_pickaxe:{name:'Iron pickaxe',icon:'⛏️',max:1,tool:true},
  sword:{name:'Iron sword',icon:'⚔️',max:1,tool:true},shield:{name:'Wooden shield',icon:'🛡️',max:1,tool:true},bow:{name:'Hunting bow',icon:'🏹',max:1,tool:true}
});
export const MIN_SLOTS=24,MAX_SLOTS=160;
const has=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const numberIn=(n,min,max)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
const integerIn=(n,min,max)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
const types=['cabin','floor','wall','foundation','door','window','roof','stairs','path','fence','planter','workbench','chest','furnace','table','chair','bed','shelf'];
const oldTypes=types.slice(0,11);
const earlier=['cabin','floor','wall','foundation','door','window','roof','stairs'];
export function startingInventory(){const a=Array(MIN_SLOTS).fill(null);a[0]={id:'axe',qty:1};a[1]={id:'pickaxe',qty:1};return a;}
export function count(inv,id){return inv.reduce((n,s)=>n+(s?.id===id?s.qty:0),0);}
export function freeCapacity(inv,id){const d=ITEM[id];return d?inv.reduce((n,s)=>n+(s?.id===id?d.max-s.qty:!s?d.max:0),0):0;}
export function addItem(inv,id,qty,{expand=false,allowTool=false}={}){
  const d=ITEM[id];if(!d||(d.tool&&!allowTool)||!integerIn(qty,0,d.tool?1:100000000))throw Error('Invalid item');
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
  if(!s||typeof s!=='object'||Array.isArray(s)||!numberIn(s.px,version>=7?-86:-46,version>=7?86:46)||!numberIn(s.pz,version>=7?-86:-46,version>=7?86:46))throw Error('Invalid player position.');
  if(!s.resources||typeof s.resources!=='object'||Array.isArray(s.resources))throw Error('Missing resource states.');
  const resources={};
  for(const [id,hits] of Object.entries(s.resources)){
    if(!/^[tr](?:0|[1-9][0-9]?)$/.test(id)||(id[0]==='t'?Number(id.slice(1))>73:Number(id.slice(1))>50))throw Error('Unknown resource ID.');
    if(!integerIn(hits,0,id.startsWith('t')?3:2))throw Error('Invalid resource hits.');
    resources[id]=hits;
  }
  if(!Array.isArray(s.builds)||s.builds.length>500)throw Error('Invalid building list.');
  const builds=s.builds.map((b,i)=>{
    if(!b||!types.includes(b.type)||(version<5&&!oldTypes.includes(b.type))||(version===1&&!['cabin','floor','wall'].includes(b.type))||(version===2&&!['cabin','floor','wall'].includes(b.type))||(version===3&&!earlier.includes(b.type))||!numberIn(b.x,-46,46)||!numberIn(b.z,-46,46)||!numberIn(b.rot,-1000,1000))throw Error('Damaged or unsupported building.');
    const id=version>=5?b.id:'b'+(i+1);
    if(!/^b[1-9][0-9]{0,5}$/.test(id))throw Error('Invalid building ID.');
    return {id,type:b.type,x:b.x,z:b.z,rot:b.rot};
  });
  if(new Set(builds.map(b=>b.id)).size!==builds.length)throw Error('Duplicate building ID.');
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
  if(!s||![1,2,3,4,5,6,7,8].includes(s.version))throw Error('Not a supported Wilderness save.');
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
    equipped=['axe','pickaxe','stone_axe','iron_pickaxe','sword'].includes(s.equipped)&&count(inv,s.equipped)?s.equipped:'axe';
    while(inv.length<MIN_SLOTS)inv.push(null);
  }
  const chestIds=new Set(world.builds.filter(b=>b.type==='chest').map(b=>b.id));
  const storage={};
  if(s.version>=5){
    const raw=s.storage??{};
    if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Invalid chest storage.');
    for(const [id,slots] of Object.entries(raw)){
      if(!chestIds.has(id)||!Array.isArray(slots)||slots.length!==16)throw Error('Invalid chest record.');
      storage[id]=slots.map(slot=>{
        if(slot===null)return null;
        if(!slot||!has(ITEM,slot.id)||ITEM[slot.id].tool||!integerIn(slot.qty,1,ITEM[slot.id].max))throw Error('Invalid chest item.');
        return {id:slot.id,qty:slot.qty};
      });
    }
  }
  for(const id of chestIds)if(!storage[id])storage[id]=Array(16).fill(null);
  let combat={hp:100,stamina:100,wolves:{}};
  if(s.version>=6){
    const c=s.combat;
    if(!c||typeof c!=='object'||Array.isArray(c)||!numberIn(c.hp,0,100)||!numberIn(c.stamina,0,100)||!c.wolves||typeof c.wolves!=='object'||Array.isArray(c.wolves))throw Error('Invalid combat save.');
    const wolves={};
    for(const [id,deadUntil] of Object.entries(c.wolves)){
      if(!/^wolf[0-2]$/.test(id)||!integerIn(deadUntil,0,4102444800000))throw Error('Invalid wolf record.');
      wolves[id]=deadUntil;
    }
    combat={hp:c.hp,stamina:c.stamina,wolves};
  }
  const exploration=normalizeExploration(s.version>=7?s.exploration:null);
  const farm=normalizeFarm(s.version>=8?s.farm:null);
  return {version:8,inventory:inv,equipped,...world,plans:s.version>=4?blueprintsFrom(s):[],storage,combat,exploration,farm};
}
export const makeSave=({inventory,equipped,px,pz,resources,builds,plans=[],storage={},combat={hp:100,stamina:100,wolves:{}},exploration={discovered:[],claimed:[],waypoint:null},farm={plots:{},comfortUntil:0}})=>normalizeSave({version:8,inventory,equipped,px,pz,resources,builds,plans,storage,combat,exploration,farm});
export const exportWrapper=save=>({format:BACKUP_FORMAT,game:'Wilderness',exportedAt:new Date().toISOString(),save:makeSave(save)});
