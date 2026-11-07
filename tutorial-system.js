// Wilderness v0.24.2 — first-world mandatory interactive onboarding.
// All state is stored outside the version-22 world save schema to preserve old cloud saves.
export const TUTORIAL_LAST_STEP=6;
export const TUTORIAL_STEPS=Object.freeze([
  {name:'Find your feet',instruction:'Move using the left joystick. Walk about 3 metres.',tip:'Push and hold the circle at bottom left. You can also use W/A/S/D.',action:'Movement help'},
  {name:'Gather what you need',instruction:'Chop one tree for 3 wood, then mine one rock for 2 stone.',tip:'Walk close to the glowing marker, equip the correct tool, then hold the big action button.',action:'Equip the right tool'},
  {name:'Build your workbench',instruction:'Open Build and place a Workbench on clear ground.',tip:'Use the highlighted Build button, preview where the bench will go, then tap Place.',action:'Build Workbench'},
  {name:'Craft your first upgrade',instruction:'Walk to your workbench, tap Use, and craft a Stone Axe.',tip:'The workbench must be within reach. Choose the Stone Axe recipe in its menu.',action:'Open Workbench'},
  {name:'Make your first campfire',instruction:'Build a Campfire near your new workbench.',tip:'Choose Campfire in Build, find a green placement, and tap Place.',action:'Build Campfire'},
  {name:'Practice combat',instruction:'Tap Attack once, then hold Block briefly. This safe lesson has no enemies.',tip:'A training sword and shield are provided. Tap the large action circle to attack, then hold the shield button.',action:'Equip training sword'}
]);
export const tutorialStorageKey=mode=>'wilderness_first_steps_v1_'+(mode==='guest'?'guest':'account');
export const tutorialComplete=state=>!!state&&state.step>=TUTORIAL_LAST_STEP;
export const tutorialActive=state=>!!state&&!tutorialComplete(state);
export const newTutorial=()=>({v:1,step:0,moved:0,wood:0,stone:0,starter:false,combatKit:false,swung:false,blocked:false});
export const finishedTutorial=()=>({...newTutorial(),step:TUTORIAL_LAST_STEP});
function normalize(data){
  if(!data||data.v!==1||!Number.isInteger(data.step)||data.step<0||data.step>TUTORIAL_LAST_STEP)return null;
  const s=newTutorial();s.step=data.step;
  for(const field of ['moved','wood','stone'])if(typeof data[field]==='number'&&Number.isFinite(data[field]))s[field]=Math.max(0,Math.min(999,data[field]));
  for(const field of ['starter','combatKit','swung','blocked'])s[field]=data[field]===true;
  return s;
}
export function writeTutorial(storage,mode,state){try{storage.setItem(tutorialStorageKey(mode),JSON.stringify(state));return true;}catch(_){return false;}}
export function startTutorial(storage,mode,existingWorld){
  let value=null;try{value=storage.getItem(tutorialStorageKey(mode));}catch(_){}
  if(value!==null){
    try{const parsed=normalize(JSON.parse(value));if(parsed)return parsed;}catch(_){}
  }
  // Missing or damaged marker on an EXISTING world must never force a veteran to replay.
  const state=existingWorld?finishedTutorial():newTutorial();
  writeTutorial(storage,mode,state);return state;
}
export function setTutorialCompleted(storage,mode){const state=finishedTutorial();writeTutorial(storage,mode,state);return state;}
export function setTutorialFresh(storage,mode){const state=newTutorial();writeTutorial(storage,mode,state);return state;}
// Pure reducer: every advancement requires a real gameplay event, not a UI click on Continue.
export function tutorialEvent(state,type,data=0){
  if(!tutorialActive(state))return state;
  const n={...state};
  if(type==='move'&&n.step===0){n.moved=Math.min(999,n.moved+Math.max(0,Number(data)||0));if(n.moved>=3)n.step=1;}
  if(type==='harvest'&&n.step===1){if(data?.kind==='tree')n.wood=Math.min(999,n.wood+Math.max(0,Number(data.qty)||0));
    if(data?.kind==='rock')n.stone=Math.min(999,n.stone+Math.max(0,Number(data.qty)||0));
    if(n.wood>=3&&n.stone>=2)n.step=2;}
  if(type==='build'&&n.step===2&&data==='workbench')n.step=3;
  if(type==='craft'&&n.step===3&&data==='stone_axe')n.step=4;
  if(type==='build'&&n.step===4&&data==='campfire')n.step=5;
  if(n.step===5&&type==='attack')n.swung=true;
  if(n.step===5&&type==='block')n.blocked=true;
  if(n.step===5&&n.swung&&n.blocked)n.step=6;
  return n;
}
export function tutorialCopy(state){if(!tutorialActive(state))return null;
  const step=TUTORIAL_STEPS[state.step];
  let instruction=step.instruction;
  if(state.step===0)instruction=`Use the left joystick · ${Math.min(3,state.moved).toFixed(1)} / 3 metres`;
  if(state.step===1)instruction=`Harvest wood ${Math.min(3,state.wood)}/3 and stone ${Math.min(2,state.stone)}/2. Follow the yellow marker.`;
  if(state.step===5)instruction=`Practice: Attack ${state.swung?'✓':'○'}  ·  Block ${state.blocked?'✓':'○'}`;
  return {step:state.step+1,total:TUTORIAL_LAST_STEP,name:step.name,instruction,tip:step.tip,action:step.action};
}
