# Wilderness v0.23.2 — Mandatory Landscape Mode (iPhone)

A **complete, ready-to-upload GitHub Pages game package** based directly on the working v0.23.1. It includes every game module, all six assets in `assets/`, and the new `orientation-gate.js`. This is a **small UI and input-safety hotfix**. All four villages, their enterable houses/doors/chests/trading, cave mining, construction, farming, wardrobe, campfires and automatic Cloud Save remain intact.

## What changed

- **Landscape-only gameplay:** On a portrait-shaped screen, a polished full-screen Rotate Your Phone screen blocks gameplay. Physically rotate the iPhone sideways to dismiss it automatically. Landscape does not require an extra tap or page reload.
- **No false promise of automatic phone rotation:** Ordinary iPhone Safari webpages cannot reliably force iOS screen orientation. This update **requires** landscape by showing a rotation gate; it does not secretly rotate the device. If your iPhone refuses to rotate, disable **Portrait Orientation Lock** in Control Center.
- **Gameplay pauses safely in portrait:** no character movement, day/night clock progress, hunger/thirst depletion, creature updates or autosave ticks while the screen is locked. The previous held joystick, camera pointer, jump and block inputs are cleared on rotation. Landscape resumes the existing game seamlessly.
- **Start screen and menus:** if you open the game vertically, the gate covers the start menu too. Rotate sideways first to access gameplay and menus. The existing "↻ Unstick" recovery control is retained.
- **No database or save changes:** `SAVE_KEY` is **still `wilderness_v0231_singleplayer`**, and the validated save JSON schema version is still **21**. The previous cloud-save implementation and baseline are **not modified**; cloud configuration remains included. **No Supabase SQL or rollback is required.**

## iPhone installation (GitHub Pages)

1. Open your working **v0.23.1** game and use **Bag → Export world**. Save the JSON backup in Files. Do not clear Safari website data.
2. Download/extract `wilderness-prototype-v0.23.2.zip` in the iPhone Files app.
3. Open your **existing Wilderness GitHub repository**, on its GitHub Pages deployment branch (usually `main`). Replace **all existing root `.html` and `.js` files** using the full versions inside the ZIP, and add the NEW **`orientation-gate.js`** beside `game.js`.
4. Keep the six model/texture assets inside `assets/` (included in this ZIP). Don't upload a ZIP or a wrapper folder into the repository root.
5. Commit changes. When GitHub Pages reports success, refresh the normal Wilderness game URL. Check the game header **Single-player · v0.23.2** while sideways. Source-module imports and startup checks use **0.23.2** cache-busting query strings to avoid mixed files.
6. Rotate to portrait: the full-screen landscape-required message should appear. Rotate back: it should vanish with your exact world and character still there. Test walk+Jump multitouch, ↻ Unstick, Map, Bag, village doors, loot and automatic cloud saving.

**DO NOT run any Supabase migration or rollback.** This is presentation-only. If your device has an old cached client, close the old tab, confirm the GitHub Pages deployment and check the version header; do not delete your browser saves.

## Quick acceptance checks

1. Portrait mode blocks input (including keyboards), covers the entire screen and pauses time, NPCs and survival drain.
2. Landscape automatically restores the full HUD and controls without asking you to reload.
3. Turn from landscape to portrait **while holding the joystick**: movement stops immediately. Return to landscape: joystick and camera work normally; ↻ Unstick remains available.
4. Landscape Bag/Map/Build and the cloud account panel remain usable.
5. All four villages, houses, doors, chests and trades continue to work; original settlement and items remain unchanged.
6. Refresh with your phone in landscape; the same world loads and Cloud Save behaves as in v0.23.1.

## Rollback

Since v0.23.2 deliberately keeps exactly the **same save key and schema** as v0.23.1, you can redeploy your previous **complete v0.23.1 ZIP** if needed. Export a current world JSON backup first; don't clear browser data and don't run SQL. **No automatic cloud conflict-choice changes** are included.

## Verification notes

JavaScript syntax, import references, v0.23.1 save-key and cloud-baseline preservation, portrait/landscape gating, control-reset behavior, full archive integrity and static UI layout were tested. Live iPhone Safari rendering and touch/orientation behavior still require real-device confirmation. An iPhone webpage cannot override the iOS orientation-lock switch.
