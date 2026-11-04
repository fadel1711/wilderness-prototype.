// Wilderness 0.11 Premium Stylized Adventure — visual-only renderer helpers.
// Uses no external assets, no save state, no networking, and independent random seeds.
// All render assets are deliberately modest for iPhone WebGL.
export function makeArtTexture(THREE,renderer,type,seed=11){
  const size=256, canvas=document.createElement('canvas');canvas.width=canvas.height=size;
  const ctx=canvas.getContext('2d');if(!ctx)return null;
  let s=seed>>>0;const rand=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};
  const fill=(c)=>{ctx.fillStyle=c;ctx.fillRect(0,0,size,size);};
  if(type==='grass'){
    fill('#667b5b');
    for(let i=0;i<240;i++){
      const x=rand()*256,y=rand()*256,r=2+rand()*19;
      const g=ctx.createRadialGradient(x,y,0,x,y,r);
      g.addColorStop(0,rand()>.46?'#8a9266a0':'#465f50a0');g.addColorStop(1,'#5b745000');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
    }
    for(let i=0;i<2800;i++){
      const x=rand()*256,y=rand()*256,length=1.1+rand()*4;
      ctx.strokeStyle=rand()>.5?'#c0b88d50':'#284c354a';ctx.lineWidth=.55+rand()*.7;
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(rand()-.5)*2,y-length);ctx.stroke();
    }
    for(let i=0;i<85;i++){ctx.fillStyle=rand()>.6?'#c5ae7c65':'#334d3d55';const x=rand()*256,y=rand()*256;ctx.fillRect(x,y,1+rand()*2,1+rand()*2);}
  } else if(type==='wood'){
    fill('#97816a');
    for(let y=0;y<256;y+=37){
      ctx.fillStyle=rand()>.5?'#a48b72':'#8e755f';ctx.fillRect(0,y,256,37);
      ctx.fillStyle='#392c2848';ctx.fillRect(0,y+34,256,3);
      ctx.fillStyle='#d7b59033';ctx.fillRect(0,y+3,256,2);
    }
    for(let i=0;i<240;i++){
      const x=rand()*256,y=rand()*256;
      ctx.strokeStyle=rand()>.45?'#3f302737':'#e5c3a13f';ctx.lineWidth=.4+rand()*1.3;
      ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x+9*rand(),y+.8,x+22*rand(),y+1,x+45*rand(),y+2);ctx.stroke();
    }
    for(let i=0;i<8;i++){
      const x=rand()*256,y=rand()*256;
      ctx.strokeStyle='#49372869';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,y,2+rand()*4,1.1+rand()*2,0,0,6.283);ctx.stroke();
    }
  } else if(type==='stone'){
    fill('#858a80');
    for(let i=0;i<650;i++){
      const x=rand()*256,y=rand()*256,sz=1+rand()*8;
      ctx.fillStyle=rand()>.56?'#d0d2bb20':'#222c3428';ctx.fillRect(x,y,sz,1+rand()*3);
    }
    for(let i=0;i<110;i++){
      const x=rand()*256,y=rand()*256;ctx.strokeStyle='#39474030';ctx.lineWidth=.6;
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+rand()*9,y+(rand()-.5)*6);ctx.stroke();
    }
  } else if(type==='roof'){
    fill('#625d59');
    for(let y=0;y<256;y+=21){
      ctx.fillStyle='#2d2d2f50';ctx.fillRect(0,y,256,3);
      for(let x=(y%42? -21:0);x<256;x+=42){
        const rgb=rand()>.5?'#77736d':'#55544f';ctx.fillStyle=rgb;ctx.fillRect(x+2,y+4,39,15);
        ctx.fillStyle='#cac3ac29';ctx.fillRect(x+4,y+4,34,1);
        ctx.fillStyle='#262a293f';ctx.fillRect(x+40,y+2,2,19);
      }
    }
  } else if(type==='cloth'){
    fill('#7c8a72');
    for(let i=0;i<2800;i++){
      const x=rand()*256,y=rand()*256;
      ctx.fillStyle=rand()>.6?'#d0d1af20':'#1d3c2c18';ctx.fillRect(x,y,1,rand()>.5?2:1);
    }
  } else fill('#80867b');
  const tex=new THREE.CanvasTexture(canvas);
  tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
  tex.colorSpace=THREE.SRGBColorSpace;
  tex.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
  return tex;
}
export function createSkyGradient(THREE,scene){
  const material=new THREE.ShaderMaterial({
    side:THREE.BackSide,depthWrite:false,fog:false,
    uniforms:{zenith:{value:new THREE.Color('#729ca8')},horizon:{value:new THREE.Color('#e0d9b9')}},
    vertexShader:'varying vec3 vPos; void main(){vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'uniform vec3 zenith;uniform vec3 horizon;varying vec3 vPos;void main(){float h=clamp((normalize(vPos).y+0.08)*1.35,0.0,1.0);h=smoothstep(0.0,1.0,h);gl_FragColor=vec4(mix(horizon,zenith,h),1.0);}'
  });
  const sky=new THREE.Mesh(new THREE.SphereGeometry(680,24,12),material);
  sky.frustumCulled=false;sky.renderOrder=-900;
  scene.add(sky);
  return {sky,material};
}
export function updateSkyGradient(THREE,gradient,daylight,twilight){
  const a=gradient.material.uniforms.zenith.value;
  const b=gradient.material.uniforms.horizon.value;
  a.set('#283e61').lerp(new THREE.Color('#6f9da8'),daylight);
  b.set('#56637b').lerp(new THREE.Color('#e4d7b4'),daylight);
  if(twilight>.01)b.lerp(new THREE.Color('#dba77e'),Math.min(.6,twilight*.52));
}
export function createGroundScatter(THREE,scene,{world=86,resources=[],count=780}={}){
  let seed=116301;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const geom=new THREE.BufferGeometry();
  // Slender double-sided crossed grass geometry, just 4 triangles per tuft.
  const position=new Float32Array([
    -.12,0,0, 0,.45,0, .12,0,0,
    0,0,-.12, 0,.41,0, 0,0,.12
  ]);
  geom.setAttribute('position',new THREE.BufferAttribute(position,3));geom.computeVertexNormals();
  const materials=['#829367','#748b65','#a29c76'].map(c=>new THREE.MeshLambertMaterial({color:c,side:THREE.DoubleSide}));
  const dummy=new THREE.Object3D();const meshes=[];
  for(let j=0;j<3;j++){
    const m=new THREE.InstancedMesh(geom,materials[j],count/3);
    m.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    m.frustumCulled=false;
    for(let i=0;i<count/3;i++){
      let x=0,z=0;for(let tries=0;tries<6;tries++){
        x=(rand()-.5)*world*2;z=(rand()-.5)*world*2;
        if(Math.hypot(x,z)<7)continue;
        if(resources.some(r=>r.hits>0&&Math.hypot(x-r.x,z-r.z)<.9))continue;
        break;
      }
      dummy.position.set(x,-.04,z);dummy.rotation.y=rand()*Math.PI*2;
      const scale=.5+rand()*.9;dummy.scale.set(scale,scale,scale);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);
    }
    m.instanceMatrix.needsUpdate=true;
    scene.add(m);meshes.push(m);
  }
  return {meshes,setLow(low){for(const m of meshes)m.visible=!low;}};
}
