// Wilderness v0.23.2 — account-first automatic sync: compare meaningful progress and protect local recovery.
// A signed-in account syncs automatically. Independent edits with a known baseline and corrupt saves remain protected.
import {CLOUD_URL,CLOUD_PUBLISHABLE_KEY} from './cloud-config.js?v=0.23.5';
import {SAVE_KEY,normalizeSave} from './save-system.js?v=0.23.5';
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
  const required=['cloudPanel','cloudClose','cloudStatus','cloudSetup','cloudAuth','cloudSigned','cloudChoices','cloudConflictText','cloudEmail','cloudPassword','cloudLogin','cloudSignup','cloudUserEmail','cloudDetails','cloudKeepLocal','cloudUseRemote','cloudSyncNow','cloudSignout'];
  if(required.some(id=>!el(id)))throw Error('Cloud Save panel incomplete: check index.html and cloud-save.js');
  let client=null,user=null,remote=null,revision=0,mode='setup',busy=false,loading=false,lastSync=0,scheduled=null;
  let generation=0,loginPending=false;
  const status=(text)=>{el('cloudStatus').textContent=text;};
  function render(){
    el('cloudSetup').hidden=mode==='auth'||!!user;
    el('cloudAuth').hidden=mode!=='auth'||!!user;
    el('cloudSigned').hidden=!user;
    el('cloudChoices').hidden=!['empty','conflict','cloud-only','invalid'].includes(mode);
    el('cloudKeepLocal').disabled=busy||!getWorld();
    el('cloudUseRemote').disabled=busy||!remote||mode==='invalid';
    el('cloudSyncNow').disabled=busy||mode!=='ready';
    if(user)el('cloudUserEmail').textContent=user.email||'Wilderness player';
    el('cloudDetails').textContent=mode==='ready'?`☁ Automatic sync on · Cloud revision ${revision}. Your account follows you between devices.`:
      mode==='empty'?'This account has no cloud world, but the device belongs to a different account. Choose carefully before copying it.':
      mode==='cloud-only'?'Your local save cannot be read. You can restore the existing cloud world after reviewing the warning.':
      mode==='conflict'?'Different unsynced changes exist on this device and cloud. Choose once which world to keep.':
      mode==='invalid'?'The cloud copy failed validation. It has not been applied to your device.':
      'Your local world stays saved in Safari.';
    el('cloudConflictText').textContent=mode==='empty'?'This device previously synced with a different account. Upload it only if you really want to copy this world into your new account.':
      mode==='cloud-only'?'This device has no valid local world. Loading the cloud world will create a local recovery snapshot when possible.':
      mode==='invalid'?'Cloud data is damaged or from an unsupported version. You may upload a valid local world to replace it, but first export a JSON backup.':
      'Both copies have independent progress. Choose the correct one; the local world is backed up before a cloud restore. Normally this question will never appear.';
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
  function resetAccount(){generation++;cancelSchedule();user=null;remote=null;revision=0;busy=false;mode=client?'auth':'setup';render();status(client?'Signed out. Local world remains available.':'Cloud service not configured. Local saves work normally.');}
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
      const choice=cloudDecision(local,validRemote,baseline,owner,{freshDevice:!!window.__wildernessCloudDeviceFresh});
      if(choice==='same'){
        mode='ready';baselineWrite(validRemote.save,revision);
        status('☁ Connected. Your account world syncs automatically.');render();return;
      }
      if(choice==='upload'){
        mode='loading';render();status('☁ Automatically backing up this device to your account…');
        await writeWorld(local,revision);
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
      // Genuine conflict or invalid local data: do not silently discard work.
      mode=choice;render();
      status(choice==='empty'?'Different account detected. Choose whether to copy this device’s world into it.':
        choice==='cloud-only'?'Cloud found, but this device save could not be read. Restore manually after reviewing.':
        choice==='invalid'?'There is no valid local world to upload.':
        '⚠ Two unsynced worlds have different progress. Choose the one to keep.');
    }catch(e){if(ticket!==generation)return;mode='offline';render();status('Cloud unavailable: '+message(e)+'. Your local world remains safe.');}
  }
  async function onSession(session){
    if(!session?.user){resetAccount();return;}
    if(user?.id===session.user.id&&mode!=='auth'&&mode!=='setup')return;
    user=session.user;mode='loading';render();await inspectRemote();
  }
  async function submitAuth(isSignup){
    if(!client||loginPending)return;
    const email=el('cloudEmail').value.trim(),password=el('cloudPassword').value;
    if(!/^\S+@\S+\.\S+$/.test(email)||password.length<8){status('Enter a valid email and password of at least 8 characters.');return;}
    loginPending=true;el('cloudLogin').disabled=el('cloudSignup').disabled=true;
    status(isSignup?'Creating a Wilderness account…':'Signing in…');
    try{
      const response=isSignup?await client.auth.signUp({email,password}):await client.auth.signInWithPassword({email,password});
      if(response.error)throw response.error;
      el('cloudPassword').value='';
      if(response.data?.session?.user)await onSession(response.data.session);
      else status('Account request sent. Check your email for a confirmation link, then sign in.');
    }catch(e){status('Account error: '+message(e));}
    finally{loginPending=false;el('cloudLogin').disabled=el('cloudSignup').disabled=false;}
  }
  async function writeWorld(world,expectedRev){
    const payload=normalizeSave(world);const owner=user?.id;
    const {data,error}=await client.rpc('wilderness_save_world',{p_expected_revision:expectedRev,p_save:payload});
    if(error)throw error;
    if(!data||!data[0]||!Number.isSafeInteger(Number(data[0].new_revision))){
      await inspectRemote();
      throw Error('A newer cloud save exists. Choose the version you want to keep.');
    }
    if(!user||user.id!==owner)throw Error('Account changed during sync; reload and sign in again.');
    remote={save:payload,revision:Number(data[0].new_revision),updated_at:data[0].saved_at};
    revision=remote.revision;lastSync=Date.now();baselineWrite(payload,revision);
    mode='ready';render();status(`☁ World backed up successfully (revision ${revision}).`);
    return true;
  }
  async function uploadDevice(){
    if(!client||!user||busy||!['empty','conflict','cloud-only','invalid'].includes(mode))return;
    const current=getWorld();if(!current){status('Cannot upload: your local world is unreadable. You may restore the cloud copy instead.');return;}
    const prompt=remote?'Replace the cloud copy with this device’s current world? The cloud copy will be overwritten. Export a JSON backup first if unsure.':'Create the first cloud backup using this device’s current world?';
    if(!window.confirm(prompt))return;
    busy=true;cancelSchedule();render();status('Uploading your world…');
    try{await writeWorld(current,revision);}
    catch(e){status('Cloud upload not completed: '+message(e)+'. Local data is safe.');}
    finally{busy=false;render();}
  }
  function applyCloud(){
    if(!user||busy||!remote||mode==='invalid')return;
    let normalized;try{normalized=normalizeSave(remote.save);}catch(e){status('Cloud world rejected by validation.');return;}
    if(!window.confirm('Restore the cloud world to this device? Current v0.23.5 progress will be saved in a local recovery slot before reload. Export a JSON backup first if unsure.'))return;
    cancelSchedule();
    try{window.__wildernessCloudReplace(normalized);baselineWrite(normalized,revision);}
    catch(e){status('Could not restore cloud world: '+message(e));}
  }
  function scheduleSync(){
    if(mode!=='ready'||!client||!user||busy||scheduled!==null)return;
    const wait=Math.max(2500,10000-(Date.now()-lastSync));
    scheduled=setTimeout(()=>{scheduled=null;syncNow();},wait);
  }
  async function syncNow(){
    cancelSchedule();
    if(!client||!user||mode!=='ready'||busy)return;
    const local=getWorld();if(!local){status('Local save is unreadable. Sync paused; your cloud copy was not replaced.');return;}
    let raw;try{raw=encodeWorld(local);}catch(e){status('Local world failed validation; sync paused.');return;}
    if(remote&&worldFingerprint(raw)===worldFingerprint(encodeWorld(remote.save))){status(`☁ Cloud is up to date (revision ${revision}).`);return;}
    if(typeof navigator!=='undefined'&&!navigator.onLine){status('Offline — saved on this device. Cloud will retry when online.');return;}
    busy=true;render();status('Saving the latest local progress to cloud…');
    try{await writeWorld(local,revision);}
    catch(e){status('Cloud could not sync: '+message(e)+'. Local world remains saved.');}
    finally{busy=false;render();}
  }
  function open(){el('cloudPanel').classList.add('show');render();}
  function close(){el('cloudPanel').classList.remove('show');}
  el('cloudClose').addEventListener('click',close);
  el('cloudLogin').addEventListener('click',()=>submitAuth(false));
  el('cloudSignup').addEventListener('click',()=>submitAuth(true));
  el('cloudKeepLocal').addEventListener('click',uploadDevice);
  el('cloudUseRemote').addEventListener('click',applyCloud);
  el('cloudSyncNow').addEventListener('click',syncNow);
  el('cloudSignout').addEventListener('click',async()=>{if(!client)return;cancelSchedule();try{await client.auth.signOut();resetAccount();}catch(e){status('Sign-out error: '+message(e));}});
  window.addEventListener('wilderness:local-save',scheduleSync);
  window.addEventListener('online',()=>{if(mode==='ready')scheduleSync();else if(user)inspectRemote();});
  document.addEventListener('visibilitychange',()=>{if(mode!=='ready')return;if(document.hidden)syncNow();else scheduleSync();});
  const controller={open,close,inspectRemote,syncNow};window.__wildernessCloudPanel=controller;
  if(!configured(url,key)){
    mode='setup';render();status('Cloud Save needs a dedicated Supabase project. Local saving still works normally.');
    return controller;
  }
  mode='setup';render();status('Connecting to Wilderness Cloud…');
  (async()=>{
    try{
      const {createClient}=createClientOverride?{createClient:createClientOverride}:await import('https://esm.sh/@supabase/supabase-js@2.118.0?bundle');
      client=createClient(String(url).trim(),String(key).trim(),{
        auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true},
        global:{headers:{'X-Client-Info':'wilderness-v0.23.5'}}
      });
      mode='auth';render();status('Cloud is available. Sign in or create your Wilderness account.');
      const {data,error}=await client.auth.getSession();
      if(error)throw error;
      if(data?.session?.user)await onSession(data.session);
      client.auth.onAuthStateChange((event,session)=>{
        // Defer other Supabase calls outside of the auth callback.
        if(event==='SIGNED_OUT'||event==='SIGNED_IN'||event==='INITIAL_SESSION')setTimeout(()=>onSession(session),0);
      });
    }catch(e){mode='setup';render();status('Cloud connection could not start: '+message(e)+'. Your local game still works.');}
  })();
  return controller;
}
