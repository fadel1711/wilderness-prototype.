// Wilderness v0.3 — pure, separately testable save and inventory logic.
// The legacy key is READ-ONLY in v0.3. v0.2 rollback remains possible.
export const LEGACY_KEY = 'wilderness_v01_singleplayer';
export const SAVE_KEY = 'wilderness_v03_singleplayer';
export const PRE_IMPORT_KEY = 'wilderness_v03_pre_import_recovery';
export const BACKUP_FORMAT = 'wilderness-world-backup';
export const ITEM = Object.freeze({
  axe:    {name:'Wooden axe',icon:'🪓',max:1,tool:true},
  pickaxe:{name:'Stone pickaxe',icon:'⛏️',max:1,tool:true},
  wood:   {name:'Wood',icon:'🪵',max:99},
  stone:  {name:'Stone',icon:'🪨',max:99}
});
export const MIN_SLOTS=24, MAX_SLOTS=160;
const OWN=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const numberIn=(n,min,max)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
const integerIn=(n,min,max)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
export function startingInventory(){const inv=Array(MIN_SLOTS).fill(null);inv[0]={id:'axe',qty:1};inv[1]={id:'pickaxe',qty:1};return inv;}
export function count(inv,id){return inv.reduce((n,s)=>n+(s?.id===id?s.qty:0),0);}
export function freeCapacity(inv,id){const def=ITEM[id];if(!def)return 0;
  return inv.reduce((n,s)=>n+(s?.id===id?def.max-s.qty:!s?def.max:0),0);
}
export function addItem(inv,id,amount,{expand=false}={}){
  const def=ITEM[id];if(!def||!integerIn(amount,0,100000000))throw Error('Invalid item or quantity');
  if(def.tool)throw Error('Starter tools cannot be stacked');
  if(!expand&&freeCapacity(inv,id)<amount)return false;
  let left=amount;
  for(const slot of inv){if(!left)break;if(slot?.id===id){const put=Math.min(left,def.max-slot.qty);slot.qty+=put;left-=put;}}
  for(let i=0;left&&i<inv.length;i++)if(!inv[i]){const put=Math.min(left,def.max);inv[i]={id,qty:put};left-=put;}
  while(left&&expand&&inv.length<MAX_SLOTS){const put=Math.min(left,def.max);inv.push({id,qty:put});left-=put;}
  if(left)throw Error('Inventory is full; no items added');
  return true;
}
export function payCosts(inv,costs){
  for(const [id,quantity] of Object.entries(costs))if(!ITEM[id]||!integerIn(quantity,0,100000)||count(inv,id)<quantity)return false;
  for(const [id,quantity] of Object.entries(costs)){
    let left=quantity;
    for(let i=inv.length-1;i>=0&&left;i--){const s=inv[i];if(s?.id!==id)continue;const used=Math.min(left,s.qty);s.qty-=used;left-=used;if(!s.qty)inv[i]=null;}
  }
  return true;
}
function validateWorldFields(s){
  if(!s||typeof s!=='object'||Array.isArray(s)||!numberIn(s.px,-46,46)||!numberIn(s.pz,-46,46))throw Error('Backup has invalid player coordinates.');
  if(!s.resources||typeof s.resources!=='object'||Array.isArray(s.resources))throw Error('Backup is missing its resource states.');
  const resourceStates={};
  for(const [id,hits] of Object.entries(s.resources)){
    if(!/^(?:t(?:[0-9]|[12][0-9]|3[0-3])|r(?:[0-9]|1[0-9]|2[0-6]))$/.test(id))throw Error('Backup contains an unknown resource ID.');
    if(!integerIn(hits,0,id.startsWith('t')?3:2))throw Error('Backup contains an invalid resource state.');
    resourceStates[id]=hits;
  }
  if(!Array.isArray(s.builds)||s.builds.length>250)throw Error('Backup contains invalid buildings.');
  const builds=s.builds.map(b=>{
    if(!b||!['cabin','floor','wall'].includes(b.type)||!numberIn(b.x,-46,46)||!numberIn(b.z,-46,46)||!numberIn(b.rot,-1000,1000))throw Error('Backup contains a damaged building.');
    return {type:b.type,x:b.x,z:b.z,rot:b.rot};
  });
  return {px:s.px,pz:s.pz,resources:resourceStates,builds};
}
export function normalizeSave(input){
  const s=input?.format===BACKUP_FORMAT?input.save:input;
  if(!s||![1,2].includes(s.version))throw Error('Not a supported Wilderness v0.2 / v0.3 save.');
  const fields=validateWorldFields(s);
  let inventory, equipped='axe';
  if(s.version===1){
    if(!integerIn(s.wood,0,1000000)||!integerIn(s.stone,0,1000000))throw Error('Legacy save contains invalid materials.');
    inventory=startingInventory();addItem(inventory,'wood',s.wood,{expand:true});addItem(inventory,'stone',s.stone,{expand:true});
  }else{
    if(!Array.isArray(s.inventory)||s.inventory.length<1||s.inventory.length>MAX_SLOTS)throw Error('Invalid backpack slots.');
    inventory=s.inventory.map(slot=>{
      if(slot===null)return null;
      if(!slot||typeof slot!=='object'||!OWN(ITEM,slot.id)||!integerIn(slot.qty,1,ITEM[slot.id].max))throw Error('Invalid backpack item.');
      return {id:slot.id,qty:slot.qty};
    });
    if(count(inventory,'axe')!==1||count(inventory,'pickaxe')!==1)throw Error('Starting tools are missing or duplicated.');
    equipped=['axe','pickaxe'].includes(s.equipped)?s.equipped:'axe';
    while(inventory.length<MIN_SLOTS)inventory.push(null);
  }
  return {version:2,inventory,equipped,...fields};
}
export function makeSave({inventory,equipped,px,pz,resources,builds}){
  return normalizeSave({version:2,inventory,equipped,px,pz,resources,builds});
}
export function exportWrapper(save){
  return {format:BACKUP_FORMAT,game:'Wilderness',exportedAt:new Date().toISOString(),save:makeSave(save)};
}
