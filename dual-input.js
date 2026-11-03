// Wilderness v0.15: multi-pointer state, independent of rendering or browser APIs.
// Each pointer id can own only one control, but several simultaneous ids are allowed.
export class DualInput {
  constructor(){this.active=new Map();}
  begin(id,control){
    if(this.active.has(id)||!Number.isSafeInteger(id)||typeof control!=='string')return false;
    if(control==='move'&&this.isHeld('move'))return false;
    this.active.set(id,control);return true;
  }
  finish(id){const control=this.active.get(id)||null;this.active.delete(id);return control;}
  isHeld(control){return [...this.active.values()].includes(control);}
  clear(){this.active.clear();}
  get count(){return this.active.size;}
}
// Touch and pen actions start immediately on pointerdown. Mouse / accessibility
// actions retain normal click. Suppress the synthetic click after pointerdown.
export function bindSimultaneousAction(element,action,mux=null,control="action"){
  let ignoreClickUntil=0;
  element.style.touchAction='none';
  element.addEventListener('pointerdown',e=>{
    if(e.pointerType!=='touch'&&e.pointerType!=='pen')return;
    e.preventDefault();e.stopPropagation();
    if(mux&&!mux.begin(e.pointerId,control))return;
    try{element.setPointerCapture(e.pointerId);}catch(_){}
    ignoreClickUntil=Date.now()+650;
    action();
  },{passive:false});
  for(const ev of ['pointerup','pointercancel','lostpointercapture'])
    element.addEventListener(ev,e=>{if(mux)mux.finish(e.pointerId);});
  element.addEventListener('click',e=>{
    if(Date.now()<ignoreClickUntil){e.preventDefault();return;}
    action();
  });
}
