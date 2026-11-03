// Wilderness v0.18 — portable campfire states and bounded mobile-friendly FX.
// No offline fuel drain; smoke is a buoyancy / wind particle approximation, not fluid dynamics.
export const CAMPFIRE_FUEL_SECONDS=180; // one wood log burns for three minutes of active play
export const CAMPFIRE_MAX_FUEL=900;
const validId=id=>/^b[1-9][0-9]{0,5}$/.test(id);
export function normalizeCampfires(value,builds=[]){
  if(value===null||value===undefined)value={};
  if(!value||Array.isArray(value)||typeof value!=='object')throw Error('Invalid campfire save.');
  const ids=new Set(builds.filter(b=>b.type==='campfire').map(b=>b.id));
  if(Object.keys(value).length>500)throw Error('Too many campfires.');
  const result={};
  for(const [id,record] of Object.entries(value)){
    if(!validId(id)||!ids.has(id)||!record||typeof record!=='object'||Array.isArray(record)||
      typeof record.lit!=='boolean'||typeof record.fuel!=='number'||!Number.isFinite(record.fuel)||
      record.fuel<0||record.fuel>CAMPFIRE_MAX_FUEL)throw Error('Damaged campfire record.');
    result[id]={fuel:record.fuel,lit:record.fuel>0&&record.lit};
  }
  // Newly placed campfires (or older saves) are unlit.
  for(const id of ids)if(!result[id])result[id]={fuel:0,lit:false};
  return result;
}
export function refuelCampfire(record){
  const current=record||{fuel:0,lit:false};
  if(!Number.isFinite(current.fuel)||current.fuel<0||current.fuel>CAMPFIRE_MAX_FUEL)return null;
  if(current.fuel>CAMPFIRE_MAX_FUEL-CAMPFIRE_FUEL_SECONDS)return null;
  return {fuel:Math.min(CAMPFIRE_MAX_FUEL,current.fuel+CAMPFIRE_FUEL_SECONDS),lit:true};
}
export function toggleCampfire(record){
  if(!record||record.fuel<=0)return null;
  return {fuel:record.fuel,lit:!record.lit};
}
export function advanceCampfires(states,dt){
  if(!Number.isFinite(dt)||dt<0||dt>1)throw Error('Invalid campfire timestep');
  let extinguished=0;
  for(const value of Object.values(states)){
    if(!value.lit)continue;
    value.fuel=Math.max(0,value.fuel-dt);
    if(value.fuel===0){value.lit=false;extinguished++;}
  }
  return extinguished;
}

export function createCampfireEffects(THREE,scene){
  // Shared 72-particle draw call, a maximum of 2 small non-shadow lights.
  const MAX_PARTICLES=72;
  const plane=new THREE.PlaneGeometry(1,1);
  const smokeMat=new THREE.MeshBasicMaterial({color:0xc3c9bf,transparent:true,opacity:.15,
    depthWrite:false,side:THREE.DoubleSide,fog:true});
  const smoke=new THREE.InstancedMesh(plane,smokeMat,MAX_PARTICLES);
  smoke.frustumCulled=false;smoke.count=0;smoke.renderOrder=4;smoke.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(smoke);
  const lights=Array.from({length:2},()=>{
    const l=new THREE.PointLight('#ffad5e',0,7,2);l.castShadow=false;scene.add(l);return l;
  });
  const q=new THREE.Quaternion(),sc=new THREE.Vector3(),pos=new THREE.Vector3(),matrix=new THREE.Matrix4();
  let elapsed=0;
  function update(dt,fireBuilds,states,observer,camera,low=false,daylight=0){
    elapsed+=Math.max(0,Math.min(dt,.1));
    const active=fireBuilds.filter(b=>states[b.id]?.lit&&states[b.id].fuel>0&&
      Math.hypot(b.x-observer.x,b.z-observer.z)<(low?18:32))
      .sort((a,b)=>Math.hypot(a.x-observer.x,a.z-observer.z)-Math.hypot(b.x-observer.x,b.z-observer.z));
    for(let k=0;k<lights.length;k++){
      const b=active[k],light=lights[k];
      if(!b){light.intensity=0;continue;}
      light.position.set(b.x,b.group.position.y+1.05,b.z);
      light.intensity=(low?.32:1.15)*(1-.30*daylight)*(0.89+.11*Math.sin(elapsed*17+k*5));
    }
    q.copy(camera.quaternion);
    let n=0;
    for(const b of active.slice(0,low?3:8)){
      const max=low?3:9;
      for(let j=0;j<max&&n<MAX_PARTICLES;j++){
        const age=((elapsed*.29+j/max+(b.x*7+b.z*3)*.071)%1+1)%1;
        const swirl=Math.sin(elapsed*.8+j*3.1+b.x*.3)*.10;
        const wind=.52*Math.sin(elapsed*.09+b.z*.013);
        const size=(.17+.60*age)*Math.pow(Math.max(0,Math.sin(age*Math.PI)),.54);
        pos.set(b.x+wind*age*age+swirl,b.group.position.y+.69+age*3.0,
          b.z+age*age*.22+.1*Math.cos(elapsed*.6+j));
        sc.set(Math.max(.001,size),Math.max(.001,size*1.20),1);
        matrix.compose(pos,q,sc);smoke.setMatrixAt(n++,matrix);
      }
    }
    smoke.count=n;smoke.visible=n>0;if(n)smoke.instanceMatrix.needsUpdate=true;
  }
  return {update,dispose(){scene.remove(smoke);plane.dispose();smokeMat.dispose();for(const light of lights)scene.remove(light);}};
}
