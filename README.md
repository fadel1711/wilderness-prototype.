# Wilderness v0.10 — Atmosphere, Animation & Polish

**A complete GitHub Pages update** built from v0.9, with one new JavaScript module. One-player, no ads or paid features.

## What's changed
- Gentle day/night light cycle (one in-game day every ~12 minutes of active play; does not advance while browser is closed).
- Time-of-day HUD; subtle changes to sky, sunlight and warmth; nighttime remains bright enough to navigate.
- Optional small synthesized sound effects for footsteps, chopping, mining, building, sword hits and occasional birds. No downloads, music tracks or third-party audio services.
- Small, pooled gathering/placement particles. **Low effects** disables them and lowers render pixel ratio for iPhone performance.
- Controls for **Sound On/Off** and **Effects Standard/Low** in **Bag → Game settings**. Preferences persist on the device independently from world saves.
- All v0.9 worlds (cabins, crops, resources, caves, discoveries, equipment, chests) migrate to a separate **v0.10** save slot. New backup exports include the current time of day.

This is a **polish release**, not a full character/art redesign. The basic geometric 3D art remains; a future art pass would need rigged models and proper textures.

## Files — upload ALL TEN to the repository ROOT
1. `index.html`
2. `game.js`
3. `construction.js`
4. `save-system.js`
5. `craft-system.js`
6. `combat-system.js`
7. `exploration-system.js`
8. `farm-system.js`
9. **`atmosphere-system.js` (NEW)**
10. `README.md`

All files are complete replacements; do not upload the ZIP itself as your website.

## Exact iPhone upload steps
1. Open your **current working v0.9 game**. Tap **Bag → Export world**, save the JSON in Files and confirm it exists.
2. Save your old v0.9 ZIP for rollback. Download and extract the new v0.10 ZIP in the iPhone **Files** app.
3. Open your **existing** Wilderness GitHub repository. Do not make a new repository or edit GitHub Pages settings.
4. In the repository root, replace all eight existing app files (`index.html`, `game.js`, `construction.js`, `save-system.js`, `craft-system.js`, `combat-system.js`, `exploration-system.js`, `farm-system.js`) with the versions from the ZIP.
5. Add `atmosphere-system.js` to the **same folder**.
6. Replace `README.md` with the included file.
7. Commit to `main`, then visit **Actions** and confirm the GitHub Pages deploy succeeded.
8. Open your **existing** Pages URL in Safari and reload. Verify the upper-left title reads **Single-player · v0.10**.
9. Enter the game. Open **Bag → Game settings** to turn sound off or set effects low if desired. Do not clear Safari website data.

If startup fails, check all eight .js files and `index.html` are in the same root. The startup error screen attempts to identify missing or mixed versions. Keep the previous ZIP and exported backup until the new build passes acceptance tests.

## Save compatibility / rollback
- v0.10 writes to `wilderness_v010_singleplayer` and only reads the v0.9 key when upgrading; old v0.9 data remains untouched.
- A fresh install with no prior save starts at 09:00 on Day 1. Migrated worlds also start at Day 1, 09:00; all buildings/crops/quests are retained.
- JSON import/export includes the new time field. Old JSON backups are accepted by the migration parser.
- If you need to go back, re-upload your **complete** v0.9 ZIP to GitHub. Progress made only in v0.10 won't appear in v0.9.

## Acceptance test
- Existing cabin and stairs, storage, inventory, wolves, landmarks, crops, blueprints and waypoints persist.
- Time HUD moves forward; lighting transitions gradually and remains playable at night.
- Sound can be enabled and disabled on iPhone after tapping Enter.
- Gathering/building actions show subtle particles in Standard mode; Low mode reduces effects while movement remains smooth.
- Collision, joystick, cave, construction, farming, combat and save refresh still work.
- Export a fresh JSON and import it: buildings, farm plots, discoveries and time of day should survive.

## Test limitations
JavaScript, save migration and isolated atmosphere logic can be automated in this environment. A real iPhone Safari rendering/audio/performance acceptance test is still required before calling v0.10 stable.
