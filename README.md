# Wilderness v0.17 — Optional, Conflict-Safe Cloud Save

**Stage 2 of the expansion roadmap.** This update preserves all v0.16 gameplay (sun/moon, zoom, multitouch, combat, survival needs, seed gathering, crafting, cabins, cave and premium GLB art) and introduces optional account-based cloud backups. It does **not** add zombies, villages, clothing, campfires, or a larger map; those remain later independent milestones.

## IMPORTANT: Two separate downloadable ZIPs

1. **PUBLIC game ZIP** (this archive): all the ready-to-upload HTML, JavaScript, README, ROADMAP and existing binary art files. It includes `cloud-config.js` with EMPTY project values and `cloud-save.js` with the account/sync UI.
2. **PRIVATE backend ZIP** (separately provided): a new Supabase Wilderness-only table migration, read-only verification SQL, detailed secure setup/rollback instructions. **Never upload this private ZIP to public GitHub Pages.**

**No remote database changes were made automatically.** Until you create a new Supabase project, run the migration, and enter the project URL + publishable key in `cloud-config.js`, Wilderness v0.17 works **locally** exactly as before; Cloud Save displays the setup message instead of sending data to an unconfigured backend.

## What's new

- Bag → **☁ Account & Cloud Save**: email/password signup, sign-in and sign-out via Supabase Auth.
- Automatic cloud copying of local saves while **signed in, online and after choosing the correct initial world**. Change batching approximately every 35 seconds, plus **Sync now** for manual backup. Network failures don't delete local data.
- First login on a new device: choose explicitly whether to use the cloud world or this device's local world. Divergent progress never silently overwrites another device.
- Atomic server revision checks reject stale uploads rather than allowing a silent last-writer-wins race. The UI pauses and asks after a conflict.
- Before loading the cloud world, the browser stores the current local world at `wilderness_v017_pre_cloud_restore`; **Bag → Undo last cloud restore** restores it and pauses cloud syncing until you choose a world again. Manual Bag → Export world JSON remains strongly recommended.
- Separate `wilderness_v017_singleplayer` browser save slot. v0.16 `wilderness_v016_singleplayer` is **read-only migration input**, never overwritten by upgrade.
- Credentials are not saved in world data, and `cloud-config.js` contains only public-safe project settings. Cloud JSON is **not end-to-end encrypted** and may be accessible to the administrator of your dedicated project.

## Upload from your iPhone — first time

1. In the live **v0.16** game: **Bag → Export world**, then save the `.json` backup to your iPhone Files app. Don't clear website data.
2. Save the complete v0.16 ZIP for rollback.
3. Download and extract the PUBLIC v0.17 ZIP in iPhone Files.
4. Open your **existing** Wilderness GitHub repository (same website address, same GitHub Pages branch). Replace **all** existing root `.html`, `.js`, `README.md`, and `ROADMAP.md` files using this complete package. **Do not upload a ZIP directly as a file; upload its extracted contents.**
5. **NEW files:** `cloud-config.js` and `cloud-save.js`, placed directly beside `game.js`. Keep all six `.glb`/`.webp` files in the `assets/` folder. They are unchanged from v0.16 and needn't be re-uploaded if already present and identical.
6. Commit to `main` or the branch actually used for GitHub Pages and check GitHub Actions / Pages deployment status.
7. Refresh the existing site; confirm **Single-player · v0.17**. The game should load and save locally **even though the cloud isn't configured yet**.
8. Separately, follow **PRIVATE backend ZIP → README_PRIVATE.md** to create a **NEW Wilderness Supabase project**, run the SQL, verify RLS, and configure email sign-in. **Do NOT reuse Dino Dominion's backend.**
9. Open the public `cloud-config.js`, replace the two empty strings with your **Wilderness Project URL** and its **PUBLISHABLE key** (not a secret/service_role key), and commit that one file. GitHub Pages will redeploy.
10. Open **Bag → Account & Cloud Save**, create an account, verify your email if required, sign in. On the first login, choose **Use this device's world** to upload your current settlement. Use **Sync now** and confirm the revision advances.
11. For another device: open the same game URL, sign into the same account, and choose **Use cloud world** after considering whether its local world contains anything worth exporting.

## Acceptance checklist (requires actual connected project for cloud steps)

1. v0.16 settlement, stored chests, crops, exploration, hunger/thirst, sun/moon and building locations migrate unchanged.
2. New v0.17 local save persists after Safari refresh, even **without** cloud configuration.
3. Opening Cloud Save before setup shows a helpful message rather than breaking the game.
4. With a dedicated backend configured, account creation, email confirmation and sign-in succeed.
5. First **Use this device** creates a cloud record; manual Sync now reports it saved.
6. Changing the world while signed in automatically syncs; refreshing on the same device preserves it.
7. Sign in on another device. Choose **Use cloud world**, confirm buildings, inventory and progress match.
8. Save different changes on two devices; an outdated revision requires an explicit choice, not a silent overwrite.
9. Turn Wi-Fi off, make progress, continue local saving; reconnect and sync correctly.
10. Sign out; the existing local world remains. Wrong login cannot access another player's saves.
11. JSON Export and Import still work; v0.16 local save key remains intact.
12. 3D game frame rate and touch controls remain acceptable on the iPhone.

## Recovery, rollback, and limitations

- If the cloud fails or the Supabase connection is unavailable, **the game still runs locally**. Cloud Save is an additional backup, not a replacement for Safari storage.
- To return to v0.16, restore all v0.16 public files to GitHub Pages. Its old browser save remains untouched. v0.17-only progress will not appear in v0.16 unless migrated with a compatible backup.
- Before cloud restore, the current v0.17 local world goes into `wilderness_v017_pre_cloud_restore`. Use **Bag → Undo last cloud restore** to recover it; restoring a JSON backup also pauses automatic cloud syncing until you choose the world again.
- If an accidental remote overwrite or migration error occurs, **stop syncing** and recover from JSON exports / previous local save keys or Supabase database backups; do not clear Safari data.
- A synced world has exactly one cloud copy per account. No automatic merging between two different worlds.
- Cloud saves require internet when the transfer occurs. Offline progress is saved locally and uploaded when service resumes; immediate sync on tab close is not guaranteed.
- Without an actual user-owned Supabase project and sign-in, the account, database policy enforcement, and real cross-device data path **cannot be verified in this package**. Only simulated local/client tests can run without it.

## Folder content

At ZIP root: `index.html`, `game.js`, 17 additional `.js` modules including **NEW `cloud-save.js`, `cloud-config.js`** (18 JavaScript files total), `README.md`, `ROADMAP.md`, and unchanged `assets/` with six `.glb` / `.webp` assets. No SQL or secrets in the public ZIP.

## References used for the backend design

- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase client: https://supabase.com/docs/reference/javascript/initializing
- Email/password Auth: https://supabase.com/docs/guides/auth/passwords
- Supabase JS client version pinned in `cloud-save.js`: `2.118.0`.
