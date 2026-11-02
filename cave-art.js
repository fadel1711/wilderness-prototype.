// Wilderness v0.12 — Echo Cave benchmark environment, geometry only.
// All work here is visual. It does not move the entry, save identifiers or loot.
// The 22-m tunnel occupies the original (66,-61) landmark and preserves its
// floor elevation and playable corridor. No externally hosted 3D assets.

export const CAVE_ART_VERSION = '0.12';
const CAVE_X = 66, CAVE_Z = -61;
function fract(n){return n-Math.floor(n);}
function hash(n){return fract(Math.sin(n*127.1+19.73)*43758.5453);}
const lerp=(a,b,t)=>a+(b-a)*t;
function canvasStone(THREE,renderer){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;
  const ctx=canvas.getContext('2d');if(!ctx)return null;
  ctx.fillStyle='#89897b';ctx.fillRect(0,0,256,256);
  let seed=81722;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  // Grain, irregular fissures and a few warmer sediment flecks.
  for(let i=0;i<12500;i++){
    const x=rand()*256,y=rand()*256,r=.5+rand()*3.5;
    const a=rand()>.55?27:240;
    ctx.fillStyle=`rgba(${a},${a},${Math.max(0,a-12)},${.025+rand()*.10})`;
    ctx.fillRect(x,y,r,r);
  }
  for(let i=0;i<150;i++){
    const x=rand()*256,y=rand()*256;
    ctx.strokeStyle=rand()>.35?'#40483d2c':'#c9bd9c42';ctx.lineWidth=.8+rand()*1.9;
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+3+rand()*19,y+(rand()-.5)*12);ctx.stroke();
  }
  const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
  texture.repeat.set(2.25,3.25);return texture;
}
function tunnelGeometry(THREE,roofPiece=false){
  // Curved stone tunnel: 17 cross sections, 15 points on each arch.
  // A slight bend shifts the arch silhouette without changing walkable bounds.
  const verts=[],colors=[],uvs=[],indices=[];
  const rings=18,arc=16;
  for(let i=0;i<=rings;i++){
    const t=i/rings,z=11.15-t*22.1;
    const bend=Math.sin(t*Math.PI*1.22)*.15;
    const width=3.22+Math.sin(i*1.17)*.11;
    const tall=3.72+Math.sin(i*.9)*.22;
    for(let j=0;j<=arc;j++){
      const a=Math.PI*j/arc;
      const atEdge=Math.abs(Math.cos(a));
      const variation=(hash(i*77+j*11)-.5)*.21;
      const x=bend+Math.cos(a)*(width+variation);
      const y=Math.max(.025,Math.sin(a)*(tall+variation*.75))+.02;
      verts.push(x,y,z+(hash(i*13+j*9)-.5)*.08);
      const light=lerp(.64,1,Math.sin(a)*.48+.18)+(hash(i*51+j*17)-.5)*.16;
      const moss=(t<.20&&j>2&&j<8)? .10:0;
      colors.push(.62*light-moss,.64*light+.01,.60*light-moss*.45);
      uvs.push(j/arc*2.8,t*3.6);
    }
  }
  for(let i=0;i<rings;i++)for(let j=0;j<arc;j++){
    const a=i*(arc+1)+j,b=a+arc+1;
    const ceiling=j>=4&&j<12;
    if(ceiling===roofPiece)indices.push(a,b,a+1,b,b+1,a+1);
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}
function floorGeometry(THREE){
  const coords=[],colors=[],uvs=[],indices=[];const nx=10,nz=22;
  for(let zi=0;zi<=nz;zi++)for(let xi=0;xi<=nx;xi++){
    const x=-3.17+xi*6.34/nx,z=11.1-zi*22.0/nz;
    // Visual micro-relief only: physical ground remains at y=0.
    const height=-.060+hash(xi*71+zi*5)*.052;
    coords.push(x,height,z);
    const b=.71+hash(xi*21+zi*43)*.22;
    colors.push(.52*b,.51*b,.45*b);
    uvs.push(xi/nx*2.5,zi/nz*7);
  }
  for(let i=0;i<nz;i++)for(let j=0;j<nx;j++){
    const a=i*(nx+1)+j,b=a+nx+1;indices.push(a,b,a+1,b,b+1,a+1);
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(coords,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
export function createEchoCave(THREE,scene,renderer){
  const world=new THREE.Group();world.position.set(CAVE_X,0,CAVE_Z);scene.add(world);
  const cap=new THREE.Group();world.add(cap);
  const detail=new THREE.Group();world.add(detail);
  const rockTexture=canvasStone(THREE,renderer);
  const stone=new THREE.MeshStandardMaterial({color:'#9b9b8e',map:rockTexture,roughness:1,flatShading:true});
  const darkRock=new THREE.MeshStandardMaterial({color:'#5d665f',map:rockTexture,roughness:1,flatShading:true});
  const archMaterial=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:true,side:THREE.DoubleSide});
  const pathMaterial=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:true,side:THREE.DoubleSide});
  const moss=new THREE.MeshStandardMaterial({color:'#617358',roughness:1});
  const soil=new THREE.MeshStandardMaterial({color:'#827665',roughness:1});
  const bark=new THREE.MeshStandardMaterial({color:'#554538',roughness:1});
  const warm=new THREE.MeshStandardMaterial({color:'#f1b66b',emissive:'#ffb35e',emissiveIntensity:1.2});
  const ember=new THREE.MeshStandardMaterial({color:'#694631',roughness:1});
  function add(g,material,parent,x,y,z,sx=1,sy=1,sz=1){
    const m=new THREE.Mesh(g,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m;
  }
  // Unified cavern arch, not a rectangular box with rocks pasted onto it.
  add(tunnelGeometry(THREE,false),archMaterial,world,0,0,0);
  // Hide only the ceiling and roof boulders indoors, preserving visible walls
  // and keeping the player/camera unobstructed as in v0.11.
  add(tunnelGeometry(THREE,true),archMaterial,cap,0,0,0);
  add(floorGeometry(THREE),pathMaterial,world,0,0,0);
  // Rear wall seals the tunnel at the original map limit.
  add(new THREE.IcosahedronGeometry(1,1),darkRock,world,.0,1.95,-11.5,4.1,2.2,.9);
  // Organic stone cap is removed from view indoors for camera visibility.
  for(let i=0;i<15;i++){
    const z=-10.5+i*1.47;
    const r=hash(i*33+8),x=(r-.5)*3.1;
    const cliff=add(new THREE.IcosahedronGeometry(1,1),i%3?stone:darkRock,cap,x,3.95+hash(i)*.42,z,2.1+hash(i+2)*1.5,.75+hash(i+4)*.55,1.4);
    cliff.rotation.set(hash(i*7)*.3,hash(i+5)*3,hash(i*3)*.18);
  }
  // Raised hillside cheeks enclose the opening without blocking the original path.
  for(const side of [-1,1]){
    for(let i=0;i<15;i++){
      const z=-11.9+i*1.65;
      const x=side*(5.4+hash(i*19+side)*1.55);
      const rock=add(new THREE.IcosahedronGeometry(1,1),i%4===0?darkRock:stone,world,x,1.3+hash(i*17)*.5,z,2.15+hash(i+11)*.85,1.85+hash(i+13)*.85,1.45);
      rock.rotation.set(hash(i+5)*.3,hash(i*3)*3.14,hash(i+7)*.25);
    }
  }
  // Jagged natural mouth, preserving a walkable opening > 5m wide.
  const entrance=11.3;
  for(let k=0;k<=10;k++){
    const phi=Math.PI*k/10;
    const x=Math.cos(phi)*3.6;
    const y=.40+Math.sin(phi)*4.15;
    const s=(k===0||k===10)?1.1:.78;
    const r=add(new THREE.IcosahedronGeometry(1,1),k%3===0?darkRock:stone,world,x,y,entrance,s*1.0,s*.92,.85);
    r.rotation.set(.15*k,.3*k,phi*.28);
  }
  // Graded approach and scattered rock transitions connect cave to forest.
  for(let i=0;i<9;i++){
    const z=12+i*1.7;
    const trail=add(new THREE.CircleGeometry(2.4+i*.12,12),soil,world,Math.sin(i*.26)*.15,-.072,z);
    trail.rotation.x=-Math.PI/2;
  }
  for(let i=0;i<33;i++){
    const x=(hash(i*51+11)-.5)*17;
    const z=9+hash(i*21+4)*19;
    if(Math.abs(x)<3.3)continue;
    const s=.15+hash(i*6)*.52;
    const r=add(new THREE.IcosahedronGeometry(1,0),i%4?stone:darkRock,detail,x,s*.35,z,s,s*.7,s*1.2);
    r.rotation.set(.1,hash(i*6+2)*3,.07);
  }
  // Broadleaf ferns & moss around the mouth, never placed in walkable center.
  const fernGeometry=new THREE.ConeGeometry(.22,.86,5);
  for(let i=0;i<46;i++){
    const x=(hash(i*101+7)-.5)*17,z=5+hash(i*37+19)*23;
    if(Math.abs(x)<3.4)continue;
    const size=.48+hash(i*3)*.45;
    const plant=add(fernGeometry,moss,detail,x,.3*size,z,size,size,size);
    plant.rotation.z=(hash(i*9+10)-.5)*.45;
  }
  // Low-poly hanging mineral formations, visible from inside.
  for(let i=0;i<25;i++){
    const z=-10+hash(i*4+6)*19;
    const x=(hash(i*13+11)-.5)*5.1;
    const len=.22+hash(i*3+15)*.65;
    const stalactite=add(new THREE.ConeGeometry(.12+len*.15,len,6),i%3?darkRock:stone,detail,x,3.7-len/2,z);
    stalactite.rotation.z=Math.PI+(hash(i*17+1)-.5)*.2;
  }
  // Lanterns provide a clear warm path toward the original cache.
  const lights=[];
  for(const z of [-6.7,4.0]){
    add(new THREE.CylinderGeometry(.065,.09,1.3,7),bark,world,2.45,.72,z);
    add(new THREE.CylinderGeometry(.19,.23,.22,7),ember,world,2.45,1.45,z);
    add(new THREE.ConeGeometry(.14,.37,7),warm,world,2.45,1.67,z);
    const glow=new THREE.PointLight('#ffaf68',2.2,8.5,2);glow.position.set(2.45,1.7,z);world.add(glow);lights.push(glow);
  }
  // Low mode keeps the core cave but disables the numerous decorative accents.
  let low=false;
  return {root:world,roof:cap,setLow(value){low=!!value;detail.visible=!low;for(const l of lights)l.visible=!low;},
    update(playerX,playerZ){const nearby=Math.hypot(playerX-CAVE_X,playerZ-CAVE_Z)<26;
      for(const l of lights)l.visible=!low&&nearby;}};
}
