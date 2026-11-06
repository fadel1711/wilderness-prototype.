// Wilderness v0.7 — pure crafting, storage and atomic cross-inventory transactions.
// No DOM, engine or network dependencies.
import {ITEM,count,addItem,payCosts} from './save-system.js';
export const RECIPES=Object.freeze({
  workbench:Object.freeze([
    {id:'stone_axe',label:'Stone axe',icon:'🪓',needs:{wood:3,stone:4},output:{stone_axe:1},info:'Faster tree chopping'},
    {id:'iron_pickaxe',label:'Iron pickaxe',icon:'⛏️',needs:{wood:3,iron_bar:2},output:{iron_pickaxe:1},info:'Faster rock mining'},
    {id:'sword',label:'Iron sword',icon:'⚔️',needs:{wood:2,iron_bar:3},output:{sword:1},info:'Used for v0.7 melee combat'},
    {id:'shield',label:'Wooden shield',icon:'🛡️',needs:{wood:5,stone:2},output:{shield:1},info:'Used for v0.7 melee combat'},
    {id:'torch',label:'Explorer torch',icon:'🔥',needs:{wood:2,charcoal:1},output:{torch:1},info:'Reusable handheld torch. Refuel with charcoal to light your way'},
    {id:'bow',label:'Hunting bow',icon:'🏹',needs:{wood:6,stone:1},output:{bow:1},info:'For the future combat update'}
  ]),
  furnace:Object.freeze([
    {id:'charcoal',label:'Charcoal ×2',icon:'🔥',needs:{wood:4},output:{charcoal:2},info:'Fuel for smelting'},
    {id:'iron_bar',label:'Iron ingot',icon:'🔩',needs:{iron_ore:2,charcoal:1},output:{iron_bar:1},info:'Used to craft stronger equipment'},
    {id:'stew',label:'Vegetable stew',icon:'🍲',needs:{carrot:1,potato:1,wheat:1},output:{stew:1},info:'A relaxed meal that supports recovery'}
  ])
});
export const cloneSlots=slots=>slots.map(x=>x?{...x}:null);
export const freshChest=()=>Array(16).fill(null);
export function totalAvailable(bag,chests,id){return count(bag,id)+chests.reduce((n,c)=>n+count(c.slots,id),0);}
// Return a staged update, or null. Never alter the live containers on failure.
export function spendFromContainers(bag,chests,cost){
  const b=cloneSlots(bag),c=chests.map(x=>({id:x.id,slots:cloneSlots(x.slots)}));
  for(const [id,amount] of Object.entries(cost)){
    if(!ITEM[id]||!Number.isSafeInteger(amount)||amount<0||totalAvailable(b,c,id)<amount)return null;
  }
  for(const [id,amount] of Object.entries(cost)){
    let remaining=amount;
    const fromBag=Math.min(remaining,count(b,id));
    if(fromBag){if(!payCosts(b,{[id]:fromBag}))return null;remaining-=fromBag;}
    for(const box of c){if(!remaining)break;
      const take=Math.min(remaining,count(box.slots,id));
      if(take){if(!payCosts(box.slots,{[id]:take}))return null;remaining-=take;}
    }
    if(remaining)return null;
  }
  return {bag:b,chests:c};
}
export function craftItem(bag,chests,recipe){
  if(!recipe||typeof recipe.id!=='string'||!recipe.needs||!recipe.output)return null;
  // Equipment cannot be stacked beyond its max=1 and cannot be duplicated in bag.
  for(const [id,qty] of Object.entries(recipe.output))if(ITEM[id]?.tool&&count(bag,id))return null;
  const staged=spendFromContainers(bag,chests,recipe.needs);if(!staged)return null;
  try{for(const [id,qty] of Object.entries(recipe.output)){
    if(!addItem(staged.bag,id,qty,{expand:true,allowTool:!!ITEM[id]?.tool}))return null;
  }}catch(e){return null;}
  return staged;
}
export function transferStack(from,to,index){
  if(!Number.isSafeInteger(index)||index<0||index>=from.length)return null;
  const s=from[index];if(!s||ITEM[s.id]?.tool)return null; // starter/equippable tools stay in backpack
  const a=cloneSlots(from),b=cloneSlots(to);
  if(!addItem(b,s.id,s.qty))return null;
  a[index]=null;
  return {from:a,to:b};
}
