// Wilderness v0.22: safe, renderer-independent pointer interruption logic.
// Safari may omit pointerup after an app switch, menu gesture or OS interruption.
export class InputRecovery{
  constructor(onRelease){this.active=new Map();this.onRelease=onRelease;this.resetCount=0;}
  start(kind,id){
    if(!Number.isSafeInteger(id)||typeof kind!=='string')return false;
    if(this.active.has(kind))return false;
    this.active.set(kind,id);return true;
  }
  owns(kind,id){return this.active.get(kind)===id;}
  finish(id){
    const released=[];
    for(const [kind,owner] of this.active)if(owner===id){this.active.delete(kind);released.push(kind);}
    for(const kind of released)this.onRelease(kind);
    return released;
  }
  reset(){
    const kinds=[...this.active.keys()];this.active.clear();
    for(const kind of kinds)this.onRelease(kind);
    this.resetCount++;
  }
  get count(){return this.active.size;}
}
export function installInputRecovery(recovery,{target=window,doc=document,onGlobalReset=()=>{}}={}){
  const cancelEvent=e=>recovery.finish(e.pointerId);
  // Capture phase: run even when controls or browser overlays swallow bubbling.
  target.addEventListener('pointerup',cancelEvent,true);
  target.addEventListener('pointercancel',cancelEvent,true);
  const reset=()=>{recovery.reset();onGlobalReset();};
  target.addEventListener('blur',reset);
  target.addEventListener('pagehide',reset);
  target.addEventListener('orientationchange',reset);
  doc.addEventListener('visibilitychange',()=>{if(doc.visibilityState!=='visible')reset();});
  // Some iOS versions still produce touchend without a paired PointerEvent.
  doc.addEventListener('touchend',e=>{if(!e.touches.length)reset();},{passive:true});
  doc.addEventListener('touchcancel',reset,{passive:true});
  return reset;
}
