// Wilderness v0.23.7 — no service worker, no destructive cache purge.
// Checks the live GitHub Pages release marker whenever the installed app is opened.
export const THIS_VERSION='0.23.8.1';
export function parseVersion(v){
  if(typeof v!=='string'||!/^\d+\.\d+(?:\.\d+)?$/.test(v))return null;
  return v.split('.').map(Number);
}
export function isNewerVersion(remote,current=THIS_VERSION){
  const a=parseVersion(remote),b=parseVersion(current);
  if(!a||!b)return false;
  for(let i=0;i<Math.max(a.length,b.length);i++)if((a[i]??0)!==(b[i]??0))return (a[i]??0)>(b[i]??0);
  return false;
}
export function updateUrl(currentHref,newVersion){
  const url=new URL(currentHref);
  url.searchParams.set('app',newVersion);
  return url.href;
}
export function installVersionCheck({win=window,doc=document,fetchFn=fetch,version=THIS_VERSION}={}){
  let checking=false,reloading=false,lastCheck=0,notice=null,visibilityWasHidden=false;
  function show(text,action){
    if(!notice){notice=doc.createElement('div');notice.id='wildernessUpdateNotice';
      Object.assign(notice.style,{position:'fixed',zIndex:'2500',top:'max(12px,env(safe-area-inset-top))',left:'50%',transform:'translateX(-50%)',width:'min(430px,calc(100% - 32px))',padding:'12px 16px',borderRadius:'14px',background:'#223e2d',color:'#f9f3df',border:'1px solid #d7c38d',boxShadow:'0 8px 32px #0009',font:'600 13px system-ui',textAlign:'center'});doc.body.appendChild(notice);}
    notice.replaceChildren();const label=doc.createElement('span');label.textContent=text;notice.appendChild(label);
    if(action){const btn=doc.createElement('button');btn.textContent='Update now';btn.style.marginLeft='9px';btn.style.padding='6px';btn.style.background='#dbc48f';btn.style.color='#243126';btn.style.borderRadius='8px';btn.addEventListener('click',action);notice.appendChild(btn);}
  }
  async function check({onReturn=false}={}){
    if(checking||reloading||!win.navigator?.onLine)return false;
    // Avoid a full network request on every orientation or focus glitch.
    if(!onReturn&&Date.now()-lastCheck<45000)return false;
    checking=true;lastCheck=Date.now();
    try{
      const resp=await fetchFn('./release.json?check='+Date.now(),{cache:'no-store'});
      if(!resp.ok)return false;
      const data=await resp.json();if(!isNewerVersion(data.version,version))return false;
      // Deployment may be in progress. Do not reload onto mismatched HTML / JS.
      const page=await fetchFn('./index.html?verifyBuild='+encodeURIComponent(data.version)+'&t='+Date.now(),{cache:'no-store'});
      if(!page.ok)return false;
      const newPage=await page.text();
      if(!newPage.includes('name="wilderness-build" content="'+data.version+'"'))return false;
      const target=updateUrl(win.location.href,data.version);
      if(target===win.location.href){show('A newer Wilderness release is online. Open the game URL in Safari to refresh this installed app.');return false;}
      reloading=true;
      show('Wilderness '+data.version+' is ready. Updating your app…');
      // Phone-local world is saved first; do not sign out or delete browser storage.
      try{win.__wildernessForceLocalSave?.();}catch(e){console.warn('Could not flush save before update',e);}
      // Do not automatically jump during active gameplay unless returning from background.
      if(onReturn||!win.__wildernessProfileAllowed){win.location.replace(target);}
      else {reloading=false;show('Wilderness '+data.version+' is available.',()=>{
        try{win.__wildernessForceLocalSave?.();}catch(e){}win.location.replace(target);
      });}
      return true;
    }catch(e){return false;}finally{checking=false;}
  }
  // Check on opening the installed app and on return from background. Do not poll a busy gameplay frame.
  function onVisibility(){if(doc.visibilityState==='hidden'){visibilityWasHidden=true;return;}
    if(visibilityWasHidden){visibilityWasHidden=false;check({onReturn:true});}}
  doc.addEventListener('visibilitychange',onVisibility);
  win.addEventListener('pageshow',()=>check());
  win.addEventListener('online',()=>check({onReturn:true}));
  // Initial check also works in stand-alone Home Screen mode.
  check();
  return {check};
}
