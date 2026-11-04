// Wilderness v0.22: deterministic outer wilderness, independent of the historical
// resource generators. Existing t0..t73/r0..r50 IDs and locations never move.
export const WORLD_RADIUS=172; // twice v0.21's 86-metre half-width on X and Z
export const OLD_WORLD_RADIUS=86;
export const OUTER_ZONES=Object.freeze([
  {id:'westwood',name:'Westwood Thicket',x:-132,z:27,icon:'🌲',range:9,info:'Ancient pines and rocky glades west of the original forest.'},
  {id:'northreach',name:'Northreach Pines',x:-40,z:-134,icon:'🌲',range:10,info:'Tall evergreen woodland north of the old homestead map.'},
  {id:'sunstone',name:'Sunstone Flats',x:127,z:119,icon:'⛰️',range:10,info:'Open grassy highlands and stony clearings.'},
  {id:'willowmere',name:'Willowmere Fields',x:16,z:141,icon:'🌾',range:10,info:'A wide southern meadow with rich resources.'},
]);
const seedRandom=seed=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
export function outerResourcePlan(){
  const rand=seedRandom(2220442),items=[];
  const specs=[[-128,24],[-40,-129],[119,117],[18,134],[-122,-124],[132,-110]];
  function good(x,z){
    if(Math.abs(x)>=WORLD_RADIUS-7||Math.abs(z)>=WORLD_RADIUS-7)return false;
    if(Math.max(Math.abs(x),Math.abs(z))<OLD_WORLD_RADIUS+7)return false;
    if(Math.abs(x)<14&&Math.abs(z)<14)return false;
    if(OUTER_ZONES.some(p=>Math.hypot(x-p.x,z-p.z)<7))return false;
    return !items.some(p=>Math.hypot(x-p.x,z-p.z)<3.7);
  }
  // Six separate zones avoid the empty outer corners of a simple radial ring.
  let t=0,r=0;
  for(const [cx,cz] of specs){
    for(let i=0;i<17;i++){
      let placed=false;
      for(let attempt=0;attempt<30&&!placed;attempt++){
        const x=Math.round((cx+(rand()-.5)*75)*10)/10,z=Math.round((cz+(rand()-.5)*75)*10)/10;
        if(!good(x,z))continue;
        items.push({id:'et'+t++,type:'tree',x,z,scale:.71+rand()*.43});placed=true;
      }
    }
    for(let i=0;i<9;i++){
      let placed=false;
      for(let attempt=0;attempt<30&&!placed;attempt++){
        const x=Math.round((cx+(rand()-.5)*74)*10)/10,z=Math.round((cz+(rand()-.5)*74)*10)/10;
        if(!good(x,z))continue;
        items.push({id:'er'+r++,type:'rock',x,z,scale:.65+rand()*.57});placed=true;
      }
    }
  }
  return items;
}
export function expandedResourceId(id){
  const m=/^e([tr])(0|[1-9]\d{0,2})$/.exec(id);
  return !!m&&Number(m[2])<(m[1]==='t'?102:54);
}
export function isOldWorld(x,z){return Math.abs(x)<=OLD_WORLD_RADIUS&&Math.abs(z)<=OLD_WORLD_RADIUS;}
export function outerScatterPlan(count=250){
  const rand=seedRandom(220087),out=[];
  for(let i=0;out.length<count&&i<count*15;i++){
    const x=(rand()*2-1)*(WORLD_RADIUS-5),z=(rand()*2-1)*(WORLD_RADIUS-5);
    if(isOldWorld(x,z))continue;
    out.push({x,z,scale:1.1+rand()*2.8,kind:Math.floor(rand()*3),rot:rand()*Math.PI*2});
  }
  return out;
}
