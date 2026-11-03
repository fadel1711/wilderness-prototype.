# Wilderness v0.19.1 — Automatic Cloud Save Hotfix

This is a **complete GitHub Pages ZIP**, not an individual patch. It contains all twenty JS files, index.html, six 3D assets, README and ROADMAP. This release fixes cloud-save usability and changes no gameplay/world schema.

## Fixes

- First sign-in to an account with no cloud world **automatically uploads** the existing device world.
- A brand-new browser with no independent old save **automatically restores** the world for the signed-in account. A recovery copy is made before the restore/reload.
- A returning device whose cloud copy changed but whose local world did not **automatically restores** the newer account world.
- A returning device whose local save changed but whose cloud revision did not **automatically uploads** its progress.
- Changes sync regularly while online; local saving works when offline. Sync retries on reconnection. Some very recent actions may remain only local until connectivity returns / next launch.
- Ambient time, hunger drain, movement, and campfire fuel burn-down are ignored when deciding whether two worlds truly conflict (they are still saved normally). The choice prompt remains **only** where an independent, nontrivial local world conflicts with the cloud, an account switch could leak another account's progress, or local data is unreadable. No silent overwrites.

## Installation on iPhone (same GitHub Pages URL)

1. In Wilderness v0.19, go to **Bag → Export world** and keep the JSON file in Files. If using Cloud Save, ensure the latest world is backed up first.
2. Extract `wilderness-prototype-v0.19.1.zip` in iPhone Files. The folder contains the complete game plus `assets/` (six GLB/WebP files).
3. In your existing GitHub Wilderness repository, replace **all** existing game files in the repository root with the versions from this ZIP, and preserve/upload the exact `assets/` subfolder.
4. Commit on the branch GitHub Pages publishes (commonly `main`). Confirm the deployment succeeded.
5. Open the game at the same URL. The header should show **v0.19.1**. Open **Bag → Account & Cloud Save** and sign in once if needed. Your world should thereafter sync without routine device/cloud choices.

## Supabase / database

**No SQL update is required.** This is solely a frontend sync-policy change and uses the existing v0.19 backend function and row-level security. Do not rerun prior migration or rollback SQL. The configured `cloud-config.js` contains only the previously supplied project URL and *publishable* key. Never put a service-role/secret key on GitHub.

## Recovery / safety

- This hotfix deliberately keeps the **same `wilderness_v019_singleplayer` Safari storage key** as v0.19. Your existing world is not migrated into a new slot.
- Always export a JSON backup before uploading. To undo the website code, restore the complete v0.19 ZIP. Your existing local save should remain compatible.
- Automatic cloud restore keeps a local copy at `wilderness_v019_pre_cloud_restore`; Bag → Undo last cloud restore can recover it. The recovery slot stores a single prior copy, so keep exported JSON backups when switching accounts/devices.
- If **both devices were edited offline** or a different account's local world was present, the game deliberately stops and asks which to keep. This is the only responsible way to avoid data loss.
- Actual sign-in and Safari cross-device performance need testing. Automated checks are not a substitute for a real two-device sync test.
