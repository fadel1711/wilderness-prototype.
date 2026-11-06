// Wilderness v0.24.0 — Balanced Nightfall.
// Pure encounter rules + pooled low-poly figures. No persistent save schema or external assets.
export const ZOMBIE_BALANCED=Object.freeze({
  maxNearby:6, health:48, damage:10, speed:.78, chaseSpeed:1.48,
  chaseRadius:12, disengageRadius:25, strikeRange:1.55, windup:.62,
  hitCooldown:2.2, spawnMin:16, spawnMax:28, despawnRange:47,
  spawnInterval:5.25, respawnDelay:24
});
export function isZombieNight(elapsed,daySeconds=720){
  const fraction=((elapsed%daySeconds)+daySeconds)%daySeconds/daySeconds;
  const hour=fraction*24;
  return hour>=20||hour<5;
}
export function zombieState(range,playerSafe){
  if(playerSafe)return 'wander';
  if(range<ZOMBIE_BALANCED.strikeRange)return 'strike';
  if(range<ZOMBIE_BALANCED.chaseRadius)return 'chase';
  return 'wander';
}
export function zombieLoot(roll){
  if(roll<.05)return {item:'iron_bar',qty:1,rare:true};
  if(roll<.18)return {item:'iron_ore',qty:2,rare:true};
  if(roll<.40)return {item:'charcoal',qty:2,rare:false};
  if(roll<.70)return {item:'wood',qty:3,rare:false};
  return {item:'stone',qty:3,rare:false};
}
export function chooseZombieSpawn({player,random=Math.random,blocked,worldRadius,tries=44}){
  for(let i=0;i<tries;i++){
    const angle=random()*Math.PI*2;
    const radius=ZOMBIE_BALANCED.spawnMin+random()*(ZOMBIE_BALANCED.spawnMax-ZOMBIE_BALANCED.spawnMin);
    const x=player.x+Math.sin(angle)*radius,z=player.z+Math.cos(angle)*radius;
    if(Math.abs(x)>worldRadius-3||Math.abs(z)>worldRadius-3)continue;
    if(!blocked(x,z))return {x,z};
  }
  return null;
}

export function createZombieFigures(THREE,scene,count=ZOMBIE_BALANCED.maxNearby){
  // Shared geometry + materials: six enemies cost a few hundred triangles each.
  const geo={torso:new THREE.BoxGeometry(.62,.86,.34),pelvis:new THREE.BoxGeometry(.50,.23,.37),
    head:new THREE.SphereGeometry(.25,9,7),limb:new THREE.BoxGeometry(.19,.75,.21),
    shin:new THREE.BoxGeometry(.20,.65,.22),eye:new THREE.SphereGeometry(.034,5,4),
    rag:new THREE.BoxGeometry(.57,.22,.365),jaw:new THREE.BoxGeometry(.33,.12,.19)};
  const palettes=[['#829477','#444f40','#585041'],['#8c9783','#5b5345','#494f45'],['#93a18b','#574d47','#595842']];
  const skin=palettes.map(a=>new THREE.MeshStandardMaterial({color:a[0],roughness:1}));
  const coats=palettes.map(a=>new THREE.MeshStandardMaterial({color:a[1],roughness:1}));
  const pants=palettes.map(a=>new THREE.MeshStandardMaterial({color:a[2],roughness:1}));
  const eyes=new THREE.MeshBasicMaterial({color:'#d0b8a0'});
  const figures=[];
  const part=(parent,shape,mat,x=0,y=0,z=0)=>{
    const m=new THREE.Mesh(shape,mat);m.position.set(x,y,z);m.castShadow=false;parent.add(m);return m;
  };
  for(let i=0;i<count;i++){
    const g=new THREE.Group();scene.add(g);g.visible=false;
    const shade=i%3;
    const body=new THREE.Group();body.position.y=.0;g.add(body);
    part(body,geo.torso,coats[shade],0,1.35,0);
    const torn=part(body,geo.rag,coats[(shade+1)%3],-.02,.85,.007);torn.rotation.z=.11;
    part(body,geo.pelvis,pants[shade],0,.87,0);
    const head=new THREE.Group();head.position.set(.04,1.92,.025);body.add(head);
    part(head,geo.head,skin[shade],0,.02,0).scale.set(1.03,1.1,.89);
    part(head,geo.jaw,skin[shade],0,-.17,.158);
    for(const sx of [-1,1])part(head,geo.eye,eyes,sx*.115,.065,.224);
    const arms=[],legs=[];
    for(const sx of [-1,1]){
      const arm=new THREE.Group();arm.position.set(sx*.40,1.68,.03);body.add(arm);
      part(arm,geo.limb,skin[shade],sx*.035,-.37,.085);
      arms.push(arm);
      const leg=new THREE.Group();leg.position.set(sx*.16,.78,0);body.add(leg);
      part(leg,geo.shin,pants[shade],0,-.35,0);
      legs.push(leg);
    }
    figures.push({group:g,body,head,arms,legs});
  }
  return figures;
}
export function animateZombieFigure(figure,phase,speed=1,attacking=false,hitFlash=0){
  const swing=Math.sin(phase*(attacking?2.1:6.5))*Math.min(1,speed);
  figure.legs[0].rotation.x=swing*.32;figure.legs[1].rotation.x=-swing*.32;
  figure.arms[0].rotation.x=-.65-swing*.22-(attacking?.55:0);
  figure.arms[1].rotation.x=-.58+swing*.20-(attacking?.55:0);
  figure.body.rotation.z=Math.sin(phase*2.2)*.035;
  figure.body.rotation.x=attacking?-.19:hitFlash>0?.18:.07;
  figure.head.rotation.z=Math.sin(phase*1.8)*.065;
}
