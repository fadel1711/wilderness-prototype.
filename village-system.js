// Wilderness 0.23.1 — four living settlements, accessible interiors and deterministic barter/loot.
// Villager schedules, chest contents and locations are reproducible. No backend secrets.
const village=(id,name,x,z,accent,homes,people,info)=>Object.freeze({
  id,name,x,z,accent,icon:'🏘️',range:17,info,homes:Object.freeze(homes.map((p,i)=>Object.freeze({id:`${id}:house${i}`,x:p[0],z:p[1],roof:p[2]??accent,front:p[1]<0?1:-1}))),
  people:Object.freeze(people.map((p,i)=>Object.freeze({id:`${id}:${p[0]}`,name:p[1],job:p[2],home:p[3],work:{x:p[4],z:p[5]},dialog:p[6],color:p[7]||accent})))
});
export const VILLAGES=Object.freeze([
  village('amberfall','Amberfall Village',-112,113,'#735847',
    [[-14,-10],[-5,-14],[6,-14],[15,-10],[-15,11],[-5,15],[7,15],[16,10]],
    [['eda','Eda','Farmer',0,-16,2,'The fields need tending every morning.','#687d55'],['osric','Osric','Woodcutter',1,-19,-1,'Trade a little ore for a stack of timber.'],['nela','Nela','Baker',2,5,-2,'The oven is hot, and the stew is fresh.'],['bryn','Bryn','Guard',3,17,0,'Keep an eye on the woods after sunset.'],['toma','Toma','Gardener',4,-10,2,'Plant seeds and make yourself at home.'],['mara','Mara','Merchant',7,11,3,'A traveler always needs supplies.']],
    'Woodland houses, an open square and a busy market.'),
  village('stonebrook','Stonebrook Hamlet',112,110,'#777063',
    [[-14,-12],[0,-15],[14,-12],[-15,13],[0,16],[15,13]],
    [['orin','Orin','Mason',0,-16,1,'Stone from the cliffs makes strong foundations.'],['lina','Lina','Farmer',1,-7,-2,'A handful of grain can start a whole harvest.'],['tess','Tess','Merchant',2,10,-1,'Bring me stone and I can swap you useful goods.'],['garr','Garr','Guard',3,16,1,'The hamlet is safer when we watch the roads.'],['roan','Roan','Baker',4,2,3,'A bowl of stew keeps the cold away.']],
    'A stoneworkers settlement with larger homes and a market.'),
  village('briarhaven','Briarhaven',-113,-112,'#665a49',
    [[-14,-12],[0,-15],[14,-12],[-15,13],[0,16],[15,13]],
    [['iara','Iara','Gardener',0,-18,1,'These roots thrive in the damp soil.'],['fenn','Fenn','Woodcutter',1,-5,-1,'The old grove grows strong timber.'],['suri','Suri','Merchant',2,11,-2,'A good bargain beats a long expedition.'],['joss','Joss','Farmer',3,-13,3,'Take care not to trample the seedlings.'],['vale','Vale','Guard',5,17,2,'Stay close to the lanterns at night.']],
    'A secluded garden village among the southern woods.'),
  village('sunridge','Sunridge Crossing',113,-111,'#84634e',
    [[-14,-12],[0,-15],[14,-12],[-15,13],[0,16],[15,13]],
    [['pax','Pax','Merchant',0,-15,0,'Iron, wood, grain — I can find a buyer.'],['mina','Mina','Baker',1,-4,-2,'Warm food after the ridge trail?'],['evan','Evan','Mason',2,13,-2,'You can never have too much good stone.'],['rhea','Rhea','Gardener',4,1,3,'Every garden starts with a few seeds.'],['kell','Kell','Guard',5,16,1,'The hills seem quieter from our watchpost.']],
    'Hillside houses and a crossroads trading stop.')
]);
// Backward compatibility with v0.23 imports and stable historical Amberfall landmark.
export const VILLAGE=VILLAGES[0];
export const VILLAGE_RADIUS=37;
export const VILLAGE_HOMES=VILLAGE.homes;
export const VILLAGERS=VILLAGE.people;
export const HOUSE_WIDTH=7.2, HOUSE_DEPTH=6.8;
const HX=HOUSE_WIDTH/2, HZ=HOUSE_DEPTH/2, WALL=.22, DOOR_HALF=.72;
const lerp=(a,b,t)=>a+(b-a)*Math.max(0,Math.min(1,t));
const near=(x,z,p,d=VILLAGE_RADIUS)=>Math.hypot(x-p.x,z-p.z)<d;
export const villageDistance=(x,z)=>Math.min(...VILLAGES.map(v=>Math.hypot(x-v.x,z-v.z)));
export function villageAt(x,z,range=VILLAGE_RADIUS){return VILLAGES.find(v=>Math.hypot(x-v.x,z-v.z)<range)||null;}
export const VILLAGE_CHESTS=Object.freeze(VILLAGES.flatMap(v=>v.homes.filter((_,i)=>i%2===0).map(h=>Object.freeze({id:`vloot:${h.id}`,village:v.id,house:h.id,x:v.x+h.x,z:v.z+h.z}))));
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619)>>>0;return h;}
const rewards=Object.freeze([{wood:7,stone:5},{carrot:3,wheat_seed:3},{iron_ore:4,stone:3},{potato:3,water:2},{charcoal:3,wood:5},{wheat:4,carrot_seed:2},{iron_bar:1,stone:7}]);
export function villageChestRewards(id){if(!VILLAGE_CHESTS.some(c=>c.id===id))return null;return {...rewards[hash(id)%rewards.length]};}
export const VILLAGE_TRADES=Object.freeze({
 Farmer:Object.freeze([{cost:{wood:4},reward:{carrot:3},label:'Fresh carrots'},{cost:{stone:5},reward:{wheat_seed:3},label:'Grain seeds'}]),
 Gardener:Object.freeze([{cost:{wood:3},reward:{carrot_seed:3},label:'Carrot seeds'},{cost:{stone:4},reward:{potato_seed:3},label:'Potato eyes'}]),
 Woodcutter:Object.freeze([{cost:{iron_ore:2},reward:{wood:12},label:'Timber bundle'},{cost:{wheat:3},reward:{charcoal:3},label:'Charcoal'}]),
 Baker:Object.freeze([{cost:{wheat:4,carrot:1},reward:{stew:2},label:'Hearty stew'},{cost:{wood:4},reward:{potato:4},label:'Roasting potatoes'}]),
 Mason:Object.freeze([{cost:{wood:6},reward:{stone:9},label:'Cut stone'},{cost:{iron_ore:3},reward:{iron_bar:1},label:'Refined iron'}]),
 Merchant:Object.freeze([{cost:{stone:6},reward:{water:3},label:'Travel water'},{cost:{wood:14},reward:{iron_ore:1},label:'Iron prospecting bundle'},{cost:{carrot:3},reward:{wheat:5},label:'Grain bundle'}]),
 Guard:Object.freeze([{cost:{wheat:4},reward:{iron_ore:2},label:'Salvaged ore'}])
});
export const offersForVillager=(person)=>VILLAGE_TRADES[person?.job]||[];
export function villagerSchedule(def,elapsed,village=VILLAGES.find(v=>v.people.includes(def))||VILLAGE){
  const hour=((elapsed%720+720)%720)/30;
  const home=village.homes[def.home],work=def.work;
  const step={x:home.x,z:home.z+home.front*(HZ+2.4)};
  const plaza={x:(def.home%3-1)*2,z:0};
  const travel=(a,b,t)=>({x:lerp(a.x,b.x,t),z:lerp(a.z,b.z,t)});
  if(hour<6.6||hour>=20.8)return {...step,active:false,walking:false,place:'home'};
  if(hour<8)return {...travel(step,plaza,(hour-6.6)/1.4),active:true,walking:true,place:'walk'};
  if(hour<8.8)return {...travel(plaza,work,(hour-8)/.8),active:true,walking:true,place:'walk'};
  if(hour<12)return {...work,active:true,walking:false,place:'work'};
  if(hour<12.7)return {...travel(work,plaza,(hour-12)/.7),active:true,walking:true,place:'walk'};
  if(hour<14)return {...plaza,active:true,walking:false,place:'square'};
  if(hour<14.8)return {...travel(plaza,work,(hour-14)/.8),active:true,walking:true,place:'walk'};
  if(hour<18.5)return {...work,active:true,walking:false,place:'work'};
  if(hour<19.1)return {...travel(work,plaza,(hour-18.5)/.6),active:true,walking:true,place:'walk'};
  if(hour<19.8)return {...plaza,active:true,walking:false,place:'square'};
  return {...travel(plaza,step,(hour-19.8)),active:true,walking:true,place:'walk'};
}
export function nearbyVillager(position,elapsed,range=2.8){
  let best=null,d=range;
  for(const v of VILLAGES){if(!near(position.x,position.z,v,55))continue;
    for(const def of v.people){const p=villagerSchedule(def,elapsed,v);if(!p.active)continue;
      const dist=Math.hypot(v.x+p.x-position.x,v.z+p.z-position.z);
      if(dist<d){best={...def,...p,villageId:v.id,villageName:v.name,distance:dist};d=dist;}
    }
  }return best;
}
export function localHousePoint(x,z,v,h){const a=(h.front===-1)?-1:1;return {x:(x-(v.x+h.x))*a,z:(z-(v.z+h.z))*a};}
export function villageHouseAt(x,z,padding=.28,blocked=null,openedDoors=null){
  for(const v of VILLAGES){if(!near(x,z,v,46))continue;
    for(const h of v.homes){if(blocked?.has(h.id))continue;
      const p=localHousePoint(x,z,v,h);if(Math.abs(p.x)>HX+padding||Math.abs(p.z)>HZ+padding)continue;
      // Solid walls are only around the perimeter, not throughout the interiors.
      const rear=Math.abs(p.z+HZ)<WALL+padding;
      const sides=Math.abs(Math.abs(p.x)-HX)<WALL+padding;
      const front=Math.abs(p.z-HZ)<WALL+padding;
      if(rear||sides||(front&&(Math.abs(p.x)>DOOR_HALF-padding||!openedDoors?.has(h.id))))return true;
    }
  }return false;
}
export function houseContaining(x,z,blocked=null){
  for(const v of VILLAGES){if(!near(x,z,v,45))continue;
    for(const h of v.homes){if(blocked?.has(h.id))continue;const p=localHousePoint(x,z,v,h);
      if(Math.abs(p.x)<HX-.26&&Math.abs(p.z)<HZ-.26)return {village:v,house:h,local:p};
    }
  }return null;
}
export function nearestVillageDoor(position,blocked=null,range=2.4){
  let best=null,d=range;
  for(const v of VILLAGES){if(!near(position.x,position.z,v,46))continue;
    for(const h of v.homes){if(blocked?.has(h.id))continue;
      const x=v.x+h.x,z=v.z+h.z+h.front*HZ;
      const ds=Math.hypot(position.x-x,position.z-z);
      if(ds<d){best={id:h.id,village:v.id,house:h,x,z,distance:ds};d=ds;}
    }
  }return best;
}
export function nearestVillageChest(position,blocked=null,range=2.1){
  const inside=houseContaining(position.x,position.z,blocked);if(!inside)return null;
  const chest=VILLAGE_CHESTS.find(c=>c.house===inside.house.id);if(!chest)return null;
  const p=localHousePoint(position.x,position.z,inside.village,inside.house);
  const dist=Math.hypot(p.x+1.9,p.z+1.1);
  return dist<=range?{...chest,distance:dist}:null;
}
export function createLivingVillage(THREE,scene){
  const root=new THREE.Group();scene.add(root);
  const unitBox=new THREE.BoxGeometry(1,1,1),unitCone=new THREE.ConeGeometry(1,1,6);
  const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.92});
  const materials={wall:mat('#ae987b'),wood:mat('#695345'),stone:mat('#b5aba0'),path:mat('#9d907a'),leaf:mat('#6e946b'),skin:mat('#cfaa8b'),hair:mat('#594739'),water:mat('#71a6ae'),torch:new THREE.MeshBasicMaterial({color:'#ffc77c'})};
  function box(parent,w,h,d,x,y,z,m){const o=new THREE.Mesh(unitBox,m);o.scale.set(w,h,d);o.position.set(x,y,z);parent.add(o);return o;}
  const villageNodes=[],houseNodes=new Map(),actors=[];
  const blockedHomes=new Set(),openedDoors=new Set(),chestLids=new Map();
  for(const v of VILLAGES){
    const group=new THREE.Group();group.position.set(v.x,0,v.z);root.add(group);villageNodes.push({v,group});
    const roofmat=mat(v.accent);
    box(group,48,.055,3.2,0,-.048,0,materials.path);
    box(group,2.8,.055,42,0,-.05,0,materials.path);
    const plaza=new THREE.Mesh(new THREE.CircleGeometry(6.2,16),materials.path);plaza.rotation.x=-Math.PI/2;plaza.position.y=-.048;group.add(plaza);
    for(const h of v.homes){
      const houseGroup=new THREE.Group();houseGroup.position.set(h.x,0,h.z);houseGroup.rotation.y=h.front===-1?Math.PI:0;group.add(houseGroup);
      houseNodes.set(h.id,{v,h,group:houseGroup});
      const roofGroup=new THREE.Group();houseGroup.add(roofGroup);
      box(houseGroup,HOUSE_WIDTH,.14,HOUSE_DEPTH,0,-.03,0,materials.wood);
      // Four separate walls leave a proper doorway, rather than a solid block interior.
      box(houseGroup,HOUSE_WIDTH,2.9,.24,0,1.55,-HZ,materials.wall);
      for(const side of [-1,1])box(houseGroup,.24,2.9,HOUSE_DEPTH,side*HX,1.55,0,materials.wall);
      const wing=(HOUSE_WIDTH-2*DOOR_HALF)/2;
      for(const side of [-1,1])box(houseGroup,wing,2.9,.25,side*(DOOR_HALF+wing/2),1.55,HZ,materials.wall);
      box(houseGroup,2*DOOR_HALF,.70,.26,0,2.63,HZ,materials.wood);
      for(const side of [-1,1]){
        box(houseGroup,.64,.64,.08,side*1.98,1.8,HZ+.16,materials.stone);
        box(houseGroup,.08,.70,.12,side*1.98,1.8,HZ+.22,materials.wood);
      }
      // Openable hinged door: 3D swing updates with the collision state.
      const pivot=new THREE.Group();pivot.position.set(-DOOR_HALF,.1,HZ);houseGroup.add(pivot);
      box(pivot,DOOR_HALF*2,2.35,.14,DOOR_HALF,1.15,0,materials.wood);
      box(pivot,.12,.12,.17,DOOR_HALF*1.85,1.20,.16,materials.stone);
      const roofA=box(roofGroup,4.3,.3,HOUSE_DEPTH+.64,-1.68,3.7,0,roofmat);roofA.rotation.z=.48;
      const roofB=box(roofGroup,4.3,.3,HOUSE_DEPTH+.64,1.68,3.7,0,roofmat);roofB.rotation.z=-.48;
      box(roofGroup,.65,.9,.7,2.0,4.15,-1.1,materials.stone);
      // Visible interiors: bed, rug, table, and a few houses contain a loot chest.
      box(houseGroup,1.65,.24,2.35,1.72,.30,-1.65,materials.wood);
      box(houseGroup,1.55,.14,.73,1.72,.50,-2.40,mat('#89947e'));
      box(houseGroup,1.45,.15,1.15,-.28,.61,-1.20,materials.wood);
      box(houseGroup,.15,.60,.15,-.83,.31,-1.60,materials.wood);
      const chest=VILLAGE_CHESTS.find(c=>c.house===h.id);
      if(chest){
        box(houseGroup,.94,.52,.65,-1.9,.34,-1.1,materials.wood);
        const lid=new THREE.Group();lid.position.set(-1.9,.59,-1.43);houseGroup.add(lid);
        box(lid,.99,.16,.72,0,0,.33,materials.stone);chestLids.set(chest.id,lid);
      }
      houseNodes.get(h.id).roof=roofGroup;
      houseNodes.get(h.id).pivot=pivot;
    }
    // Well, garden beds and small lanterns use pooled geometry/materials.
    const well=new THREE.Mesh(new THREE.CylinderGeometry(.82,.95,.68,8),materials.stone);well.position.set(3.6,.37,3.8);group.add(well);
    const water=new THREE.Mesh(new THREE.CircleGeometry(.65,12),materials.water);water.rotation.x=-Math.PI/2;water.position.set(3.6,.75,3.8);group.add(water);
    for(const x of [-19,-16.5,-14])for(const z of [5,7.2]){
      const plant=new THREE.Mesh(unitCone,materials.leaf);plant.scale.set(.22,.66,.22);plant.position.set(x,.38,z);group.add(plant);
    }
    for(const x of [-19,19]){
      box(group,.17,2.7,.17,x,1.35,-3.2,materials.wood);
      box(group,.38,.44,.36,x,2.58,-3.2,materials.torch);
    }
    const fire=new THREE.PointLight('#ffba73',0,10,2);fire.position.set(0,1.5,0);group.add(fire);villageNodes[villageNodes.length-1].light=fire;
    for(const def of v.people){
      const model=new THREE.Group();group.add(model);
      const coat=mat(def.color);
      const body=new THREE.Mesh(new THREE.CylinderGeometry(.25,.30,.93,7),coat);body.position.y=1.08;model.add(body);
      const head=new THREE.Mesh(new THREE.SphereGeometry(.24,8,6),materials.skin);head.position.y=1.77;model.add(head);
      const hair=new THREE.Mesh(new THREE.SphereGeometry(.245,8,6,0,2*Math.PI,0,Math.PI*.48),materials.hair);hair.position.y=1.87;model.add(hair);
      const arms=[],legs=[];
      for(const side of [-1,1]){
        const arm=new THREE.Mesh(new THREE.CylinderGeometry(.08,.09,.66,6),coat);arm.position.set(side*.34,1.10,0);model.add(arm);arms.push(arm);
        const leg=new THREE.Mesh(new THREE.CylinderGeometry(.10,.12,.70,6),materials.wood);leg.position.set(side*.16,.35,0);model.add(leg);legs.push(leg);
      }
      actors.push({def,v,model,arms,legs});
    }
  }
  const protectExistingBuilds=(builds)=>{
    blockedHomes.clear();for(const [id,o] of houseNodes){
      if(builds.some(b=>Math.hypot(b.x-(o.v.x+o.h.x),b.z-(o.v.z+o.h.z))<5.7))blockedHomes.add(id);
      o.group.visible=!blockedHomes.has(id);
    }
  };
  const update=(elapsed,px,pz,low=false,claims=[])=>{
    const hour=((elapsed%720+720)%720)/30,night=hour<6.5||hour>=19;
    for(const node of villageNodes){
      const visible=Math.hypot(px-node.v.x,pz-node.v.z)<83;node.group.visible=visible;
      node.light.intensity=visible&&night&&!low?.63:0;
    }
    const inside=houseContaining(px,pz,blockedHomes);
    for(const [id,n] of houseNodes){
      if(!n.group.parent.visible)continue;
      n.roof.visible=!(inside?.house.id===id);
      n.pivot.rotation.y=openedDoors.has(id)?-1.5:0;
    }
    for(const [id,lid] of chestLids){lid.rotation.x=claims.includes(id)?-.8:0;}
    for(const a of actors){
      if(!a.model.parent.visible){a.model.visible=false;continue;}
      const state=villagerSchedule(a.def,elapsed,a.v);
      a.model.visible=state.active;
      if(!state.active)continue;
      a.model.position.set(state.x,0,state.z);
      const wave=state.walking&&!low?Math.sin(elapsed*8+a.def.home)*.17:0;
      a.arms[0].rotation.x=wave;a.arms[1].rotation.x=-wave;
      a.legs[0].rotation.x=-wave*.8;a.legs[1].rotation.x=wave*.8;
      if(state.walking){const next=villagerSchedule(a.def,elapsed+.16,a.v);const dx=next.x-state.x,dz=next.z-state.z;if(Math.hypot(dx,dz)>.01)a.model.rotation.y=Math.atan2(dx,dz);}
    }
  };
  return {root,update,protectExistingBuilds,blockedHomes,openedDoors,houseCount:houseNodes.size,villagerCount:actors.length,openDoor:id=>openedDoors.add(id),toggleDoor:id=>openedDoors.has(id)?openedDoors.delete(id):openedDoors.add(id)};
}
