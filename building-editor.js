// Wilderness v0.23.4: renderer-independent long-press building edit validation.
// Editing reuses the same building ID, resource cost and save object; it is NOT crafting.
import {placementVerdict,normalizedRotation,snappedPosition,wallType} from './construction.js?v=0.24.0';
import {canRemoveSupport} from './second-story-system.js?v=0.24.0';

export const EDIT_HOLD_MS=560;
export const EDIT_DRAG_CANCEL_PX=13;
export const EDIT_DISTANCE=9.5;
export const editableTypes=Object.freeze(['cabin','foundation','floor','wall','door','window','roof','stairs','path','fence','planter','workbench','chest','furnace','table','chair','bed','shelf','campfire','loft_floor','loft_wall','loft_door','loft_window','loft_roof','loft_stairs']);
const near=(a,b,r)=>Math.hypot(a.x-b.x,a.z-b.z)<r;
export function shouldCancelHold(startX,startY,currentX,currentY){return Math.hypot(currentX-startX,currentY-startY)>EDIT_DRAG_CANCEL_PX;}
export function editOffsetStep(type){return ['workbench','chest','furnace','table','chair','bed','shelf','campfire'].includes(type)?1:2;}
export function displacedPart(original,x,z,rot){
 const r=normalizedRotation(rot),snapped=snappedPosition(original.type,x,z,r);
 return {...original,x:snapped.x,z:snapped.z,rot:r};
}
export function exactlySamePlacement(a,b){return a.id===b.id&&a.x===b.x&&a.z===b.z&&Math.abs(normalizedRotation(a.rot)-normalizedRotation(b.rot))<.01&&a.level===b.level;}
// Prevent displacing an object that other parts depend on, or moving into a reserved village.
// canDismantle handles old v0.5 ground-floor dependencies; canRemoveSupport checks lofts.
export function buildingEditVerdict(original,candidate,builds,resources,player,world,{canDismantle=null,villages=[],villageRadius=0}={}){
 if(!original||!builds.some(b=>b.id===original.id)||original.type!==candidate.type||original.id!==candidate.id)return 'Building identity changed';
 if(!editableTypes.includes(candidate.type))return 'This building cannot be edited';
 if(![candidate.x,candidate.z,candidate.rot].every(Number.isFinite))return 'Invalid coordinates';
 if(exactlySamePlacement(original,candidate))return '';
 const removed=canDismantle?.(original)||canRemoveSupport(original,builds);
 if(removed)return removed;
 const remaining=builds.filter(b=>b.id!==original.id);
 // Do not strand the contents of a prefabricated cabin when moving the shell.
 // A future whole-room move may carry everything together; this release moves one piece at a time.
 if(original.type==='cabin'&&remaining.some(b=>['workbench','chest','furnace','table','chair','bed','shelf','campfire'].includes(b.type)&&b.level!==1&&Math.abs(b.x-original.x)<2.2&&Math.abs(b.z-original.z)<2.2))return 'Move the furniture out of this cabin first';
 // A roof needs at least two wall pieces. Previous construction's support guard
 // checked floor removal but not a moved ground-level supporting wall.
 if(['wall','door','window'].includes(original.type)){
   for(const roof of remaining.filter(b=>b.type==='roof')){
     const before=builds.filter(b=>['wall','door','window'].includes(b.type)&&near(b,roof,1.45)).length;
     const after=[...remaining,candidate].filter(b=>['wall','door','window'].includes(b.type)&&near(b,roof,1.45)).length;
     if(before>=2&&after<2)return 'A roof still depends on this wall';
   }
 }
 if(villages.some(v=>Math.hypot(candidate.x-v.x,candidate.z-v.z)<villageRadius+2))return 'Village land is reserved';
 return placementVerdict(candidate,remaining,resources,player,world);
}
