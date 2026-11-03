// Wilderness v0.15 original stylized 3D art pack. All mesh and texture files are
// bundled with the ZIP; no cross-site model downloads. Failure leaves v0.14 art intact.
// These are compact handcrafted GLB models, not assets copied from the user's reference.
export const PREMIUM_ASSETS=['assets/pine.glb','assets/oak.glb','assets/moss-boulder.glb',
 'assets/forest-ground.webp','assets/stone-path.webp','assets/timber-planks.webp'];

export function createPremiumArt(THREE,{resources,player,renderer,grassMat,pathMat,timber,timberDark}){
  const entries=[];let ready=false,low=false,failed=false;
  function refresh(){
    if(!ready)return;
    const x=player.position.x,z=player.position.z;
    for(const ent of entries){
      const dx=ent.r.x-x,dz=ent.r.z-z;
      const show=!low&&!ent.r.deepHidden&&ent.r.hits>0&&dx*dx+dz*dz<60*60;
      ent.asset.visible=show;
      for(const old of ent.original)old.visible=!show&&!ent.r.deepHidden&&ent.r.hits>0&&(!old.userData.forestDetail||(!low&&dx*dx+dz*dz<38*38));
    }
  }
  async function start(){
    try{
      const {GLTFLoader}=await import('three/addons/loaders/GLTFLoader.js');
      const loader=new GLTFLoader();
      const [pine,oak,rock]=await Promise.all(PREMIUM_ASSETS.slice(0,3).map(url=>loader.loadAsync('./'+url+'?v=015')));
      const library={pine:pine.scene,oak:oak.scene,rock:rock.scene};
      for(const r of resources){
        const model=r.type==='rock'?library.rock:(Number(r.id.slice(1))%5===0?library.oak:library.pine);
        const asset=model.clone(true);
        const size=r.type==='rock'?r.radius/.70:r.radius/.38;
        asset.scale.setScalar(size*(r.type==='rock'?.95:.90));
        asset.traverse(n=>{
          if(n.isMesh){n.castShadow=false;n.receiveShadow=false;n.frustumCulled=true;}
        });
        // Retain original v0.14 meshes as low-effects / loading fallbacks.
        const original=r.group.children.slice();
        r.group.add(asset);entries.push({r,original,asset});
      }
      ready=true;refresh();
    }catch(err){failed=true;console.warn('Bundled GLB artwork unavailable; retaining legacy trees and rocks.',err);}
  }
  async function loadTextures(){
    const tl=new THREE.TextureLoader();
    const maps=[['assets/forest-ground.webp',grassMat,38,38],
      ['assets/stone-path.webp',pathMat,1,1],
      ['assets/timber-planks.webp',timber,1,1],
      ['assets/timber-planks.webp',timberDark,1,1]];
    const cache=new Map();
    for(const [url,material,x,y] of maps){
      try{
        if(!cache.has(url))cache.set(url,tl.loadAsync('./'+url+'?v=015'));
        const img=await cache.get(url);
        const t=img.clone();t.wrapS=t.wrapT=THREE.RepeatWrapping;
        t.repeat.set(x,y);t.colorSpace=THREE.SRGBColorSpace;
        t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
        t.needsUpdate=true;material.map=t;material.needsUpdate=true;
      }catch(err){console.warn('Optional texture missing; original material retained.',url);}
    }
  }
  return {start,loadTextures,setLow(on){low=!!on;refresh();},refresh,get ready(){return ready},get failed(){return failed},get modelCount(){return entries.length}};
}
