// Wilderness v0.24.1 — explicit guest mode: never share a save key with a cloud account.
export const PLAY_MODE_KEY='wilderness_play_mode_v1';
export const GUEST_SAVE_KEY='wilderness_v024_guest_singleplayer';
export const GUEST_PRE_IMPORT_KEY='wilderness_v024_guest_pre_import';
export const GUEST_SUPPLY_MARKER='wilderness_v024_guest_creative_grant';
export const GUEST_BEFORE_GRANT='wilderness_v024_guest_before_grant';

export function currentPlayMode(storage=localStorage){
  try{return storage.getItem(PLAY_MODE_KEY)==='guest'?'guest':'account';}
  catch(_){return 'account';}
}
export function isGuestMode(storage=localStorage){return currentPlayMode(storage)==='guest';}
export function setPlayMode(mode,storage=localStorage){
  if(mode!=='guest'&&mode!=='account')throw Error('Unsupported play mode');
  // Do not alter account or guest world data, cloud baselines or auth tokens.
  storage.setItem(PLAY_MODE_KEY,mode);
  return currentPlayMode(storage)===mode;
}
