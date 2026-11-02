import * as THREE from 'three';

// Wilderness v0.1.1: joystick horizontal direction fix; existing saves are preserved. No accounts, analytics or paid systems.
const $ = id => document.getElementById(id);
const WORLD = 46, SAVE_KEY='wilderness_v01_singleplayer';
const cameraDistance = 7.6, clock = new THREE.Clock();
const scene = new THREE.Scene(); scene.background=new THREE.Color('#a9cbd0'); scene.fog=new THREE.Fog('#a9cbd0',30,87);
const camera = new THREE.PerspectiveCamera(67,innerWidth/innerHeight,0.1,130);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'low-power'});
renderer.setSize(innerWidth,innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio,1.5)); renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.12;
$('world').appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight('#e5f4ff','#786948',2.05));
const sun=new THREE.DirectionalLight('#fff0c8',2.2); sun.position.set(-24,39,14); scene.add(sun);
const mat=(color,roughness=1)=>new THREE.MeshStandardMaterial({color,roughness});
const turf=mat('#718e58'),bark=mat('#806347'),needles=[mat('#4b7754'),mat('#5c8757'),mat('#3f6b4b')],stoneMat=mat('#91998c'),darkStone=mat('#707a73'),woodMat=mat('#946c44'),woodLight=mat('#b58c5b'),roofMat=mat('#735245'),cloth=mat('#586f9a'),skin=mat('#e3bb93'),boots=mat('#4d392b');
function mesh(geo,material,parent,x=0,y=0,z=0){const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);parent.add(m);return m;}
const boxGeo=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
mesh(new THREE.PlaneGeometry(110,110),turf,scene,0,-.09,0).rotation.x=-Math.PI/2;
// Decorative landscape, intentionally modest low-poly game art.
const plain=mat('#91a46a'); let rng=13371337;
function random(){rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;}
const road=mat('#b9a275'); for(let i=0;i<16;i++){
 const x=(random()-.5)*80,z=(random()-.5)*80;
 const patch=mesh(new THREE.CircleGeometry(1.6+random()*2,10),plain,scene,x,-.07,z); patch.rotation.x=-Math.PI/2;
}
const decoMat=[mat('#87a768'),mat('#a6b67b'),mat('#d6b969')];
for(let i=0;i<95;i++){let x=(random()-.5)*88,z=(random()-.5)*88;if(Math.hypot(x,z)<8)continue;
 const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
 for(let j=0;j<3;j++){const blade=mesh(new THREE.ConeGeometry(.07,.3+random()*.32,4),decoMat[i%3],g,(random()-.5)*.4,.16,(random()-.5)*.4);blade.rotation.z=(random()-.5)*.5;}
}
// Gentle hills beyond the playable clearing.
const hillMat=mat('#64806a');for(let i=0;i<17;i++){const a=i/17*Math.PI*2,r=58+random()*20;
 const hill=mesh(new THREE.ConeGeometry(7+random()*9,12+random()*17,7),hillMat,scene,Math.sin(a)*r,4,Math.cos(a)*r);hill.rotation.y=random()*6;}
// Character model, deliberately simple placeholder with tiny walk animation.
const player=new THREE.Group();scene.add(player);
mesh(boxGeo(.78,1.07,.45),cloth,player,0,1.32,0);
mesh(new THREE.SphereGeometry(.34,12,10),skin,player,0,2.12,0);
const armL=mesh(boxGeo(.25,.89,.28),cloth,player,-.56,1.35,0),armR=mesh(boxGeo(.25,.89,.28),cloth,player,.56,1.35,0);
const legL=mesh(boxGeo(.29,.86,.35),boots,player,-.21,.47,0),legR=mesh(boxGeo(.29,.86,.35),boots,player,.21,.47,0);
mesh(boxGeo(.12,.10,.13),darkStone,player,-.12,2.15,.32);mesh(boxGeo(.12,.10,.13),darkStone,player,.12,2.15,.32);
player.position.set(0,0,0);
const resourceRoot=new THREE.Group();scene.add(resourceRoot);
const resources=[], resourceMeshes=[];
function addTree(id,x,z,s){const g=new THREE.Group();g.position.set(x,0,z);resourceRoot.add(g);
 mesh(new THREE.CylinderGeometry(.24*s,.39*s,2.1*s,7),bark,g,0,1.05*s,0);
 for(let j=0;j<3;j++)mesh(new THREE.ConeGeometry((1.5-j*.19)*s,2.8*s,8),needles[(id+j)%3],g,0,(2.25+j*.81)*s,0);
 resources.push({id,type:'tree',x,z,hits:3,group:g});resourceMeshes.push(g);
}
function addRock(id,x,z,s){const g=new THREE.Group();g.position.set(x,0,z);resourceRoot.add(g);
 const m=mesh(new THREE.DodecahedronGeometry(.95*s,0),id%2?stoneMat:darkStone,g,0,.52*s,0);m.scale.set(1.25,.62,1);m.rotation.set(.15,random()*4,.13);
 resources.push({id,type:'rock',x,z,hits:2,group:g});resourceMeshes.push(g);
}
for(let i=0;i<34;i++){const a=random()*Math.PI*2,r=10+Math.sqrt(random())*36,x=Math.cos(a)*r,z=Math.sin(a)*r;
 if(Math.abs(x)>WORLD||Math.abs(z)>WORLD)continue;addTree('t'+i,x,z,.75+random()*.6);}
