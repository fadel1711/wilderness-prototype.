// Wilderness v0.24.3 — presentation-only organization of existing controls.
// Does NOT touch save keys, inventories, cloud sync, guest mode, tutorial state, or game input handlers.
const BUILD_GROUPS = Object.freeze({
  starter: ['cabin','campfire','workbench','chest','furnace','bed'],
  structures: ['foundation','floor','wall','door','window','roof','stairs','path','fence','planter','torch_stand'],
  upstairs: ['loft_floor','loft_wall','loft_door','loft_window','loft_roof','loft_stairs'],
  more: ['table','chair','shelf']
});
function node(doc,id){return doc.getElementById(id);}
function make(doc,tag,className,text){const el=doc.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;}
function place(doc,parent,element){if(element)parent.appendChild(element);}
function makeTabs(doc,host,entries,prefix){
  const nav=make(doc,'nav','ui-tabs');nav.setAttribute('role','tablist');nav.setAttribute('aria-label',prefix==='bag'?'Backpack sections':'Construction categories');
  const panes={},buttons={};
  for(const [id,label] of entries){
    const button=make(doc,'button','ui-tab',label);button.type='button';button.id=`ui-${prefix}-tab-${id}`;button.setAttribute('role','tab');
    const pane=make(doc,'section',`ui-pane ui-${prefix}-pane`);pane.id=`ui-${prefix}-pane-${id}`;pane.dataset.tab=id;pane.setAttribute('role','tabpanel');pane.setAttribute('aria-labelledby',button.id);
    button.setAttribute('aria-controls',pane.id);buttons[id]=button;panes[id]=pane;nav.append(button);host.append(pane);
  }
  function switchTo(id){
    if(!panes[id])return;
    for(const key of Object.keys(panes)){
      const selected=key===id;panes[key].hidden=!selected;buttons[key].setAttribute('aria-selected',String(selected));buttons[key].tabIndex=selected?0:-1;
    }
  }
  for(const [id,button] of Object.entries(buttons)){
    button.addEventListener('click',()=>switchTo(id));
    button.addEventListener('keydown',e=>{
      if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft'&&e.key!=='Home'&&e.key!=='End')return;
      e.preventDefault();const ids=Object.keys(buttons),at=ids.indexOf(id);
      const i=e.key==='Home'?0:e.key==='End'?ids.length-1:(at+(e.key==='ArrowRight'?1:-1)+ids.length)%ids.length;
      switchTo(ids[i]);buttons[ids[i]].focus();
    });
  }
  host.prepend(nav);
  return {nav,panes,switchTo};
}
function installBackpack(doc){
  const bag=node(doc,'inventoryPanel');if(!bag||bag.dataset.uiSimplified)return null;
  bag.dataset.uiSimplified='true';
  const header=bag.querySelector('.panelheader');
  const host=make(doc,'div','ui-tab-host');header.insertAdjacentElement('afterend',host);
  const tabs=makeTabs(doc,host,[['items','🎒 Items'],['outfit','👕 Outfit'],['supplies','🪵 Supplies'],['settings','⚙ Settings']],'bag');
  const items=tabs.panes.items,outfit=tabs.panes.outfit,supplies=tabs.panes.supplies,settings=tabs.panes.settings;
  place(doc,items,node(doc,'bagSummary'));place(doc,items,node(doc,'inventorySlots'));
  items.append(make(doc,'p','ui-hint','Tap an item to equip or use it. Your world saves automatically.'));
  const wardrobe=bag.querySelector('.wardrobe');place(doc,outfit,wardrobe);
  const backup=bag.querySelector('.backuptools');
  const supplyBlocks=backup?Array.from(backup.querySelectorAll(':scope > .supplies')):[];
  supplyBlocks.forEach(el=>supplies.append(el));
  supplies.prepend(make(doc,'p','ui-hint','Need tools or building materials? Use these optional supplies after the tutorial.'));
  const camera=make(doc,'div','ui-camera-settings');camera.append(make(doc,'strong','','📷 Camera zoom'));
  const zoom=doc.querySelector('.zoomdock');if(zoom)camera.append(zoom);
  const displaySettings=make(doc,'details','ui-settings-group');
  const displayTitle=make(doc,'summary','','🎮 Gameplay & display');displaySettings.append(displayTitle);
  const prefs=backup?.querySelector(':scope > .gamePrefs');if(prefs)displaySettings.append(prefs);
  displaySettings.append(camera);settings.append(displaySettings);
  const saveDetails=make(doc,'details','ui-settings-group');
  saveDetails.open=true;saveDetails.append(make(doc,'summary','','☁ Account & world backup'));
  if(backup){for(const child of Array.from(backup.childNodes))saveDetails.append(child);backup.remove();}
  settings.append(saveDetails);
  tabs.switchTo('items');
  // Restore the inventory view on every new opening; existing game listeners remain on original nodes.
  const watcher=new MutationObserver(()=>{
    if(bag.classList.contains('show')&&bag.dataset.previousOpen!=='true')tabs.switchTo('items');
    bag.dataset.previousOpen=bag.classList.contains('show')?'true':'false';
  });watcher.observe(bag,{attributes:true,attributeFilter:['class']});
  return tabs;
}
function installBuildMenu(doc){
  const panel=node(doc,'buildPanel');if(!panel||panel.dataset.uiSimplified)return null;
  panel.dataset.uiSimplified='true';
  const header=panel.querySelector('.panelheader');
  const title=header?.querySelector('strong');if(title)title.textContent='🔨 Build something';
  const host=make(doc,'div','ui-tab-host');header.insertAdjacentElement('afterend',host);
  const tabs=makeTabs(doc,host,[['starter','⭐ Starter'],['structures','🏠 Parts'],['upstairs','🪜 Upstairs'],['more','📐 More']],'build');
  const panes=tabs.panes;
  const labels={starter:'Simple essentials to start your home',structures:'Walls, floors, roofing, paths and gardens',upstairs:'Build a second floor when you are ready',more:'Decorations, blueprints and your saved designs'};
  for(const id of Object.keys(panes)){
    panes[id].append(make(doc,'p','ui-hint',labels[id]));
    const grid=make(doc,'div','buildchoices ui-build-grid');panes[id].append(grid);
    panes[id].dataset.category=id;
  }
  const items=Array.from(panel.querySelectorAll('[data-type]'));
  const moved=[];
  for(const button of items){
    const type=button.dataset.type;
    let category='more';
    for(const [name,values] of Object.entries(BUILD_GROUPS))if(values.includes(type))category=name;
    if(type.startsWith('stock:')||type.startsWith('saved:'))category='more';
    panes[category].querySelector('.ui-build-grid').append(button);moved.push(type);
  }
  // These containers are updated by the existing game code: preserve them, not clones.
  const plans=panel.querySelectorAll('.planlist');
  for(const list of plans)panes.more.append(list);
  const landtools=panel.querySelector('.landtools');if(landtools)panes.more.append(landtools);
  const details=Array.from(panel.querySelectorAll(':scope > .small'));
  if(details[0])panes.upstairs.append(details[0]);
  if(details[1])panes.more.append(details[1]);
  for(const el of Array.from(panel.children)){
    if(el===header||el===host)continue;
    // Remaining empty legacy layout scaffolding is safely removed, after all interactive nodes were moved.
    if(el.matches('.buildchoices,.pickersection,.small'))el.remove();
  }
  tabs.switchTo('starter');
  const watcher=new MutationObserver(()=>{
    if(panel.classList.contains('show')&&panel.dataset.previousOpen!=='true'){
      const selected=panel.querySelector('[data-type].active');
      const selectedPane=selected?.closest('.ui-build-pane');
      tabs.switchTo(doc.body.classList.contains('tutorial-active')?'starter':selectedPane?.dataset.tab||'starter');
    }
    panel.dataset.previousOpen=panel.classList.contains('show')?'true':'false';
  });watcher.observe(panel,{attributes:true,attributeFilter:['class']});
  return {tabs,types:moved};
}
export function installSimpleInterface(doc=document){
  if(!doc?.getElementById('buildPanel')||!doc?.getElementById('inventoryPanel'))return false;
  const bag=installBackpack(doc),build=installBuildMenu(doc);
  const reset=node(doc,'resetControls');if(reset){reset.textContent='↻';reset.title='Unstick movement or camera';}
  const edit=node(doc,'editQuickbar');if(edit){edit.title='Customize your six equipment slots';edit.setAttribute('aria-label','Edit equipment slots');}
  const intro=doc.querySelector('#modal .controls');if(intro)intro.innerHTML='<b>Move</b> with the left circle · <b>Look</b> by dragging · <b>Use</b> the gold button · <b>Bag</b> has supplies and settings · <b>Build</b> has starter pieces';
  return Boolean(bag&&build);
}
