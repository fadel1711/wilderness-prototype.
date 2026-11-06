// Remote is authoritative unless the device has proven unsynced edits and the
// remote revision is unchanged. Account switching never uploads old-device data.
export function cloudAutoDecision(local,remote,baseline,uid,{freshDevice=false,explicitImport=null,worldFingerprint,progressFingerprint}={}){
  if(!remote){
    if(baseline?.userId&&baseline.userId!==uid&&!freshDevice)return 'fresh';
    return local?'upload':'invalid';
  }
  if(!local)return 'restore';
  if(baseline?.userId&&baseline.userId!==uid)return 'restore';
  if(worldFingerprint(local)===worldFingerprint(remote.save))return 'same';
  if(explicitImport?.userId===uid&&explicitImport.revision===remote.revision)return 'upload';
  if(progressFingerprint(local)===progressFingerprint(remote.save))return baseline?.userId===uid&&Number(baseline.revision)===Number(remote.revision)?'same':'restore';
  if(baseline?.userId===uid&&Number(baseline.revision)===Number(remote.revision)){
    // Preserve offline work on the same account, using cloud revision CAS.
    if(baseline.progressHash&&baseline.progressHash!==progressFingerprint(local))return 'upload';
    if(baseline.hash&&baseline.hash!==worldFingerprint(local)&&!baseline.progressHash)return 'upload';
  }
  // Concurrent edits / a different signed-in device: cloud wins; local is backed
  // up before restore and never discarded without a recoverable copy.
  return 'restore';
}