for(let i=0;i<27;i++){const a=random()*Math.PI*2,r=9+Math.sqrt(random())*35,x=Math.cos(a)*r,z=Math.sin(a)*r;
 if(Math.abs(x)>WORLD||Math.abs(z)>WORLD)continue;addRock('r'+i,x,z,.75+random()*.8);}
// Building construction. Blueprint and free-build pieces share the same placement system.
const builds=[], buildRoot=new THREE.Group();scene.add(buildRoot);
function cabinShape(g){
 mesh(boxGeo(5,.28,5),woodLight,g,0,.14,0);
 // Back / left / right walls; the front retains an open doorway.
 mesh(boxGeo(5,2.65,.22),woodMat,g,0,1.58,-2.4);
 mesh(boxGeo(.22,2.65,5),woodMat,g,-2.4,1.58,0);mesh(boxGeo(.22,2.65,5),woodMat,g,2.4,1.58,0);
 mesh(boxGeo(1.8,2.65,.22),woodMat,g,-1.6,1.58,2.4);mesh(boxGeo(1.8,2.65,.22),woodMat,g,1.6,1.58,2.4);
 mesh(boxGeo(1.4,.55,.22),woodMat,g,0,2.63,2.4);
 const left=mesh(boxGeo(3.04,.28,5.7),roofMat,g,-1.2,3.6,0);left.rotation.z=.59;
 const right=mesh(boxGeo(3.04,.28,5.7),roofMat,g,1.2,3.6,0);right.rotation.z=-.59;
 mesh(boxGeo(1.2,.9,.12),mat('#769a9b',.5),g,1.7,1.78,-2.53);
}
function createBuild(type,x,z,rot,ghost=false){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;buildRoot.add(g);
 if(type==='cabin')cabinShape(g);
 if(type==='floor')mesh(boxGeo(2,.26,2),woodLight,g,0,.14,0);
 if(type==='wall')mesh(boxGeo(2,2.7,.22),woodMat,g,0,1.48,0);
 if(ghost){g.traverse(o=>{if(o.isMesh){o.material=new THREE.MeshBasicMaterial({color:'#98d9ac',transparent:true,opacity:.40,depthWrite:false,side:THREE.DoubleSide});}});}
 return g;
}
const cost={cabin:{wood:12,stone:5},floor:{wood:2,stone:0},wall:{wood:3,stone:0}};
let wood=0,stone=0,buildMode=false,selected='cabin',orientation=0,preview=null,validPlacement=false;
let yaw=0,pitch=.38,nearby=null,runTime=0;
const move={x:0,y:0},keys=new Set();let joystickPointer=null,lookPointer=null,lastLookX=0,lastLookY=0,paused=true;
let toastTimeout=null;
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>$('toast').classList.remove('show'),1900);}
function updateHud(){$('woodCount').textContent=wood;$('stoneCount').textContent=stone;
 const cabinCount=builds.filter(o=>o.type==='cabin').length;
 $('task').textContent=cabinCount?'🏡 Cabin built! Gather more resources and expand using Floor and Wall.':'🌲 Goal: Gather 12 wood and 5 stone, then place a Cabin blueprint.';
}
function saveGame(silent=false){try{const payload={version:1,wood,stone,px:player.position.x,pz:player.position.z,resources:Object.fromEntries(resources.map(r=>[r.id,r.hits])),builds:builds.map(({type,x,z,rot})=>({type,x,z,rot}))};localStorage.setItem(SAVE_KEY,JSON.stringify(payload));if(!silent)toast('World saved on this device ✓');}
 catch(e){if(!silent)toast('Local save unavailable in this browser');}}
