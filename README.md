# Wilderness v0.19.2 — Cloud Save actually follows your account

**Complete GitHub Pages replacement package. No Supabase migration.**

This release corrects the v0.19.1 cloud-login decision logic. It contains the whole playable game, twenty JavaScript files, index.html, and six original 3D assets inside `assets/`.

## What is fixed

1. When local and cloud saves have the same meaningful progress but differ in time of day, position, hunger/thirst, etc., **load the account world automatically**. The comparison now works even if the newer sync-baseline metadata is missing.
2. On an established Wilderness account with a cloud world, a device missing account-baseline metadata now loads the **cloud world automatically**. The old local world is stored in `wilderness_v019_pre_cloud_restore` for **Bag → Undo last cloud restore** before reload.
3. On first sign-in with no cloud world, the current local world uploads automatically.
4. Cloud uploads continue automatically during play and locally while offline. Only known simultaneous offline edits on two devices, a prior different-account world, or corrupt data can pause for a manual decision.
5. A sync baseline is written *before* the automatic cloud-restore reload, avoiding repeated first-login decisions after Safari reloads.

## iPhone GitHub installation

1. **Before updating**, open v0.19.1 and choose **Bag → Export world**. Keep that JSON file in the Files app.
2. Unzip `wilderness-prototype-v0.19.2.zip` in Files.
3. In your Wilderness GitHub Pages repo, replace the existing root `index.html` and **all twenty `.js` files** with the complete files in this ZIP. Keep/replace the six original assets inside the `assets/` folder.
4. Commit changes to the branch used by GitHub Pages, normally `main`. Confirm the deployment succeeded.
5. Visit the same Wilderness game URL. It must clearly show **Single-player · v0.19.2** at the top, or the old version is still being served; close and reopen the Safari tab, or add `?check=0192` to the game URL.
6. Use **Bag → Account & Cloud Save** to sign in if needed. The existing account world should load without a device/cloud choice. On successful sync you should see `Automatic sync on` and the cloud revision.

No Cloud Save setting needs to be reset. No new SQL, database update, rollback, or new account is required. **Do not clear Safari website data.**

## Protection and rollback

- Uses the SAME browser save slot `wilderness_v019_singleplayer` as v0.19 and v0.19.1.
- When a remote world is restored, the previous local world is written into the recovery slot `wilderness_v019_pre_cloud_restore`. In Bag, **Undo last cloud restore** lets you recover it. Keep a manual JSON backup as an independent second copy.
- A true fork (both your device and cloud changed independently from a known saved baseline) still asks you to choose; automatic deletion would be unsafe.
- If you're signed in to a different Wilderness account than before, the game won't silently upload or overwrite the other account's world.
- To revert frontend files, re-upload the complete v0.19.1 ZIP. Older world copies are preserved; if restoring from JSON, do it intentionally.

## Acceptance checks

- Header says v0.19.2, not v0.19.1.
- Account login on a normal device auto-loads existing cloud world; no needless choice if only walking/clock/needs differ.
- Back up local progress, then verify cross-device load, synced inventory, campfires and clothing.
- Save offline, reconnect, wait for sync; confirm no data disappears.
- A genuine two-device conflict still safely asks; do not ignore or randomly choose between two different settlements.

### Tests

Automated decision and simulated UI flow tests are included in release validation, but actual iPhone Safari rendering and your live Supabase environment still require testing.
