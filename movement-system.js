// Wilderness v0.14: lightweight kinematic character vertical controller.
// Dedicated to player movement, not a full rigid-body physics engine.
export const GRAVITY=16.5;
export const JUMP_SPEED=5.75;
export const STEP_HEIGHT=.42;
const finite=x=>typeof x==='number'&&Number.isFinite(x);
export function canWalkStep(fromFloor,toFloor,airborne=false){
  return airborne || (finite(fromFloor)&&finite(toFloor)&&toFloor-fromFloor<=STEP_HEIGHT);
}
export function stepVertical(state,dt,floor,jump=false){
  if(!state||![state.y,state.vy,dt,floor].every(finite))throw Error('Invalid character physics state');
  const time=Math.max(0,Math.min(dt,.05));
  const height=Math.max(0,floor),previousY=Math.max(0,state.y);
  let {vy,grounded}=state,y=previousY,justLanded=false;
  if(grounded){
    if(jump){vy=JUMP_SPEED;grounded=false;}
    else if(height>=y-.18&&height<=y+STEP_HEIGHT){return {y:height,vy:0,grounded:true,justLanded:false};}
    else if(height<y-.18){grounded=false;vy=0;}
  }
  // Semi-implicit gravity, clamped by ground; never let ground contact sink below its platform.
  vy=Math.max(-18,vy-GRAVITY*time);
  y+=vy*time;
  if(y<=height && vy<=0){y=height;vy=0;justLanded=!grounded;grounded=true;}
  return {y,vy,grounded,justLanded};
}
