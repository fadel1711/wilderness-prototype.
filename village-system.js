// Wilderness v0.23 — compact, deterministic living settlement.
// Village graphics / NPC routines are regenerated from the existing game clock.
// No personal information, network activity, new save fields or random resources.
export const VILLAGE={id:'amberfall',name:'Amberfall Village',x:-112,z:113,icon:'🏘️',range:14,info:'A small inhabited woodland settlement. Six residents work by day and return home at night.'};
export const VILLAGE_RADIUS=23;
const homes=[
  {x:-14,z:-10,roof:'#695347'},{x:-5,z:-14,roof:'#735b48'},
  {x:6,z:-14,roof:'#675443'},{x:15,z:-10,roof:'#79614b'},
  {x:-15,z:11,roof:'#73554a'},{x:-5,z:15,roof:'#67564a'},
  {x:7,z:15,roof:'#7d624b'},{x:16,z:10,roof:'#675245'}
];
export const VILLAGE_HOMES=Object.freeze(homes.map((h,i)=>Object.freeze({...h,id:'house'+i})));
export const VILLAGERS=Object.freeze([
  {id:'eda',name:'Eda',job:'Farmer',home:0,work:{x:-16,z:2},color:'#687d55',dialog:'The fields need tending every morning.'},
  {id:'osric',name:'Osric',job:'Woodcutter',home:1,work:{x:-19,z:-1},color:'#806047',dialog:'A sturdy axe is worth its weight in timber.'},
  {id:'nela',name:'Nela',job:'Baker',home:2,work:{x:5,z:-2},color:'#987a5c',dialog:'A hot meal after an expedition makes everything better.'},
  {id:'bryn',name:'Bryn',job:'Village Guard',home:3,work:{x:17,z:0},color:'#586a70',dialog:'The village is peaceful, but the woods are unpredictable.'},
  {id:'toma',name:'Toma',job:'Gardener',home:4,work:{x:-10,z:2},color:'#6b8170',dialog:'Plants grow better with water, patience, and sunlight.'},
  {id:'mara',name:'Mara',job:'Resident',home:7,work:{x:11,z:3},color:'#8c6571',dialog:'Welcome to Amberfall. You can rest here before heading east.'}
]);
export const villageDistance=(x,z)=>Math.hypot(x-VILLAGE.x,z-VILLAGE.z);
// Keep geometric footprints separate from purely visual props and editable world saves.
export function villageHouseAt(x,z,padding=.28,disabled=null){
  const dx=x-VILLAGE.x,dz=z-VILLAGE.z;
  for(const h of VILLAGE_HOMES){if(disabled?.has(h.id))continue;
    const xx=dx-h.x,zz=dz-h.z;
    if(Math.abs(xx)<2.75+padding&&Math.abs(zz)<2.55+padding)return true;
  }
  return false;
}
const lerp=(a,b,t)=>a+(b-a)*Math.max(0,Math.min(1,t));
function travel(a,b,t){return {x:lerp(a.x,b.x,t),z:lerp(a.z,b.z,t)};}
// Schedules derive solely from the existing day/night clock; no NPC save data.
export function villagerSchedule(def,elapsed){
  const hour=((elapsed%720+720)%720)/30;
  const home=VILLAGE_HOMES[def.home],work=def.work;
  const bed={x:home.x+(home.x<0?2.0:-2.0),z:home.z+(home.z<0?3.1:-3.1)};
  const plaza={x:(def.home%3-1)*2,z:0};
  if(hour<6.5||hour>=21)return {...bed,active:false,walking:false,place:'home'};
  if(hour<7.8)return {...travel(bed,plaza,(hour-6.5)/1.3),active:true,walking:true,place:'walk'};
  if(hour<8.5)return {...travel(plaza,work,(hour-7.8)/.7),active:true,walking:true,place:'walk'};
  if(hour<12.0)return {...work,active:true,walking:false,place:'work'};
  if(hour<12.8)return {...travel(work,plaza,(hour-12)/.8),active:true,walking:true,place:'walk'};
  if(hour<14.0)return {...plaza,active:true,walking:false,place:'square'};
  if(hour<14.8)return {...travel(plaza,work,(hour-14)/.8),active:true,walking:true,place:'walk'};
  if(hour<18.0)return {...work,active:true,walking:false,place:'work'};
  if(hour<19.7)return {...travel(work,plaza,(hour-18)/1.7),active:true,walking:true,place:'walk'};
  if(hour<20.1)return {...plaza,active:true,walking:false,place:'square'};
  return {...travel(plaza,bed,(hour-20.1)/.9),active:true,walking:true,place:'walk'};
}
export function nearbyVillager(position,elapsed,range=2.7){
  if(villageDistance(position.x,position.z)>VILLAGE_RADIUS+3)return null;
  let best=null,d=range;
  for(const person of VILLAGERS){const p=villagerSchedule(person,elapsed);if(!p.active)continue;
    const dist=Math.hypot(VILLAGE.x+p.x-position.x,VILLAGE.z+p.z-position.z);
    if(dist<d){best={...person,...p,distance:dist};d=dist;}
  }
  return best;
}
export function createLivingVillage(THREE,scene){
  const root=new THREE.Group();root.position.set(VILLAGE.x,0,VILLAGE.z);scene.add(root);
  const matte=(color)=>new THREE.MeshStandardMaterial({color,roughness:1});
  const materials={wood:matte('#94775b'),timber:matte('#6b5140'),stone:matte('#9b9b8a'),
    path:matte('#928671'),roof:matte('#72594b'),grass:matte('#65805d'),leaf:matte('#678d62'),
    skin:matte('#d5b08b'),hair:matte('#47392e'),fire:new THREE.MeshBasicMaterial({color:'#ecb266'})};
  const cube=(group,w,h,d,x,y,z,material)=>{
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);group.add(m);return m;
  };
  const disc=(x,z,r,material)=>{
    const m=new THREE.Mesh(new THREE.CircleGeometry(r,20),material);m.rotation.x=-Math.PI/2;m.position.set(x,-.065,z);root.add(m);return m;
  };
  // Packed-earth roads and plaza; the surrounding world is not flattened or regenerated.
  cube(root,41,.05,2.65,0,-.045,0,materials.path);
  cube(root,2.2,.05,37,0,-.047,0,materials.path);
  disc(0,0,5.5,materials.path);
  const existingBlocked=new Set();
  const houseMeshes=new Map();
  for(const house of VILLAGE_HOMES){
    const g=new THREE.Group();g.position.set(house.x,0,house.z);root.add(g);houseMeshes.set(house.id,g);
    const hmat=matte(house.roof);
    cube(g,5.0,2.35,4.5,0,1.2,0,materials.wood);
    cube(g,5.34,.21,4.72,0,2.38,0,materials.timber);
    const roofL=cube(g,3.15,.32,5.1,-1.25,3.12,0,hmat);roofL.rotation.z=.64;
    const roofR=cube(g,3.15,.32,5.1,1.25,3.12,0,hmat);roofR.rotation.z=-.64;
    cube(g,.95,1.58,.07,0,.81,2.31,materials.timber);
    for(const dx of [-1.35,1.35]){
      cube(g,.57,.59,.075,dx,1.51,2.30,materials.stone);
      cube(g,.065,.67,.12,dx,1.51,2.37,materials.timber);
    }
    for(const dx of [-2.38,2.38]){
      cube(g,.21,2.65,.23,dx,1.32,2.2,materials.timber);
      cube(g,.21,2.65,.23,dx,1.32,-2.2,materials.timber);
    }
    cube(g,5.35,.18,.30,0,.53,-2.17,materials.stone);
    // One shared mesh per chimney; animated smoke is lightweight and optional.
    cube(g,.55,1.12,.60,1.50,3.57,-1.0,materials.stone);
  }
  // Village square, small fenced vegetable garden, stable well and unlit campfire ring.
  const well=new THREE.Group();root.add(well);well.position.set(2.9,0,4.2);
  const ring=new THREE.Mesh(new THREE.CylinderGeometry(.84,.95,.76,10),materials.stone);ring.position.y=.38;well.add(ring);
  const water=new THREE.Mesh(new THREE.CircleGeometry(.71,12),matte('#72a9aa'));water.rotation.x=-Math.PI/2;water.position.y=.79;well.add(water);
  for(const dx of [-.67,.67])cube(well,.13,2.15,.13,dx,1.56,0,materials.timber);
  const canopy=cube(well,2,.20,1.6,0,2.63,0,materials.roof);canopy.rotation.z=.04;
  for(const x of [-17.5,-14.8,-12.1])for(const z of [4.7,6.8]){
    const crop=new THREE.Mesh(new THREE.ConeGeometry(.24,.68,6),materials.leaf);crop.position.set(x,.33,z);root.add(crop);
  }
  const lamps=[];
  for(const x of [-18,0,18]){
    cube(root,.17,2.85,.18,x,1.43,-2.5,materials.timber);
    const globe=new THREE.Mesh(new THREE.OctahedronGeometry(.25),materials.fire);globe.position.set(x,2.77,-2.5);root.add(globe);
    lamps.push(globe);
  }
  const fireLight=new THREE.PointLight('#ffc681',0,12,2);fireLight.position.set(0,2,0);root.add(fireLight);
  for(let i=0;i<9;i++){
    const angle=i*Math.PI*2/9;
    const stone=new THREE.Mesh(new THREE.DodecahedronGeometry(.29,0),materials.stone);stone.position.set(Math.cos(angle)*.82,.13,Math.sin(angle)*.82);root.add(stone);
  }
  const flames=[];
  for(let i=0;i<3;i++){
    const flame=new THREE.Mesh(new THREE.ConeGeometry(.22,.66,5),materials.fire);flame.position.set((i-1)*.23,.40,(i%2)*.16);root.add(flame);flames.push(flame);
  }
  const actors=[];
  for(const def of VILLAGERS){
    const group=new THREE.Group();root.add(group);
    const body=new THREE.Mesh(new THREE.CylinderGeometry(.25,.31,.89,7),matte(def.color));body.position.y=1.18;group.add(body);
    const head=new THREE.Mesh(new THREE.SphereGeometry(.225,8,6),materials.skin);head.position.y=1.86;group.add(head);
    const hair=new THREE.Mesh(new THREE.SphereGeometry(.23,8,6,0,Math.PI*2,0,Math.PI*.48),materials.hair);hair.position.y=1.97;group.add(hair);
    const arms=[],legs=[];
    for(const side of [-1,1]){
      const arm=new THREE.Mesh(new THREE.CylinderGeometry(.08,.095,.68,6),matte(def.color));arm.position.set(side*.34,1.18,0);group.add(arm);arms.push(arm);
      const leg=new THREE.Mesh(new THREE.CylinderGeometry(.105,.13,.70,6),materials.timber);leg.position.set(side*.15,.41,0);group.add(leg);legs.push(leg);
    }
    actors.push({def,group,arms,legs});
  }
  function protectExistingBuilds(builds){
    existingBlocked.clear();
    for(const h of VILLAGE_HOMES){
      if(builds.some(b=>Math.hypot(b.x-(VILLAGE.x+h.x),b.z-(VILLAGE.z+h.z))<4.9))existingBlocked.add(h.id);
    }
    for(const h of VILLAGE_HOMES)houseMeshes.get(h.id).visible=!existingBlocked.has(h.id);
  }
  function update(elapsed,px,pz,low=false){
    const hour=((elapsed%720+720)%720)/30;
    const night=hour>=19||hour<6;
    const near=Math.hypot(px-VILLAGE.x,pz-VILLAGE.z)<76;
    root.visible=near;
    if(!near)return;
    for(const a of actors){
      const dest=villagerSchedule(a.def,elapsed);
      a.group.visible=dest.active;
      if(!dest.active)continue;
      a.group.position.set(dest.x,0,dest.z);
      const sway=dest.walking&&!low?Math.sin(elapsed*7+a.def.home)*.14:0;
      a.arms[0].rotation.x=sway;a.arms[1].rotation.x=-sway;
      a.legs[0].rotation.x=-sway*.8;a.legs[1].rotation.x=sway*.8;
      if(dest.walking){const ahead=villagerSchedule(a.def,elapsed+.2);const dx=ahead.x-dest.x,dz=ahead.z-dest.z;if(Math.hypot(dx,dz)>.001)a.group.rotation.y=Math.atan2(dx,dz);}
    }
    fireLight.intensity=night&&near&&!low?.9:0;
    for(const l of lamps)l.material=materials.fire;
    flames.forEach((f,i)=>{f.scale.y=night?(.8+.12*Math.sin(elapsed*10+i)):0.55;});
  }
  return {root,update,protectExistingBuilds,blockedHomes:existingBlocked,houseCount:VILLAGE_HOMES.length,villagerCount:VILLAGERS.length};
}
