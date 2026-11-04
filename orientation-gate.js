// Wilderness v0.23.2: strict landscape-only gameplay interface.
// Mobile Safari cannot reliably rotate a phone or honor ScreenOrientation.lock().
// Instead show a portrait gate, stop the active simulation, and release held controls.
export function portraitViewport(width, height) {
  return Number.isFinite(width) && Number.isFinite(height) && width < height;
}
export function mountLandscapeGate({win=window,doc=document,onLock=()=>{}}={}) {
  const dialog=doc.getElementById('portraitGate');
  if(!dialog) throw new Error('Missing #portraitGate for landscape-only mode');
  const media=typeof win.matchMedia==='function'?win.matchMedia('(orientation: portrait)'):null;
  let blocked=null;
  function blockedNow() {
    // Browser media query is the authority on orientation; viewport is fallback.
    return media ? media.matches : portraitViewport(win.innerWidth,win.innerHeight);
  }
  function sync() {
    const next=blockedNow();
    dialog.hidden=!next;
    dialog.setAttribute('aria-hidden',next?'false':'true');
    doc.documentElement.classList.toggle('portrait-game-locked',next);
    if(next && blocked!==true) onLock();
    blocked=next;
    return next;
  }
  const onOrientation=()=>{
    sync();
    // Some iOS Safari releases update their viewport after orientationchange.
    if(typeof win.requestAnimationFrame==='function')win.requestAnimationFrame(sync);
  };
  win.addEventListener('resize',sync);
  win.addEventListener('orientationchange',onOrientation);
  doc.addEventListener('visibilitychange',sync);
  if(media){
    if(typeof media.addEventListener==='function')media.addEventListener('change',sync);
    else if(typeof media.addListener==='function')media.addListener(sync);
  }
  sync();
  return {isBlocked:()=>blockedNow(),sync};
}