function loadGame(){let data;try{data=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');}catch(e){}if(!data||data.version!==1)return;
 wood=Math.max(0,Number(data.wood)||0);stone=Math.max(0,Number(data.stone)||0);
 player.position.x=THREE.MathUtils.clamp(Number(data.px)||0,-WORLD,WORLD);player.position.z=THREE.MathUtils.clamp(Number(data.pz)||0,-WORLD,WORLD);
 for(const r of resources){if(Object.hasOwn(data.resources||{},r.id)){r.hits=Math.max(0,Number(data.resources[r.id])||0);if(!r.hits)r.group.visible=false;}}
 for(const b of (Array.isArray(data.builds)?data.builds.slice(0,250):[])){if(!cost[b.type]||!Number.isFinite(b.x)||!Number.isFinite(b.z)||!Number.isFinite(b.rot))continue;
 const x=THREE.MathUtils.clamp(b.x,-WORLD,WORLD),z=THREE.MathUtils.clamp(b.z,-WORLD,WORLD);createBuild(b.type,x,z,b.rot);builds.push({type:b.type,x,z,rot:b.rot});}
}
loadGame();updateHud();
function getNearest(){let winner=null,best=3.0;for(const r of resources){if(r.hits<=0)continue;const dist=Math.hypot(r.x-player.position.x,r.z-player.position.z);if(dist<best){best=dist;winner=r;}}return winner;}
function gather(){if(buildMode){toast('Close Build mode to gather');return;}const r=getNearest();if(!r){toast('Walk closer to a tree or rock');return;}
 r.hits--;r.group.scale.y=Math.max(.67,r.group.scale.y-.10);
 if(r.hits<=0){r.group.visible=false;if(r.type==='tree'){wood+=3;toast('+3 wood collected 🪵');}else{stone+=2;toast('+2 stone collected 🪨');}}else toast(r.type==='tree'?'Chopping tree…':'Mining stone…');
 updateHud();saveGame(true);
}
function choose(type){selected=type;document.querySelectorAll('[data-type]').forEach(b=>b.classList.toggle('active',b.dataset.type===type));if(preview){buildRoot.remove(preview);preview=null;}updatePreview();}
function setBuildMode(v){buildMode=v;$('buildPanel').classList.toggle('show',v);$('buildToggle').textContent=v?'✕ Close Build':'🔨 Build';$('action').style.display=v?'none':'block';if(!v&&preview){buildRoot.remove(preview);preview=null;}if(v)updatePreview();}
function projectedPos(){const forward=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));const distance=selected==='cabin'?6:4.1;
 const x=THREE.MathUtils.clamp(Math.round((player.position.x+forward.x*distance)/2)*2,-WORLD+3,WORLD-3);
 const z=THREE.MathUtils.clamp(Math.round((player.position.z+forward.z*distance)/2)*2,-WORLD+3,WORLD-3);
 return {x,z};}
function updatePreview(){if(!buildMode)return;const {x,z}=projectedPos();if(!preview)preview=createBuild(selected,x,z,orientation,true);
 preview.position.set(x,0,z);preview.rotation.y=orientation;
 const radius=selected==='cabin'?3.3:1.25;
 const clearResource=!resources.some(r=>r.hits>0&&Math.hypot(x-r.x,z-r.z)<radius+1);
 const clearBuilding=!builds.some(b=>Math.hypot(x-b.x,z-b.z)<radius+(b.type==='cabin'?2.1:.35));
 const clearPlayer=Math.hypot(x-player.position.x,z-player.position.z)>1.3;
 validPlacement=clearResource&&clearBuilding&&clearPlayer;
 const enough=wood>=cost[selected].wood&&stone>=cost[selected].stone;
 const color=(validPlacement&&enough)?'#98d9ac':(!validPlacement?'#e18478':'#e6b66c');
 preview.traverse(o=>{if(o.isMesh)o.material.color.set(color);});
 $('place').disabled=!validPlacement||!enough;
 $('place').textContent=validPlacement?(enough?'✓ Place':'Need materials'):'Location blocked';
}
function place(){if(!buildMode)return;updatePreview();const c=cost[selected];if(!validPlacement){toast('Find a clear spot');return;}if(wood<c.wood||stone<c.stone){toast('Gather more materials first');return;}
 const {x,z}=projectedPos();wood-=c.wood;stone-=c.stone;
 createBuild(selected,x,z,orientation);builds.push({type:selected,x,z,rot:orientation});
 updateHud();saveGame(true);toast(selected==='cabin'?'Your first cabin is built! 🏡':'Piece constructed ✓');updatePreview();
}
$('start').addEventListener('click',()=>{$('modal').classList.add('hidden');paused=false;toast('Explore, gather, and build!');});
$('action').addEventListener('click',gather);$('buildToggle').addEventListener('click',()=>setBuildMode(!buildMode));$('closeBuild').addEventListener('click',()=>setBuildMode(false));
$('save').addEventListener('click',()=>saveGame());$('rotate').addEventListener('click',()=>{orientation=(orientation+Math.PI/2)%(Math.PI*2);updatePreview();});$('place').addEventListener('click',place);
document.querySelectorAll('[data-type]').forEach(b=>b.addEventListener('click',()=>choose(b.dataset.type)));
const stick=$('stick'),knob=$('knob');
function joy(e){const rect=stick.getBoundingClientRect(),cx=rect.left+rect.width/2,cy=rect.top+rect.height/2,dx=e.clientX-cx,dy=e.clientY-cy;
 const max=38,mag=Math.hypot(dx,dy),scale=mag>max?max/mag:1;
 move.x=dx*scale/max;move.y=-dy*scale/max;knob.style.transform=`translate(${dx*scale}px,${dy*scale}px)`;
}
stick.addEventListener('pointerdown',e=>{e.preventDefault();joystickPointer=e.pointerId;stick.setPointerCapture(e.pointerId);joy(e);});
stick.addEventListener('pointermove',e=>{if(e.pointerId===joystickPointer)joy(e)});
function releaseJoy(e){if(e.pointerId===joystickPointer){joystickPointer=null;move.x=0;move.y=0;knob.style.transform='translate(0,0)';}}
stick.addEventListener('pointerup',releaseJoy);stick.addEventListener('pointercancel',releaseJoy);
const canvas=renderer.domElement;
canvas.addEventListener('pointerdown',e=>{if(paused||e.clientX<innerWidth*.31)return;lookPointer=e.pointerId;lastLookX=e.clientX;lastLookY=e.clientY;canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(e.pointerId!==lookPointer)return;
 yaw-=(e.clientX-lastLookX)*.0055;pitch=THREE.MathUtils.clamp(pitch+(lastLookY-e.clientY)*.004,0.13,.96);lastLookX=e.clientX;lastLookY=e.clientY;});
