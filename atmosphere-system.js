// Wilderness v0.10 — lightweight, deterministic atmosphere and optional sound.
// No audio/media assets or network requests. Browser audio only after a user gesture.
export const DAY_SECONDS=720;
export const DEFAULT_ELAPSED=270; // first session begins at 09:00.
export function normalizeAtmosphere(a){
  if(a==null)return {elapsed:DEFAULT_ELAPSED};
  if(!a||typeof a!=='object'||Array.isArray(a)||typeof a.elapsed!=='number'||!Number.isFinite(a.elapsed)||a.elapsed<0||a.elapsed>100000000)throw Error('Invalid atmosphere state.');
  return {elapsed:a.elapsed};
}
export function timeOfDay(seconds){
  const elapsed=Math.max(0,seconds);
  const day=Math.floor(elapsed/DAY_SECONDS)+1;
  const hour=(elapsed%DAY_SECONDS)/DAY_SECONDS*24;
  const h=Math.floor(hour),m=Math.floor(hour%1*60);
  const sun=Math.sin((hour-6)/24*Math.PI*2);
  const daylight=Math.max(0,sun);
  const twilight=Math.max(0,1-Math.abs(sun))*((hour>=16&&hour<=22)?1:.35);
  return {day,hour,label:`Day ${day} · ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`,
    daylight,twilight,light:0.46+0.54*daylight,night:hour>=20||hour<5};
}
export class SoundFx {
  constructor(){this.ctx=null;this.enabled=true;this.last={};}
  unlock(){
    if(!this.enabled)return;
    const Context=globalThis.AudioContext||globalThis.webkitAudioContext;
    if(!Context)return;
    try{if(!this.ctx)this.ctx=new Context();if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});}catch(e){this.ctx=null;}
  }
  setEnabled(value){this.enabled=!!value;if(!this.enabled&&this.ctx?.state==='running')this.ctx.suspend().catch(()=>{});}
  play(kind){
    if(!this.enabled||!this.ctx||this.ctx.state!=='running')return;
    const now=this.ctx.currentTime,prev=this.last[kind]??-10;
    const minimum=kind==='step'?.19:.07;if(now-prev<minimum)return;this.last[kind]=now;
    const spec={step:[108,.025,.027,'triangle'],wood:[230,.060,.050,'triangle'],stone:[470,.043,.036,'triangle'],place:[310,.082,.055,'sine'],attack:[155,.070,.05,'sawtooth'],hit:[110,.11,.07,'triangle'],treasure:[610,.18,.045,'sine'],rest:[450,.16,.035,'sine'],bird:[1020,.14,.013,'sine']}[kind];
    if(!spec)return;
    try{
      const [freq,duration,volume,shape]=spec,osc=this.ctx.createOscillator(),gain=this.ctx.createGain();
      osc.type=shape;osc.frequency.setValueAtTime(freq,now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(45,freq*.69),now+duration);
      gain.gain.setValueAtTime(.0001,now);
      gain.gain.exponentialRampToValueAtTime(volume,now+.008);
      gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
      osc.connect(gain);gain.connect(this.ctx.destination);osc.start(now);osc.stop(now+duration+.015);
      osc.onended=()=>{osc.disconnect();gain.disconnect();};
    }catch(e){} // WebAudio failure must never block gameplay.
  }
}
