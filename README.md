# Wilderness v0.11 — Premium Stylized Adventure

**Full replacement package — graphics only.** This is a visual revision to the v0.10 game, not a fresh game or an experimental engine switch. The current project is a Three.js/WebGL browser prototype hosted on GitHub Pages. It still requires a network connection to load Three.js from the existing CDN.

## Contents (11 files)

- `index.html` — visual UI polish, v0.11 label and startup diagnostics
- `game.js` — replacement complete game including upgraded character/tree/building visuals
- `visual-system.js` — NEW: procedural textures, gradient sky and low-cost instanced grass
- `save-system.js` — versioned, separate v0.11 save slot, reads older saves
- `construction.js`, `craft-system.js`, `combat-system.js`, `exploration-system.js`, `farm-system.js`, `atmosphere-system.js` — complete compatible files
- `README.md` — this guide

## What's changed visually

- New stylized terrain textures with more natural moss/grass colors, stone flecks, wood planking, roof shingles and cloth texture
- Layered foliage silhouettes: irregular broadleaf crowns and tiered evergreens with organic tufts
- More believable survivor silhouette with hood/collar, layers of clothing, leather straps, belt, pouch, gloves, boots and pack
- Cabin timber framing, roof ridge/eaves, windows, lantern detail and modular structure edging
- Gradient sky with daytime and twilight colors that follow the existing time cycle
- Instanced ground vegetation and automatic distant-tree detail reduction; Low Effects also disables added detail
- Subtle UI treatment. All joystick/build/combat/button positions stay familiar

**Important limitation:** These assets remain procedurally created low-poly meshes, not artist-built/rigged character and world assets. This is a substantial improvement in design and material cohesion but cannot match a professional asset library or AAA-grade animation. No promises about frame rate without a device test.

## Upload from iPhone (manual, safe)

1. In the running **v0.10** game, go to **Bag → Export world** and save the JSON backup to iPhone **Files**. Do not skip this step.
2. Keep the working **v0.10 ZIP** in Files as a rollback package.
3. Download and **extract this v0.11 ZIP** in Files.
4. In your existing Wilderness GitHub repository, open the folder currently containing `index.html`. All files below must be uploaded together into **that same folder** (normally repository root), **not** inside a new `v0.11` folder.
5. Replace these **9 existing files** with the corresponding complete new copies: `index.html`, `game.js`, `save-system.js`, `construction.js`, `craft-system.js`, `combat-system.js`, `exploration-system.js`, `farm-system.js`, `atmosphere-system.js`.
6. **Add** the new `visual-system.js` in that same folder and replace `README.md`. Final website folder: **10 files excluding README, 11 including README**.
7. Commit to the branch GitHub Pages actually deploys (normally `main`). Verify **GitHub → Actions** has completed its Pages deployment, then open the original game URL. It should say **Single-player · v0.11**.
8. If the browser still shows v0.10, reload Safari and check GitHub Pages finished deploying. Do **not** clear Safari website data.

## Save safety and rollback

- New save: `wilderness_v011_singleplayer` (schema version 10).
- Migration source: `wilderness_v010_singleplayer` (schema version 9). The old key is **read only**.
- The older save remains available in Safari. New progress in v0.11 is not automatically merged back into v0.10.
- The game's import recovery key is separate: `wilderness_v011_pre_import_recovery`.
- If v0.11 misbehaves, keep your exported backup, re-upload the full v0.10 package, and reload your original game website. This reopens the earlier saved world.
- Do not delete GitHub Pages data or change domains. Saves are per browser/origin and are not synced to an account.
- If v0.11 reports an invalid save, **do not import a new one over it blindly**. Keep the original JSON and send the error message.

## Suggested iPhone acceptance test

1. Start v0.11 and confirm previous v0.10 world, position, structures, chests, inventory, farm and discoveries are present.
2. Compare the survivor, trees, roof architecture, wood/stone textures, sky and grass. Confirm the difference is noticeable and cohesive.
3. Explore around cabins/trees, pass through raised doorways, climb steps, and check the camera.
4. Build modular walls/roofs and confirm the decorative overlays do not block placement or break indoor visibility.
5. Test both Standard and Low effects on your iPhone. Watch for stutter and overheating.
6. Test gather, fight, craft, farm, caves, map, waypoint, and rest. No gameplay changes are intended.
7. Save, refresh, export JSON, and verify the earlier v0.10 browser world remains recoverable.

## Technical checks

Code syntax, save migration and archive integrity are checked prior to delivery. Browser 3D rendering on your physical iPhone/Safari still needs your acceptance test. None of these procedural textures require additional image files or paid assets.
