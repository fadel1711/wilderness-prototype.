// Wilderness v0.24.0 — integrated animated survivor.
// The actual world/player group, collision physics, and saves do not change.
// If loading, parsing or updating fails, the classic procedural survivor remains usable.
export const SURVIVOR_GLB = './assets/survivor-animated.glb';

// Meshy exported cumulative animation sets and gave some clips opaque IDs.
// Named activities below use the newest file containing the union of all uploaded clips.
// Animation names were inferred from the supplied cumulative export and require in-game visual verification.
export const SURVIVOR_CLIPS = Object.freeze({
  idle: 'Idle_11',
  idleLong: 'Idle_3',
  idleRelaxed: 'Idle_4',
  walk: 'Walking',
  run: 'Running',
  jump: 'Regular_Jump',
  attack: 'Attack',
  chop: 'Charged_Axe_Chop',
  // Opaque names associated with the corresponding cumulative export steps.
  dodge: '_01a1b2b6_8a41_70f7_84cc_ab6a8cb7c969',
  block: '_01a1b2b9_95c1_774c_b481_9f3cb3faa022',
  attack2: '_01a1b2bb_e73a_70b7_b76f_a79f62bbdef9',
  pickup: '_01a1b2bd_ecf9_751d_8d68_29bb91845738',
  runAlt: '_01a1b2bf_ecb6_73a5_bd42_2f5d5278fd63',
  defeat: '_01a1b2c3_a3d3_76e8_aa4b_b7fc1cca92fc',
  holdTorch: '_01a1b2c6_c53c_7682_9c3e_9ed1c567a8f3',
  ignite: '_01a1b2c9_f33d_72b7_80d8_9865628cc3d7'
});
export const SURVIVOR_PREVIEW_LABELS = Object.freeze({
  Running:'Run (original)',Walking:'Walk (original)',
  Idle_11:'Idle (short)',Idle_3:'Idle (long)',Idle_4:'Idle (alternate)',
  Regular_Jump:'Jump',Attack:'Sword attack',Charged_Axe_Chop:'Axe chop'
});

// Remove root motion: gameplay owns position, collision and dodge displacement.
// Retain hips height to allow jumps / rolls / collapse to animate visually.
export function inPlaceClip(clip,THREE){
  const copy=clip.clone();
  for(const track of copy.tracks){
    if(!track.name.endsWith('.position')||!track.name.includes('Hips'))continue;
    if(track.getValueSize()!==3)continue;
    const x=track.values[0],y=track.values[1],z=track.values[2];
    for(let i=0;i<track.values.length;i+=3){track.values[i]=x;track.values[i+2]=z;
      if(clip.name==='Regular_Jump')track.values[i+1]=y; // game physics already moves the player vertically
    }
  }
  return copy;
}

