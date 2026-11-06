// Wilderness v0.23.6 - landscape-first display, portrait-locked Safari visual fallback.
export function portraitViewport(width,height){return Number.isFinite(width)&&Number.isFinite(height)&&width<height;}
export function landscapeViewport(win=window){
 const sideways=portraitViewport(win.innerWidth,win.innerHeight);
 return {width:sideways?win.innerHeight:win.innerWidth,height:sideways?win.innerWidth:win.innerHeight,sideways};
}
export function landscapePoint(clientX,clientY,win=window){
 return portraitViewport(win.innerWidth,win.innerHeight)?{x:clientY,y:win.innerWidth-clientX}:{x:clientX,y:clientY};
}
export function mountLandscapeGate({win=window,doc=document,onLock=()=>{}}={}){
 const dialog=doc.getElementById('portraitGate');
 if(!dialog)throw Error('Missing legacy portrait gate');
 let sideways=null;
 function sync(){
   const next=portraitViewport(win.innerWidth,win.innerHeight);
   doc.documentElement.classList.toggle('sideways-game',next);
   dialog.hidden=true;dialog.setAttribute('aria-hidden','true');
   if(next!==sideways){onLock();sideways=next;}
   return false; // The game renders sideways in portrait; never block play solely for orientation.
 }
 win.addEventListener('resize',sync);win.addEventListener('orientationchange',()=>{
   sync();if(win.requestAnimationFrame)win.requestAnimationFrame(sync);
 });
 doc.addEventListener('visibilitychange',sync);
 sync();
 return {isBlocked:()=>false,isSideways:()=>portraitViewport(win.innerWidth,win.innerHeight),viewport:()=>landscapeViewport(win),point:(x,y)=>landscapePoint(x,y,win),sync};
}