canvas.addEventListener('pointerup',e=>{if(e.pointerId===lookPointer)lookPointer=null;});canvas.addEventListener('pointercancel',e=>{if(e.pointerId===lookPointer)lookPointer=null;});
addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();keys.add(e.key.toLowerCase());
 if(e.repeat||paused)return;if(e.key.toLowerCase()==='e')gather();if(e.key.toLowerCase()==='b')setBuildMode(!buildMode);if(e.key.toLowerCase()==='f')place();if(e.key.toLowerCase()==='r'&&buildMode){orientation=(orientation+Math.PI/2)%(Math.PI*2);updatePreview();}});
addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));addEventListener('blur',()=>keys.clear());
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));});
let uiTimer=0,saveTimer=0;
function tick(){requestAnimationFrame(tick);const dt=Math.min(clock.getDelta(),.04);if(!paused){
 const axisX=move.x+(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0);
 const axisZ=move.y+(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0);
 const len=Math.hypot(axisX,axisZ);if(len>.03){const vx=axisX/Math.max(1,len),vz=axisZ/Math.max(1,len);
 // Camera faces forward along (sin(yaw), 0, cos(yaw)). Its screen-right is (-cos(yaw), 0, sin(yaw)).
 const dx=-Math.cos(yaw)*vx+Math.sin(yaw)*vz,dz=Math.sin(yaw)*vx+Math.cos(yaw)*vz;
 const speed=keys.has('shift')?6.1:3.6;
 player.position.x=THREE.MathUtils.clamp(player.position.x+dx*speed*dt,-WORLD,WORLD);
 player.position.z=THREE.MathUtils.clamp(player.position.z+dz*speed*dt,-WORLD,WORLD);
 player.rotation.y=Math.atan2(dx,dz);runTime+=dt*9;
 armL.rotation.x=Math.sin(runTime)*.42;armR.rotation.x=-Math.sin(runTime)*.42;
 legL.rotation.x=-Math.sin(runTime)*.35;legR.rotation.x=Math.sin(runTime)*.35;
 }else{armL.rotation.x*=.8;armR.rotation.x*=.8;legL.rotation.x*=.8;legR.rotation.x*=.8;}
 const forward=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));
 const target=new THREE.Vector3(player.position.x,1.55,player.position.z);
 const desired=target.clone().addScaledVector(forward,-cameraDistance*Math.cos(pitch));desired.y+=cameraDistance*Math.sin(pitch);
 camera.position.lerp(desired,Math.min(1,dt*8.5));camera.lookAt(target);
 if(buildMode)updatePreview();
 uiTimer+=dt;saveTimer+=dt;
 if(uiTimer>.18){uiTimer=0;nearby=getNearest();$('interaction').style.display=!buildMode&&nearby?'block':'none';
 if(nearby){$('interaction').textContent=nearby.type==='tree'?`🪓 Tree · ${nearby.hits} hits remaining`:`⛏ Rock · ${nearby.hits} hits remaining`;$('action').textContent=nearby.type==='tree'?'🪓 Chop':'⛏ Mine';}
 else $('action').textContent='Gather';}
 if(saveTimer>12){saveTimer=0;saveGame(true);}
 }
 renderer.render(scene,camera);
}
camera.position.set(0,5,-7);camera.lookAt(0,1.5,0);window.__gameReady=true;tick();
addEventListener('pagehide',()=>saveGame(true));
