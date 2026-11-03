# Wilderness v0.16 — Visible Sun/Moon & Camera Zoom

This is the **first separately managed release** from the new Wilderness expansion plan. It builds directly on v0.15 and intentionally limits the scope to two camera/sky features. The many other requested systems (cloud save, village NPCs, zombies, campfires, companion dog, deep mining cave, changing clothes, second floors, and a 2× world) have their own later milestones. They are NOT in this release.

## Contents
- `index.html`, `game.js`, `save-system.js`, and 13 unchanged game modules (`construction.js`, `craft-system.js`, `combat-system.js`, `exploration-system.js`, `farm-system.js`, `atmosphere-system.js`, `visual-system.js`, `cave-art.js`, `survival-system.js`, `movement-system.js`, `seed-system.js`, `premium-assets.js`, `dual-input.js`)
- **NEW:** `sky-camera.js`
- `README.md` and **`ROADMAP.md`** (all later modules and release gates)
- `assets/`: six existing GLB / WebP assets, preserved unchanged

**File count:** 16 JavaScript modules including `game.js` and `sky-camera.js`, plus `index.html`, `README.md`, `ROADMAP.md`, and six binary art assets = **25 files**. All contents are at the ZIP root, preserving the `assets/` folder.

## Changes
- Visible sun and moon 3D sky sprites, using the existing 12-minute game day/night clock (day/night moon/sun positions).
- Camera zoom buttons `＋` (closer) and `−` (farther). Supported range: 3.5–18 metres. Desktop mouse wheel also zooms.
- Camera zoom is saved as a **device preference**, not a world item. Adjust it independently on each device.
- 3D camera occlusion handling, gameplay logic, world map, village markers, existing construction collisions, two-thumb controls, original art assets, and world geometry are unchanged.
- v0.16 local save key `wilderness_v016_singleplayer` is separate from v0.15 `wilderness_v015_singleplayer`. The old save is only read during migration.

## Exact iPhone upload
1. Open live **v0.15**, go to **Bag → Export world**, and save the JSON backup to Files. Do not clear Safari data.
2. Keep your v0.15 ZIP for emergency rollback.
3. Download and extract this v0.16 ZIP in your iPhone Files app.
4. Open your Wilderness GitHub repository (the same existing one, same GitHub Pages URL).
5. At the repository root, replace **all** existing `.html`, `.js`, and `README.md` files from this package. Files such as `game.js` must be complete replacements, not snippets.
6. Add **`sky-camera.js`** at the same repository root as `game.js`.
7. Preserve / upload the six binary assets into the **`assets/`** subfolder, *not* beside `index.html`. If those six files already exist unchanged from v0.15, there is no need to re-upload them.
8. Commit to your deployment branch, typically `main`. Confirm GitHub Actions/Pages reports a successful deployment.
9. Open the existing game URL in Safari, refresh and confirm the header says **Single-player · v0.16**.

## Acceptance checklist
1. Existing v0.15 world, builds, tools, chests, wolves, resources, crops and discoveries migrate intact.
2. Tap + to zoom closer and − to zoom out, while walking and while standing still.
3. Zoom buttons do not block the movement joystick, Jump, combat or gathering.
4. Sun is visible when in the sky by day; moon is visible in the sky at night; day/night clock and sleep work.
5. Camera still pulls forward near cabin walls and cave rock rather than clipping through them.
6. Save, close Safari, reload, and export / import preserve the current world.
7. Normal and Low Effects remain usable; iPhone frame rate stays acceptable.

## Rollback and safety
The v0.15 browser save has not been overwritten by migration. To return to v0.15, restore the complete v0.15 ZIP and refresh the original URL. Progress made only in v0.16 will not automatically show in v0.15. Export JSON backups before changing versions. A malformed v0.16 save will stop the app from silently downgrading or overwriting the broken data. No remote backend is contacted for save storage; local saves and backups remain in effect.

## Technical limitations
This is a verified code candidate, not a claimed Safari GPU acceptance pass. The sun and moon are lightweight decorative sprites in the 3D sky, not photorealistic physically based celestial bodies. They may be off-screen depending on camera pitch/orientation. This release does not provide cloud sync, new enemies, world expansion, or campfire particles; those are staged independently.
