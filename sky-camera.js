// Wilderness v0.16: visible celestial bodies and comfortable distance zoom.
// Renderer-independent helpers are intentionally easy to regression-test.
export const MIN_ZOOM=3.5;
export const MAX_ZOOM=18;
export const DEFAULT_ZOOM=7.4;
export function clampZoom(value){
  const n=Number(value);
  if(!Number.isFinite(n))return DEFAULT_ZOOM;
  return Math.max(MIN_ZOOM,Math.min(MAX_ZOOM,n));
}
export function celestialDirections(elapsed,daySeconds=720){
  if(!Number.isFinite(elapsed)||!Number.isFinite(daySeconds)||daySeconds<=0)throw Error('Invalid sky clock');
  const phase=((elapsed%daySeconds)+daySeconds)%daySeconds/daySeconds*Math.PI*2-Math.PI/2;
  const sx=Math.cos(phase)*.86,sy=Math.sin(phase),sz=.72;
  const norm=Math.hypot(sx,sy,sz);
  return {
    sun:{x:sx/norm,y:sy/norm,z:sz/norm,visible:sy>-.035},
    moon:{x:-sx/norm,y:-sy/norm,z:sz/norm,visible:sy<.035}
  };
}
function glowCanvas(kind){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
  const c=canvas.getContext('2d');if(!c)return canvas;
  const grd=c.createRadialGradient(64,64,8,64,64,62);
  if(kind==='sun'){
    grd.addColorStop(0,'rgba(255,255,225,1)');grd.addColorStop(.30,'rgba(255,232,174,1)');
    grd.addColorStop(.36,'rgba(255,215,135,.97)');grd.addColorStop(.65,'rgba(253,189,123,.17)');grd.addColorStop(1,'rgba(255,180,114,0)');
  }else{
    grd.addColorStop(0,'rgba(235,241,249,.98)');grd.addColorStop(.3,'rgba(204,221,238,.95)');
    grd.addColorStop(.39,'rgba(190,215,239,.8)');grd.addColorStop(.61,'rgba(181,207,235,.13)');grd.addColorStop(1,'rgba(182,209,238,0)');
  }
  c.fillStyle=grd;c.fillRect(0,0,128,128);
  if(kind==='moon'){
    for(const [x,y,r] of [[50,55,7],[75,46,4],[69,75,5],[49,72,3]]){
      c.beginPath();c.fillStyle='rgba(136,163,195,.19)';c.ellipse(x,y,r,r*.72,.3,0,Math.PI*2);c.fill();
    }
  }
  return canvas;
}
export function createSkyObjects(THREE,scene){
  const all={};
  for(const kind of ['sun','moon']){
    const texture=new THREE.CanvasTexture(glowCanvas(kind));texture.colorSpace=THREE.SRGBColorSpace;
    const material=new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false,depthWrite:false,fog:false});
    const sprite=new THREE.Sprite(material);sprite.renderOrder=-800;sprite.frustumCulled=false;
    sprite.scale.setScalar(kind==='sun'?18:12);scene.add(sprite);
    all[kind]=sprite;
  }
  return all;
}
export function updateSkyObjects(objects,elapsed,daySeconds,camera){
  const coords=celestialDirections(elapsed,daySeconds);
  for(const kind of ['sun','moon']){
    const sprite=objects[kind],d=coords[kind];sprite.visible=d.visible;
    if(d.visible){sprite.position.set(camera.position.x+d.x*125,camera.position.y+d.y*125,camera.position.z+d.z*125);}
  }
}
