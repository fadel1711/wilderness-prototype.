// Wilderness v0.23.5 — portable and placeable torches. No offline fuel use.
// Serializable state is bounded, validated and purely deterministic.
export const TORCH_SECONDS_PER_CHARCOAL=240;
export const TORCH_MAX_SECONDS=960;
export const TORCH_BUILD_TYPE='torch_stand';
export function normalizeTorches(value,builds=[]){
  if(value==null)value={};
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Invalid torch data');
  const allowed=new Set(builds.filter(x=>x.type===TORCH_BUILD_TYPE).map(x=>x.id));
  const raw=value.stands??{},hand=value.hand??{fuel:0,lit:false};
  if(!raw||typeof raw!=='object'||Array.isArray(raw)||Object.keys(raw).length>120)throw Error('Invalid torch stands');
  const read=x=>{
    if(!x||typeof x!=='object'||Array.isArray(x)||!Number.isFinite(x.fuel)||x.fuel<0||x.fuel>TORCH_MAX_SECONDS||typeof x.lit!=='boolean')throw Error('Invalid torch fuel');
    return {fuel:x.fuel,lit:x.lit&&x.fuel>0};
  };
  const stands={};
  for(const [id,rec] of Object.entries(raw)){
    if(!/^b[1-9]\d{0,5}$/.test(id)||!allowed.has(id))throw Error('Unknown torch stand');
    stands[id]=read(rec);
  }
  for(const id of allowed)if(!stands[id])stands[id]={fuel:0,lit:false};
  return {hand:read(hand),stands};
}
export function fuelTorch(record){
  if(!record||!Number.isFinite(record.fuel)||record.fuel<0||record.fuel>TORCH_MAX_SECONDS||record.fuel>TORCH_MAX_SECONDS-TORCH_SECONDS_PER_CHARCOAL)return null;
  return {fuel:record.fuel+TORCH_SECONDS_PER_CHARCOAL,lit:true};
}
export function toggleTorch(record){
  if(!record||record.fuel<=0)return null;
  return {fuel:record.fuel,lit:!record.lit};
}
export function advanceTorches(state,dt,handEquipped=false){
  if(!Number.isFinite(dt)||dt<0||dt>1)throw Error('Invalid torch timestep');
  let expired=false;
  const apply=x=>{if(!x.lit)return;x.fuel=Math.max(0,x.fuel-dt);if(x.fuel===0){x.lit=false;expired=true;}};
  if(handEquipped)apply(state.hand);
  Object.values(state.stands).forEach(apply);
  return expired;
}
export function createTorchEffects(THREE,scene){
  // Maximum three non-shadow point lights + 24 smoke quads, independent of placement count.
  const lights=Array.from({length:3},()=>{const l=new THREE.PointLight('#ffbc6b',0,6,2);l.castShadow=false;scene.add(l);return l;});
  const geometry=new THREE.PlaneGeometry(1,1);
  const material=new THREE.MeshBasicMaterial({color:0xc5c5b7,transparent:true,opacity:.115,depthWrite:false,side:THREE.DoubleSide});
  const smoke=new THREE.InstancedMesh(geometry,material,24);scene.add(smoke);smoke.count=0;smoke.frustumCulled=false;
  const pos=new THREE.Vector3(),scale=new THREE.Vector3(),matrix=new THREE.Matrix4();
  let elapsed=0;
  function update(dt,player,hand,stands,records,camera,low=false,daylight=0){
    elapsed+=Math.max(0,Math.min(dt,.1));
    const x=player.position?.x??player.x,z=player.position?.z??player.z;
    const targets=[];
    if(hand.lit&&hand.fuel>0)targets.push({x:x+Math.sin(player.rotation?.y??0)*.4,y:(player.position?.y??0)+1.42,z:z+Math.cos(player.rotation?.y??0)*.4});
    for(const b of stands){const rec=records[b.id];if(rec?.lit&&rec.fuel>0&&Math.hypot(x-b.x,z-b.z)<(low?15:26))targets.push({x:b.x,y:(b.group?.position.y??0)+1.85,z:b.z});}
    targets.sort((a,b)=>Math.hypot(x-a.x,z-a.z)-Math.hypot(x-b.x,z-b.z));
    for(let i=0;i<lights.length;i++){const t=targets[i],l=lights[i];l.intensity=t?(low?.42:1.2)*(1-.25*daylight)*(0.88+0.12*Math.sin(elapsed*13+i*2.1)):0;if(t)l.position.set(t.x,t.y,t.z);}
    let n=0;const max=low?1:4;
    for(const t of targets.slice(0,low?2:6)){for(let i=0;i<max&&n<24;i++){
      const age=(elapsed*.33+i/max+t.x*.019+t.z*.021)%1;
      const drift=Math.sin(elapsed*.17+t.z*.05)*age*.32;
      pos.set(t.x+drift,t.y+.18+age*1.5,t.z+age*.2);
      const r=.10+.26*age;scale.set(r,r*1.28,1);matrix.compose(pos,camera.quaternion,scale);smoke.setMatrixAt(n++,matrix);
    }}
    smoke.count=n;smoke.visible=n>0;if(n)smoke.instanceMatrix.needsUpdate=true;
  }
  return {update,dispose(){scene.remove(smoke);geometry.dispose();material.dispose();lights.forEach(l=>scene.remove(l));}};
}
