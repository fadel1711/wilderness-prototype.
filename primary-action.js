// Wilderness repair: deterministic one-button context, no accidental interactions during combat.
export function primaryAction({equipped='axe',food=null,resource=null,deepVein=false,nearby=null}={}) {
  if(food)return {kind:'consume',label:food==='water'?'💧 Drink':'🍴 Eat'};
  if(equipped==='sword')return {kind:'attack',label:'⚔ Attack'};
  if(deepVein&&['pickaxe','iron_pickaxe'].includes(equipped))return {kind:'gather',label:'⛏ Mine'};
  if(resource==='tree'&&['axe','stone_axe'].includes(equipped))return {kind:'gather',label:'🪓 Chop'};
  if(resource==='rock'&&['pickaxe','iron_pickaxe'].includes(equipped))return {kind:'gather',label:'⛏ Mine'};
  const labels={door:'🚪 Open',chest:'📦 Loot',person:'🤝 Trade',station:'⚙ Use'};
  if(nearby&&labels[nearby])return {kind:'interact',label:labels[nearby]};
  if(equipped==='torch')return {kind:'torch',label:'🔥 Light / Off'};
  if(['axe','stone_axe'].includes(equipped))return {kind:'interact',label:'🪓 Chop / Use'};
  if(['pickaxe','iron_pickaxe'].includes(equipped))return {kind:'interact',label:'⛏ Mine / Use'};
  return {kind:'interact',label:'✋ Use'};
}
