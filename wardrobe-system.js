// Wilderness v0.19 — constrained, cosmetic-only survivor wardrobe.
// Pure module: no DOM, WebGL or network. The appearance is saved with the world.
export const OUTFITS=Object.freeze({
  ranger:    {label:'Woodland Ranger',coat:'#657b65',shadow:'#344b3c',hood:'#405c48',leather:'#74563f',scarf:'#b8a27f'},
  explorer:  {label:'Mountain Explorer',coat:'#9b8772',shadow:'#64584e',hood:'#706354',leather:'#694b38',scarf:'#9eb8b5'},
  autumn:    {label:'Autumn Traveler',coat:'#ae7047',shadow:'#70432f',hood:'#81533a',leather:'#614938',scarf:'#e0bb76'},
  scout:     {label:'Night Scout',coat:'#445761',shadow:'#263942',hood:'#314651',leather:'#45413c',scarf:'#87939a'},
  wanderer:  {label:'Coastal Wanderer',coat:'#6f9398',shadow:'#456975',hood:'#426777',leather:'#75513d',scarf:'#e8ded1'}
});
export const PANTS=Object.freeze({
  earth:{label:'Earth brown',color:'#64584a'},slate:{label:'Slate grey',color:'#59636a'},
  moss:{label:'Moss green',color:'#475f4b'},sand:{label:'Sand tan',color:'#a39476'}
});
export const BOOTS=Object.freeze({
  leather:{label:'Dark leather',color:'#40372e'},umber:{label:'Warm brown',color:'#79523a'},
  charcoal:{label:'Charcoal',color:'#353c40'}
});
export const HAIR=Object.freeze({
  dark:{label:'Dark brown',color:'#3e372f'},chestnut:{label:'Chestnut',color:'#79543b'},
  black:{label:'Black',color:'#272b2c'},ash:{label:'Ash blonde',color:'#b3a17f'}
});
export const DEFAULT_WARDROBE=Object.freeze({outfit:'ranger',pants:'earth',boots:'leather',hair:'dark',hood:false,scarf:false});
const isObject=o=>o&&typeof o==='object'&&!Array.isArray(o);
export function normalizeWardrobe(value){
  if(value==null)return {...DEFAULT_WARDROBE};
  if(!isObject(value))throw Error('Invalid wardrobe save.');
  const keys=Object.keys(value);
  if(keys.length>6||keys.some(k=>!Object.hasOwn(DEFAULT_WARDROBE,k)))throw Error('Unknown wardrobe settings.');
  const s={...DEFAULT_WARDROBE,...value};
  if(!Object.hasOwn(OUTFITS,s.outfit)||!Object.hasOwn(PANTS,s.pants)||
     !Object.hasOwn(BOOTS,s.boots)||!Object.hasOwn(HAIR,s.hair)||
     typeof s.hood!=='boolean'||typeof s.scarf!=='boolean')throw Error('Invalid wardrobe choice.');
  return s;
}
export function changeWardrobe(value,field,selection){
  const s=normalizeWardrobe(value);
  if(!Object.hasOwn(s,field))throw Error('Unknown wardrobe field.');
  return normalizeWardrobe({...s,[field]:selection});
}
export function wardrobeColors(value){
  const s=normalizeWardrobe(value),o=OUTFITS[s.outfit];
  return {coat:o.coat,shadow:o.shadow,hood:o.hood,leather:o.leather,scarf:o.scarf,
    pants:PANTS[s.pants].color,boots:BOOTS[s.boots].color,hair:HAIR[s.hair].color};
}