export function createSurvivorAnimations(THREE,{player,armR,weaponMount,playerShadow,log=console}){
  // Don't make the glTF parser a startup dependency; broken assets must not break the game.
  let enabled=false,loading=null,model=null,mixer=null,currentAction=null,
      oneShotRemaining=0,oneShotKey=null,handBone=null,baselineHand=null,
      status='classic',failure='',clipNames=[],loaded=false,renderMode='classic';
  const classicParts=player.children.filter(child=>child!==playerShadow);
  const classicVisibility=new Map(classicParts.map(part=>[part,part.visible]));
  const clips=new Map();
  const qPlayer=new THREE.Quaternion(),qHand=new THREE.Quaternion(),qReference=new THREE.Quaternion();
  const vHand=new THREE.Vector3();
  const armMountPosition=weaponMount.position.clone(),armMountRotation=weaponMount.quaternion.clone();

  function classic(){
    const wasAnimated=renderMode==='animated';
    renderMode='classic';
    if(model)model.visible=false;
    armR.add(weaponMount);
    weaponMount.position.copy(armMountPosition);weaponMount.quaternion.copy(armMountRotation);
    if(wasAnimated)for(const part of classicParts)part.visible=classicVisibility.get(part)??true;
    status=loaded?'classic (ready)':'classic';
  }
  function animated(){
    if(!model||!handBone)return classic();
    for(const part of classicParts){classicVisibility.set(part,part.visible);part.visible=false;}
    model.visible=true;weaponMount.position.set(0,0,0);weaponMount.quaternion.identity();player.add(weaponMount);
    renderMode='animated';status='animated';baselineHand=null;
    selectAction('idle',.01);
    // Establish the actual idle-pose hand rotation before calibrating the grip.
    mixer.update(.02);
    updateWeaponMount();
  }
  function fail(error){
    failure=String(error?.message||error).slice(0,240);
    status='fallback: '+failure;
    log.warn('Wilderness: animated survivor unavailable, using classic fallback:',error);
    enabled=false;classic();status='fallback: '+failure;
  }
  function load(){
    if(loading)return loading;
    status='loading';
    loading=import('three/addons/loaders/GLTFLoader.js')
      .then(({GLTFLoader})=>new Promise((resolve,reject)=>{
        new GLTFLoader().load(SURVIVOR_GLB,resolve,undefined,reject);
      }))
      .then(gltf=>{
        if(!gltf.scene)throw new Error('Model has no scene');
        // GLTFLoader sanitizes ':' to '_' in bone names on some Three.js builds.
        handBone=gltf.scene.getObjectByName('mixamorig_RightHand')||gltf.scene.getObjectByName('mixamorig:RightHand');
        if(!handBone)gltf.scene.traverse(o=>{if(o.isBone&&/RightHand$/.test(o.name))handBone=o;});
        if(!handBone)throw new Error('Missing RightHand rig joint');
        gltf.scene.traverse(o=>{
          if(!o.isSkinnedMesh)return;
          o.frustumCulled=false; // arm/roll poses can extend outside static mesh bounds
          if(!gltf.parser.json.materials?.length){
            o.material=new THREE.MeshStandardMaterial({color:0xb5b8ac,roughness:.96,metalness:0,side:THREE.FrontSide});
          }
        });
        model=gltf.scene;model.name='WildernessAnimatedSurvivor';
        model.scale.setScalar(2.26/1.7);model.position.set(0,0,0);model.visible=false;
        player.add(model);
        mixer=new THREE.AnimationMixer(model);
        for(const clip of gltf.animations){
          const safe=inPlaceClip(clip,THREE);
          clips.set(safe.name,safe);
        }
        clipNames=Array.from(clips.keys());
        if(!clips.has(SURVIVOR_CLIPS.walk)||!clips.has(SURVIVOR_CLIPS.run))throw new Error('Missing walking/running clips');
        loaded=true;
        if(enabled)animated();else classic();
        return {clips:clipNames.length};
      }).catch(error=>{fail(error);return {error:String(error)};});
    return loading;
  }
  function selectAction(key,fade=.12,once=false,targetSeconds=null){
    if(renderMode!=='animated'||!mixer)return false;
    const clip=clips.get(SURVIVOR_CLIPS[key]||key);
    if(!clip)return false;
    const action=mixer.clipAction(clip);
    if(currentAction===action&&!once)return true;
    const previous=currentAction;
    if(previous&&previous!==action)previous.fadeOut(fade);
    action.reset();action.enabled=true;action.setEffectiveWeight(1);
    action.setLoop(once?THREE.LoopOnce:THREE.LoopRepeat,once?1:Infinity);
    action.clampWhenFinished=!!once;
    action.setEffectiveTimeScale(targetSeconds&&clip.duration>0?Math.min(20,Math.max(.25,clip.duration/targetSeconds)):1);
    action.fadeIn(previous&&previous!==action?fade:0.001).play();
    currentAction=action;
    return true;
  }
  function trigger(key,seconds=.7){
    if(renderMode!=='animated')return false;
    if(!clips.has(SURVIVOR_CLIPS[key]||key))return false;
    oneShotRemaining=seconds;oneShotKey=key;
    return selectAction(key,.10,true,seconds);
  }
  function updateWeaponMount(){
    if(renderMode!=='animated'||!handBone||!model)return;
    player.updateWorldMatrix(true,true);
    handBone.getWorldPosition(vHand);player.worldToLocal(vHand);
    // A little forward from the glove keeps equipment from clipping the palm.
    weaponMount.position.copy(vHand);weaponMount.position.y+=.015;weaponMount.position.z+=.04;
    player.getWorldQuaternion(qPlayer).invert();handBone.getWorldQuaternion(qHand).premultiply(qPlayer);
    if(!baselineHand)baselineHand=qHand.clone();
    qReference.copy(baselineHand).invert();
    weaponMount.quaternion.copy(qHand).multiply(qReference);
  }
  function update(dt,{moving=false,sprinting=false,blocking=false,torch=false}={}){
    if(renderMode!=='animated'||!mixer)return;
    try{
      if(oneShotRemaining>0){oneShotRemaining=Math.max(0,oneShotRemaining-dt);}
      if(oneShotRemaining===0){
        const desired=blocking?'block':moving?(sprinting?'run':'walk'):(torch?'holdTorch':'idle');
        if(oneShotKey){oneShotKey=null;selectAction(desired);}
        else selectAction(desired);
      }
      mixer.update(dt);updateWeaponMount();
    }catch(error){fail(error);}
  }
  function setEnabled(value){
    enabled=!!value;
    if(!enabled){classic();return Promise.resolve({classic:true});}
    if(loaded){animated();return Promise.resolve({clips:clipNames.length});}
    return load();
  }
  function hideClassicIfAnimated(){if(renderMode==='animated')for(const part of classicParts)part.visible=false;}
  function dispose(){if(mixer)mixer.stopAllAction();if(model)player.remove(model);classic();}
  return {
    load,setEnabled,update,trigger,dispose,hideClassicIfAnimated,
    info:()=>({status,loaded,mode:renderMode,clips:clipNames.length,clipNames:clipNames.slice(),failure})
  };
}
