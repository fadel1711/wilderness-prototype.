// v0.24.5.1: Native viewport, native pointers. No artificial 90-degree rotation.
// iOS home-screen apps cannot be reliably forced to landscape by JavaScript.
export function portraitViewport(width,height){return Number.isFinite(width)&&Number.isFinite(height)&&width<height;}
export function landscapeViewport(win=window){
  return {width:Math.max(1,win.innerWidth),height:Math.max(1,win.innerHeight),sideways:false};
}
export function landscapePoint(clientX,clientY){return {x:clientX,y:clientY};}
export function mountLandscapeGate({win=window,doc=document,onLock=()=>{}}={}){
  const dialog=doc.getElementById('portraitGate');
  let portrait=null;
  function sync(){
    const next=portraitViewport(win.innerWidth,win.innerHeight);
    // Turn off the old fallback that forced the entire application sideways.
    doc.documentElement.classList.remove('sideways-game');
    doc.documentElement.classList.toggle('portrait-native',next);
    if(dialog){dialog.hidden=true;dialog.setAttribute('aria-hidden','true');}
    if(next!==portrait){portrait=next;onLock();}
    return false;
  }
  win.addEventListener('resize',sync);
  win.addEventListener('orientationchange',()=>{sync();win.requestAnimationFrame?.(sync);});
  doc.addEventListener('visibilitychange',sync);
  sync();
  return {isBlocked:()=>false,isSideways:()=>false,viewport:()=>landscapeViewport(win),point:(x,y)=>landscapePoint(x,y,win),sync};
}
