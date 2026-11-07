// Wilderness v0.24.1 — account or explicit local-only guest access.
import {isGuestMode,setPlayMode} from './session-mode.js?v=0.24.3';
export function profileAccess(s){
  return s?.mode==='guest'||!!s?.userId&&!!s.hasProfile&&s.mode==='ready';
}
export function profileStatus(s){
  if(s?.mode==='guest')return 'Guest mode: your world saves on this device only. No account needed.';
  if(!s||s.mode==='setup'||s.mode==='auth')return 'Sign in to sync your account world, or play as a guest without signing up.';
  if(s.mode==='loading')return 'Checking your account and synchronizing your saved world…';
  if(s.userId&&!s.hasProfile)return 'One last step: choose a survivor name for your existing account.';
  if(s.mode==='invalid')return 'Your cloud save failed validation. Gameplay is paused to protect it. You can still start a separate guest world.';
  if(s.mode==='offline')return 'Account cloud is unavailable. You can play a separate guest world without signing in.';
  return 'Sign in, create an account, or play as a guest.';
}
export function mountProfileGate({win=window,doc=document}={}){
 const gate=doc.getElementById('profileGate'),status=doc.getElementById('profileGateStatus'),action=doc.getElementById('profileGateAction'),guestBtn=doc.getElementById('profileGateGuest');
 if(!gate||!status||!action||!guestBtn)throw Error('Profile gate elements are missing');
 function update(s){
   const state=isGuestMode()?{mode:'guest'}:s;
   const allowed=profileAccess(state);
   win.__wildernessProfileAllowed=allowed;
   gate.hidden=allowed;
   status.textContent=profileStatus(state);
   guestBtn.hidden=isGuestMode();
   action.textContent=state?.userId&&!state.hasProfile?'Set survivor name':
     state?.mode==='invalid'?'Cloud recovery information':state?.mode==='offline'?'Reconnect cloud':'Create a profile / Sign in';
   action.disabled=state?.mode==='loading';
   win.dispatchEvent(new CustomEvent('wilderness:profile-gate',{detail:{allowed}}));
 }
 guestBtn.addEventListener('click',()=>{
   try{
     if(!setPlayMode('guest'))throw Error('Browser storage refused the mode change');
     // Reload before loading a guest world: account and guest memory cannot mix.
     win.location.reload();
   }catch(e){status.textContent='Guest mode needs browser storage. Check Safari privacy settings and try again.';}
 });
 action.addEventListener('click',()=>{
   win.__wildernessCloudPanel?.open();
   if(win.__wildernessAuthState?.mode==='offline')win.__wildernessCloudPanel?.inspectRemote();
 });
 win.addEventListener('wilderness:account-state',e=>update(e.detail));
 update(isGuestMode()?{mode:'guest'}:win.__wildernessAuthState||null);
 return {update,isAllowed:()=>!!win.__wildernessProfileAllowed};
}
