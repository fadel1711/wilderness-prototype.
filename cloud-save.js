// Wilderness v0.17 — optional, conflict-safe cloud copies of the existing local world.
// No remote request is made unless cloud-config.js is filled in. Local saves stay primary.
import {CLOUD_URL,CLOUD_PUBLISHABLE_KEY} from './cloud-config.js?v=0.17';
import {SAVE_KEY,normalizeSave} from './save-system.js?v=0.17';
export const CLOUD_META_KEY='wilderness_v017_cloud_baseline';
const el=id=>document.getElementById(id);
const encodeWorld=value=>JSON.stringify(normalizeSave(value));
// Non-cryptographic change detector only; Postgres revision-CAS is the overwrite protection.
export function worldFingerprint(value){
  const str=typeof value==='string'?value:JSON.stringify(value);
  let h1=2166136261,h2=0x85ebca6b;
  for(let i=0;i<str.length;i++){h1=Math.imul(h1^str.charCodeAt(i),16777619);h2=Math.imul(h2^str.charCodeAt(i),2246822519);}
  return str.length+':'+(h1>>>0).toString(16)+':'+(h2>>>0).toString(16);
}
export function cloudDecision(local,remote,baseline,userId){
  if(!remote)return 'empty';
  if(local==null)return 'cloud-only';
  if(worldFingerprint(local)===worldFingerprint(remote.save))return 'same';
  if(baseline?.userId===userId&&baseline.revision===remote.revision&&baseline.hash===worldFingerprint(remote.save))return 'resume';
  return 'conflict';
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
    el('cloudDetails').textContent=mode==='ready'?`Cloud revision ${revision}. Changes sync automatically when online; local saves continue instantly.`:
      mode==='empty'?'This account has no cloud world yet. Choose to upload the world on this device.':
      mode==='cloud-only'?'Your local save cannot be read. You can restore the existing cloud world after reviewing the warning.':
      mode==='conflict'?'Two different world copies exist. Compare your devices before choosing which one to keep.':
      mode==='invalid'?'The cloud copy failed validation. It has not been applied to your device.':
      'Your local world stays saved in Safari.';
    el('cloudConflictText').textContent=mode==='empty'?'There is no existing cloud backup. Upload this device to begin automatic syncing.':
      mode==='cloud-only'?'This device has no valid local world. Loading the cloud world will create a local recovery snapshot when possible.':
      mode==='invalid'?'Cloud data is damaged or from an unsupported version. You may upload a valid local world to replace it, but first export a JSON backup.':
      'Your device and cloud have different progress. Using this device replaces the cloud copy; using cloud replaces the current local world. The old local version is backed up before a cloud restore.';
  }
  function getWorld(){try{
    if(window.__wildernessCloudSnapshot)return window.__wildernessCloudSnapshot()||null;
    const raw=localStorage.getItem(SAVE_KEY);return raw?normalizeSave(JSON.parse(raw)):null;
  }catch(e){return null;}}
  async function waitForGame(){for(let i=0;i<70&&!window.__gameReady;i++)await new Promise(r=>setTimeout(r,100));}
  function baselineWrite(world,rev){
    try{localStorage.setItem(CLOUD_META_KEY,JSON.stringify({userId:user.id,revision:rev,hash:worldFingerprint(world)}));}
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
      mode=cloudDecision(local,validRemote,baseline,owner);
      if(mode==='same'||mode==='resume'){
        mode='ready';baselineWrite(validRemote.save,revision);status('☁ Cloud connected. Your local world is protected and automatic syncing is active.');
        render();if(local&&worldFingerprint(local)!==worldFingerprint(validRemote.save))scheduleSync();return;
      }
      render();
      status(mode==='empty'?'No cloud world exists yet. Choose “Use this device’s world” to create one.':
        mode==='cloud-only'?'Cloud world found, but this device has no valid save to upload.':
        '⚠ Device and cloud differ. Choose one before automatic syncing can begin.');
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
    if(!window.confirm('Restore the cloud world to this device? Current v0.17 progress will be saved in a local recovery slot before reload. Export a JSON backup first if unsure.'))return;
    cancelSchedule();
    try{window.__wildernessCloudReplace(normalized);baselineWrite(normalized,revision);}
    catch(e){status('Could not restore cloud world: '+message(e));}
  }
  function scheduleSync(){
    if(mode!=='ready'||!client||!user||busy||scheduled!==null)return;
    const wait=Math.max(3500,35000-(Date.now()-lastSync));
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
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&mode==='ready')scheduleSync();});
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
        global:{headers:{'X-Client-Info':'wilderness-v0.17'}}
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
