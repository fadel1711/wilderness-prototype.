// v0.23.6 — Account/profile required before gameplay, auto session resume.
export function profileAccess(s){return !!s?.userId&&!!s.hasProfile&&(s.mode==='ready'||s.mode==='offline'&&s.offlineTrusted===true);}
export function profileStatus(s){
 if(!s||s.mode==='setup'||s.mode==='auth')return 'Create a profile or sign in to begin. Your Wilderness account carries your world between devices.';
 if(s.mode==='loading')return 'Checking your account and synchronizing your saved world…';
 if(s.userId&&!s.hasProfile)return 'One last step: choose a survivor name for your existing account.';
 if(['conflict','empty','cloud-only','invalid'].includes(s.mode))return 'Your worlds need a one-time safety decision before gameplay. Open the account panel to resolve it.';
 if(s.mode==='offline')return s.offlineTrusted?'Signed-in offline world available.':'Connection unavailable. Sign in online once on this device to unlock offline access.';
 return 'Please sign in to continue.';
}
export function mountProfileGate({win=window,doc=document}={}){
 const gate=doc.getElementById('profileGate'),status=doc.getElementById('profileGateStatus'),action=doc.getElementById('profileGateAction');
 if(!gate||!status||!action)throw Error('Profile gate elements are missing');
 function update(s){
   const allowed=profileAccess(s);
   win.__wildernessProfileAllowed=allowed;
   gate.hidden=allowed;
   status.textContent=profileStatus(s);
   action.textContent=s?.userId&&!s.hasProfile?'Set survivor name':
     ['conflict','empty','cloud-only','invalid'].includes(s?.mode)?'Resolve world choice':'Create a profile / Sign in';
   action.disabled=s?.mode==='loading';
   win.dispatchEvent(new CustomEvent('wilderness:profile-gate',{detail:{allowed}}));
 }
 action.addEventListener('click',()=>win.__wildernessCloudPanel?.open());
 win.addEventListener('wilderness:account-state',e=>update(e.detail));
 update(win.__wildernessAuthState||null);
 return {update,isAllowed:()=>!!win.__wildernessProfileAllowed};
}
