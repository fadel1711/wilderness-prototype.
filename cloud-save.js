// Wilderness v0.23.2 — account-first automatic sync: compare meaningful progress and protect local recovery.
// A signed-in account syncs automatically. Independent edits with a known baseline and corrupt saves remain protected.
import {CLOUD_URL,CLOUD_PUBLISHABLE_KEY} from './cloud-config.js?v=0.24.2';
import {SAVE_KEY,normalizeSave} from './save-system.js?v=0.24.2';
import {cloudAutoDecision} from './cloud-policy.js?v=0.24.2';
export const CLOUD_META_KEY='wilderness_v019_cloud_baseline'; // keep the existing accepted account baseline
const el=id=>document.getElementById(id);
const encodeWorld=value=>JSON.stringify(normalizeSave(value));
// Non-cryptographic change detector only; Postgres revision-CAS is the overwrite protection.
export function worldFingerprint(value){
  const str=typeof value==='string'?value:JSON.stringify(value);
  let h1=2166136261,h2=0x85ebca6b;
  for(let i=0;i<str.length;i++){h1=Math.imul(h1^str.charCodeAt(i),16777619);h2=Math.imul(h2^str.charCodeAt(i),2246822519);}
  return str.length+':'+(h1>>>0).toString(16)+':'+(h2>>>0).toString(16);
}
// Ambient clock, walking position, hunger drain and campfire burn-down are
// not independent game progress. These differences must not create spurious
// "pick a device" prompts when the account world has advanced elsewhere.
export function progressFingerprint(value,{legacy=false,legacyVersion=null}={}){
  const s=normalizeSave(value);
  s.px=0;s.pz=0;s.py=0;
  if(s.atmosphere)s.atmosphere.elapsed=0;
  // Newly generated outer-region trees/rocks do not count as independent edits.
  for(const [id,hits] of Object.entries(s.resources||{})){
    if(/^et\d+$/.test(id)&&hits===3||/^er\d+$/.test(id)&&hits===2)delete s.resources[id];
  }
  if(s.survival){s.survival.hunger=0;s.survival.thirst=0;s.survival.energy=0;}
  if(s.combat){s.combat.hp=0;s.combat.stamina=0;}
  for(const fire of Object.values(s.campfires||{}))fire.fuel=0;
  if(s.torches){s.torches.hand.fuel=0;for(const t of Object.values(s.torches.stands))t.fuel=0;}
  if(legacy){delete s.deepCave;delete s.py;s.version=18;}
  if(legacyVersion===19){delete s.py;s.version=19;}
  return worldFingerprint(s);
}
// Account-first behavior, without sacrificing a device's independent unsynced work.
// "freshDevice" is captured BEFORE the game creates its first local save.
export function cloudDecision(local,remote,baseline,userId,{freshDevice=false}={}){
  if(!remote){
    if(local==null)return 'invalid';
    // A world last synced under another account must not be uploaded there automatically.
    if(baseline?.userId&&baseline.userId!==userId&&!freshDevice)return 'empty';
    return 'upload';
  }
  if(local==null)return 'cloud-only'; // Possible corrupt local save: require review.
  // An unrelated account must never silently reuse or overwrite this device's progress.
  if(baseline?.userId&&baseline.userId!==userId)return 'conflict';
  const localHash=worldFingerprint(local),remoteHash=worldFingerprint(remote.save);
  if(localHash===remoteHash)return 'same';
  // Key fix: two worlds can have the same actual progress even without a
  // v0.19.1 baseline. The camera/player position, clock and need meters change
  // all the time and must never trigger a world-choice screen.
  if(progressFingerprint(local)===progressFingerprint(remote.save))return 'same'; // Same meaningful world; no unnecessary reload or cloud/device prompt.
  // Different accounts must not silently copy or overwrite each other's progress.
  if(baseline?.userId&&baseline.userId!==userId)return 'conflict';
  if(baseline?.userId===userId){
    const previousFormat=Number(remote.save?.version)<20;
    const unchanged=(w,h)=>baseline.hash===h||!!baseline.progressHash&&
      (baseline.progressHash===progressFingerprint(w)||
       (previousFormat&&(baseline.progressHash===progressFingerprint(w,{legacy:true})||
        baseline.progressHash===progressFingerprint(w,{legacyVersion:19}))));
    // Never discard newly mined ore progress when comparing against a pre-v0.21 baseline.
    const noNewCaveProgress=Object.keys(normalizeSave(local).deepCave?.veins||{}).length===0;
    const noNewLoftProgress=!normalizeSave(local).builds.some(b=>b.type.startsWith('loft_')); 
    const localUnchanged=unchanged(local,localHash)&&(!previousFormat||((Number(remote.save?.version)!==18||noNewCaveProgress)&&noNewLoftProgress));
    const remoteUnchanged=baseline.revision===remote.revision&&unchanged(remote.save,remoteHash);
    if(localUnchanged&&!remoteUnchanged)return 'restore';
    if(remoteUnchanged&&!localUnchanged)return 'upload';
    if(localUnchanged&&remoteUnchanged)return 'restore';
    // An old v0.19 baseline lacks progressHash. It cannot distinguish ordinary
    // movement from independent offline edits. Restore the account world, keeping
    // an undoable local recovery copy rather than falsely presenting a conflict.
    if(!baseline.progressHash)return 'restore';
    return 'conflict'; // Independently edited offline copies: do not lose either one.
  }
  // Signing into an established account from a browser without cloud metadata
  // should load that account's world. The replaced local copy is preserved by
  // __wildernessCloudReplace in the local recovery slot before reload.
  return 'restore';
}
const message=e=>String(e?.message||e||'Unknown cloud error').slice(0,260);
function safeMetaRead(){try{return JSON.parse(localStorage.getItem(CLOUD_META_KEY)||'null');}catch(e){return null;}}
function configured(url,key){
  return /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(String(url).trim()) &&
    /^(sb_publishable_[\w-]+|eyJ[\w.-]+)$/.test(String(key).trim());
}
export function mountCloudSave({createClientOverride=null,configOverride=null}={}){
  const url=configOverride?.url??CLOUD_URL,key=configOverride?.key??CLOUD_PUBLISHABLE_KEY;
  const required=['cloudPanel','cloudClose','cloudStatus','cloudSetup','cloudAuth','cloudSigned','cloudChoices','cloudConflictText','cloudDisplayName','cloudProfileEditor','cloudProfileName','cloudSetProfile','cloudEmail','cloudPassword','cloudLogin','cloudSignup','cloudUserEmail','cloudDetails','cloudKeepLocal','cloudUseRemote','cloudSyncNow','cloudRetry','cloudSignout'];
  if(required.some(id=>!el(id)))throw Error('Cloud Save panel incomplete: check index.html and cloud-save.js');
  let client=null,user=null,remote=null,revision=0,mode='setup',busy=false,loading=false,lastSync=0,scheduled=null;
  let generation=0,loginPending=false;
  const status=(text)=>{
    el('cloudStatus').textContent=text;
    const pill=el('cloudPill');if(pill){
      pill.textContent=mode==='ready'?busy?'☁ Saving…':'☁ Cloud live':mode==='offline'?'☁ Reconnect':mode==='invalid'?'☁ Save protected':mode==='auth'?'☁ Sign in':'☁ Connecting…';
      pill.title=text;
    }
  };
  const nameValid=name=>typeof name==='string'&&name.trim().length>=2&&name.trim().length<=24&&/^[\p{L}\p{N} _.'-]+$/u.test(name.trim());
  function notifyProfile(){
    const displayName=String(user?.user_metadata?.display_name||'').trim();
    const offlineTrusted=false; // Cloud-confirmed session required to play.
    const detail={mode,userId:user?.id||null,displayName,hasProfile:nameValid(displayName),offlineTrusted};
    window.__wildernessAuthState=detail;
    window.dispatchEvent(new CustomEvent('wilderness:account-state',{detail}));
  }
  function render(){
    el('cloudSetup').hidden=mode==='auth'||!!user;
    el('cloudAuth').hidden=mode!=='auth'||!!user;
    el('cloudSigned').hidden=!user;
    el('cloudProfileEditor').hidden=!user||nameValid(String(user?.user_metadata?.display_name||''));
    el('cloudChoices').hidden=true; // Cloud is authoritative; no device-vs-cloud picker.
    el('cloudKeepLocal').disabled=busy||!getWorld();
    el('cloudUseRemote').disabled=busy||!remote||mode==='invalid';
    el('cloudSyncNow').disabled=busy||mode!=='ready';
    el('cloudRetry').hidden=!(user&&['offline','invalid'].includes(mode));
    if(user)el('cloudUserEmail').textContent=user.email||'Wilderness player';
    el('cloudDetails').textContent=mode==='ready'?`☁ Automatic sync on · Cloud revision ${revision}. Your account follows you between devices.`:
      mode==='empty'?'This account has no cloud world, but the device belongs to a different account. Choose carefully before copying it.':
      mode==='cloud-only'?'Your local save cannot be read. You can restore the existing cloud world after reviewing the warning.':
      mode==='conflict'?'Different unsynced changes exist on this device and cloud. Choose once which world to keep.':
      mode==='invalid'?'The cloud copy failed validation. It has not been applied to your device.':
      '☁ Waiting for a confirmed cloud connection. Local data is a recovery cache only.';
    el('cloudConflictText').textContent=mode==='empty'?'This device previously synced with a different account. Upload it only if you really want to copy this world into your new account.':
      mode==='cloud-only'?'This device has no valid local world. Loading the cloud world will create a local recovery snapshot when possible.':
      mode==='invalid'?'Cloud data is damaged or from an unsupported version. You may upload a valid local world to replace it, but first export a JSON backup.':
      'Both copies have independent progress. Choose the correct one; the local world is backed up before a cloud restore. Normally this question will never appear.';
    notifyProfile();
    const pill=el('cloudPill');if(pill)pill.textContent=mode==='ready'?'☁ Cloud live':mode==='offline'?'☁ Reconnect':mode==='invalid'?'☁ Save protected':mode==='auth'?'☁ Sign in':'☁ Connecting…';
  }
  function getWorld(){try{
    if(window.__wildernessCloudSnapshot)return window.__wildernessCloudSnapshot()||null;
    const raw=localStorage.getItem(SAVE_KEY);return raw?normalizeSave(JSON.parse(raw)):null;
  }catch(e){return null;}}
  async function waitForGame(){for(let i=0;i<70&&!window.__gameReady;i++)await new Promise(r=>setTimeout(r,100));}
  function baselineWrite(world,rev){
    try{localStorage.setItem(CLOUD_META_KEY,JSON.stringify({userId:user.id,revision:rev,hash:worldFingerprint(world),progressHash:progressFingerprint(world)}));}
    catch(e){/* Failure simply means a manual choice may be required next login. */}
  }
  function cancelSchedule(){if(scheduled!==null){clearTimeout(scheduled);scheduled=null;}}
  function resetAccount(){generation++;cancelSchedule();user=null;remote=null;revision=0;busy=false;mode=client?'auth':'setup';render();status(client?'Signed out. Your cloud world remains protected.':'Cloud service not configured. Sign in requires cloud access.');}
  async function fetchRemote(){
    const {data,error}=await client.from('wilderness_worlds').select('save,revision,updated_at').eq('user_id',user.id).maybeSingle();
    if(error)throw error;
    return data;
  }
  async function inspectRemote(){
    if(!client||!user)return;
    const ticket=++generation, owner=user.id;
    mode='loading';render();status('Checking your cloud backup…');
    try{
      const row=await fetchRemote();
      await waitForGame();
      if(ticket!==generation||user?.id!==owner)return;
      remote=row?{save:row.save,revision:Number(row.revision),updated_at:row.updated_at}:null;
      revision=remote?.revision||0;
      let validRemote=remote;
      if(remote){
        try{validRemote={...remote,save:normalizeSave(remote.save)};}
        catch(e){mode='invalid';render();status('The cloud save is invalid. Your device has not been changed.');return;}
      }
      const local=getWorld(),baseline=safeMetaRead();
      let importRequest=null;try{importRequest=JSON.parse(localStorage.getItem('wilderness_pending_cloud_import')||'null');}catch(e){}
      const choice=cloudAutoDecision(local,validRemote,baseline,owner,{freshDevice:!!window.__wildernessCloudDeviceFresh,explicitImport:importRequest,worldFingerprint,progressFingerprint});
      // The import marker is single-use. Any rejected upload is preserved locally.
      if(importRequest&&choice!=='upload')try{localStorage.removeItem('wilderness_pending_cloud_import');}catch(e){}
      if(choice==='same'){
        mode='ready';baselineWrite(validRemote.save,revision);
        status('☁ Connected. Your account world syncs automatically.');render();return;
      }
      if(choice==='upload'){
        mode='loading';render();status('☁ Automatically backing up this device to your account…');
        await writeWorld(local,revision);
        try{localStorage.removeItem('wilderness_pending_cloud_import');}catch(e){}
        return;
      }
      if(choice==='restore'){
        mode='loading';render();status('☁ Loading your account world; previous device world will be kept for recovery…');
        let previousBaseline=null;
        try{
          if(typeof window.__wildernessCloudReplace!=='function')throw Error('Game restore is not ready');
          previousBaseline=localStorage.getItem(CLOUD_META_KEY);
          // Persist sync baseline BEFORE the game reloads the page.
          baselineWrite(validRemote.save,revision);
          window.__wildernessCloudReplace(validRemote.save);
        }catch(e){
          try{if(previousBaseline===null)localStorage.removeItem(CLOUD_META_KEY);
            else localStorage.setItem(CLOUD_META_KEY,previousBaseline);}catch(_){}
          mode='offline';render();status('Automatic restore stopped safely: '+message(e));
        }
        return;
      }
      if(choice==='fresh'){
        status('Creating a new world for this account; previous device world is kept as a recovery copy…');
        if(typeof window.__wildernessCloudStartFresh==='function')window.__wildernessCloudStartFresh();
        else {mode='offline';render();status('Cannot safely start new account world: game recovery hook missing.');}
        return;
      }
      // Unexpected corrupt local data: fail closed. Never erase the cloud.
      mode='invalid';render();
      status('⚠ Cloud world could not be recovered safely; no save was overwritten.');
    }catch(e){if(ticket!==generation)return;mode='offline';render();status('Cloud unavailable: '+message(e)+'. Your local world remains safe.');}
  }
  async function onSession(session){
    if(!session?.user){resetAccount();return;}
    if(user?.id===session.user.id&&['loading','ready'].includes(mode))return;
    user=session.user;mode='loading';render();await inspectRemote();
  }
  async function submitAuth(isSignup){
    if(!client||loginPending)return;
    const email=el('cloudEmail').value.trim(),password=el('cloudPassword').value,name=el('cloudDisplayName').value.trim();
    if(isSignup&&!nameValid(name)){status('Choose a survivor name of 2–24 letters/numbers (spaces allowed).');return;}
    if(!/^\S+@\S+\.\S+$/.test(email)||password.length<8){status('Enter a valid email and password of at least 8 characters.');return;}
    loginPending=true;el('cloudLogin').disabled=el('cloudSignup').disabled=true;
    status(isSignup?'Creating a Wilderness account…':'Signing in…');
    try{
      const response=isSignup?await client.auth.signUp({email,password,options:{data:{display_name:name}}}):await client.auth.signInWithPassword({email,password});
      if(response.error)throw response.error;
      el('cloudPassword').value='';
      if(response.data?.session?.user)await onSession(response.data.session);
      else status('Account request sent. Check your email for a confirmation link, then sign in.');
    }catch(e){status('Account error: '+message(e));}
    finally{loginPending=false;el('cloudLogin').disabled=el('cloudSignup').disabled=false;}
  }
  async function setProfileName(){
    if(!client||!user)return;
    const name=el('cloudProfileName').value.trim();
    if(!nameValid(name)){status('Choose a name of 2–24 letters/numbers.');return;}
    el('cloudSetProfile').disabled=true;status('Saving your survivor profile…');
    try{
      const {data,error}=await client.auth.updateUser({data:{display_name:name}});
      if(error)throw error;
      user=data?.user||{...user,user_metadata:{...user.user_metadata,display_name:name}};
      render();status('Survivor profile saved. Your account is ready.');
    }catch(e){status('Profile could not be updated: '+message(e));}
    finally{el('cloudSetProfile').disabled=false;}
  }
  async function writeWorld(world,expectedRev){
    const payload=normalizeSave(world);const owner=user?.id;
    const {data,error}=await client.rpc('wilderness_save_world',{p_expected_revision:expectedRev,p_save:payload});
    if(error)throw error;
    if(!data||!data[0]||!Number.isSafeInteger(Number(data[0].new_revision))){
      const error=new Error('Newer cloud revision detected');error.code='REVISION_CHANGED';throw error;
    }
    if(!user||user.id!==owner)throw Error('Account changed during sync; reload and sign in again.');
    remote={save:payload,revision:Number(data[0].new_revision),updated_at:data[0].saved_at};
    revision=remote.revision;lastSync=Date.now();baselineWrite(payload,revision);
    mode='ready';render();status(`☁ World backed up successfully (revision ${revision}).`);
    return true;
  }
  // Legacy manual world-choice buttons are intentionally disabled in cloud-only mode.
  function uploadDevice(){}
  function applyCloud(){}
  function scheduleSync(){
    if(mode!=='ready'||!client||!user||busy||scheduled!==null)return;
    const wait=Math.max(900,2200-(Date.now()-lastSync));
    scheduled=setTimeout(()=>{scheduled=null;syncNow();},wait);
  }
  async function syncNow(){
    cancelSchedule();
    if(!client||!user||mode!=='ready'||busy)return;
    const local=getWorld();if(!local){mode='invalid';render();status('Local save is unreadable. Cloud was not overwritten; reconnect after restoring a valid backup.');return;}
    let raw;try{raw=encodeWorld(local);}catch(e){mode='invalid';render();status('Local world failed validation. Cloud is protected; restore a valid backup.');return;}
    if(typeof navigator!=='undefined'&&!navigator.onLine){mode='offline';render();status('Offline — reconnect to continue. Pending progress is protected locally.');return;}
    if(remote&&worldFingerprint(raw)===worldFingerprint(encodeWorld(remote.save))){status(`☁ Cloud is up to date (revision ${revision}).`);return;}
    if(typeof navigator!=='undefined'&&!navigator.onLine){mode='offline';render();status('Offline — reconnect to continue. Pending progress is protected locally.');return;}
    busy=true;render();status('Saving the latest local progress to cloud…');
    try{await writeWorld(local,revision);}
    catch(e){
      status('Cloud sync interrupted: '+message(e)+'. Pending copy is protected; reconnecting…');
      if(e?.code==='REVISION_CHANGED'){
        mode='loading';render();await inspectRemote();
      }else{
        mode='offline';render();
      }
    }
    finally{busy=false;render();}
  }
  function open(){el('cloudPanel').classList.add('show');render();}
  function close(){el('cloudPanel').classList.remove('show');}
  el('cloudClose').addEventListener('click',close);
  el('cloudLogin').addEventListener('click',()=>submitAuth(false));
  el('cloudSignup').addEventListener('click',()=>submitAuth(true));
  el('cloudSetProfile').addEventListener('click',setProfileName);
  el('cloudKeepLocal').addEventListener('click',uploadDevice);
  el('cloudUseRemote').addEventListener('click',applyCloud);
  el('cloudSyncNow').addEventListener('click',syncNow);
  el('cloudRetry').addEventListener('click',()=>{if(user)inspectRemote();});
  el('cloudSignout').addEventListener('click',async()=>{if(!client)return;cancelSchedule();try{await client.auth.signOut();resetAccount();}catch(e){status('Sign-out error: '+message(e));}});
  window.addEventListener('wilderness:local-save',scheduleSync);
  window.addEventListener('online',()=>{if(mode==='ready')scheduleSync();else if(user)inspectRemote();});
  window.addEventListener('offline',()=>{if(user){cancelSchedule();mode='offline';render();status('Internet unavailable. Gameplay paused; local recovery cache kept intact.');}});
  document.addEventListener('visibilitychange',()=>{if(mode==='ready'){if(document.hidden)syncNow();else scheduleSync();}else if(!document.hidden&&user)inspectRemote();});
  const controller={open,close,inspectRemote,syncNow};window.__wildernessCloudPanel=controller;
  if(!configured(url,key)){
    mode='setup';render();status('Cloud Save needs a dedicated Supabase project. Sign-in is required before gameplay.');
    return controller;
  }
  mode='setup';render();status('Connecting to Wilderness Cloud…');
  (async()=>{
    try{
      const {createClient}=createClientOverride?{createClient:createClientOverride}:await import('https://esm.sh/@supabase/supabase-js@2.118.0?bundle');
      client=createClient(String(url).trim(),String(key).trim(),{
        auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true},
        global:{headers:{'X-Client-Info':'wilderness-v0.24.2'}}
      });
      mode='auth';render();status('Cloud is available. Sign in or create your Wilderness account.');
      const {data,error}=await client.auth.getSession();
      if(error)throw error;
      if(data?.session?.user)await onSession(data.session);
      client.auth.onAuthStateChange((event,session)=>{
        // Defer other Supabase calls outside of the auth callback.
        if(event==='SIGNED_OUT'||event==='SIGNED_IN'||event==='INITIAL_SESSION'||event==='USER_UPDATED')setTimeout(()=>onSession(session),0);
      });
    }catch(e){mode='setup';render();status('Cloud connection could not start: '+message(e)+'. A profile is required to play.');}
  })();
  return controller;
}
