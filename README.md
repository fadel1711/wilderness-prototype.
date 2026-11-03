# Wilderness v0.15 — Premium Art & Dual-Thumb Controls

**Complete, manually uploadable GitHub Pages package.** This upgrade is based on player-accepted v0.14. It adds simultaneous mobile touch commands and a bundled visual art pass; no new gameplay, payment systems, authentication, or Supabase changes.

## Key improvements

**Dual-thumb controls**

- Hold the left joystick to move continuously and **tap Jump with your other thumb**. Both actions are processed in the same game frame.
- Move + Attack, Move + Dodge, and Move + Gather / Use also work concurrently.
- Hold Block while moving to guard as you reposition.
- The **Jump** button has moved to the right side of the screen above the main action buttons for a comfortable two-thumb layout.
- Mobile actions use `pointerdown` rather than waiting for a synthesized click. Pointer identifiers are tracked separately; pointer-up and cancelled touches are safely released.
- Mouse clicks and the usual keyboard controls continue working.

**New bundled original 3D and texture art**

- Three compact GLB nature models in `assets/`: new forest pine tree, broadleaf tree, and clustered moss-covered boulder. They are **self-authored meshes** generated for Wilderness; they are not pulled from, copied from, or claimed to match another game's artwork.
- Three local painted WebP textures: forest floor, masonry/stone path, and wooden planks.
- Standard effects uses the new 3D forest models near the player; distant trees use existing low-cost silhouettes. **Low Effects** preserves the lightweight v0.14 models to reduce work on older phones.
- If optional GLB or texture assets cannot load, the game keeps the original shapes rather than failing to launch. Three.js itself still loads over its existing CDN connection.

**Scope and quality honesty:** This is a *meaningful new art-asset integration*, but not yet a studio-authored character animation suite, high-fidelity terrain engine, advanced rigid-body engine, or screenshot-equivalent AAA art. Those would require substantially more custom modeling/art direction, real device profiling and iterative correction.

## Files in ZIP — upload ALL of them

**Existing files to replace (15):**

`index.html`, `game.js`, `save-system.js`, `construction.js`, `craft-system.js`, `combat-system.js`, `exploration-system.js`, `farm-system.js`, `atmosphere-system.js`, `visual-system.js`, `cave-art.js`, `survival-system.js`, `movement-system.js`, `seed-system.js`, `README.md`.

**New code files to add (2):** `dual-input.js`, `premium-assets.js`.

**New `assets/` folder with six files:**

- `assets/pine.glb`
- `assets/oak.glb`
- `assets/moss-boulder.glb`
- `assets/forest-ground.webp`
- `assets/stone-path.webp`
- `assets/timber-planks.webp`

**Total: 23 files.** Do not upload only `index.html`, omit the assets folder, or rename `.glb` / `.webp` files.

## Exact iPhone GitHub installation

1. Before uploading, open the current **v0.14** game in Safari, then **Bag → Export world**. Save the JSON backup into the iPhone Files app, outside your Downloads cleanup folder if possible.
2. Keep a copy of the complete **v0.14 ZIP** for rollback.
3. Download and **extract** the complete v0.15 ZIP using the iPhone Files app. Its files are stored at the ZIP root; `assets/` is an actual folder. Do not put an extra `wilderness-prototype-v0.15/` folder into your GitHub repository.
4. Open your existing Wilderness GitHub repository in Safari. Use **Add file → Upload files** (or the GitHub website's file upload control) to upload the complete replacement set to the **same repository root** as the existing `index.html`. On mobile, if GitHub cannot select folders, upload the `assets/` files individually to `assets/` using the desktop view / web upload, or create the `assets` folder first and then upload its six files. Do **not** paste the binary GLB/WebP files into the GitHub text editor.
5. Replace all 15 existing files, add both new JavaScript files, and upload the six assets in the `assets/` folder. Confirm filenames and capitalization exactly match the list above.
6. Commit the changes to your existing deployment branch, usually `main`. Confirm the **Actions** workflow / GitHub Pages deployment completes successfully.
7. Open your **existing** Pages game URL. Refresh, and check the header says **Single-player · v0.15**. Preserve Safari website data and your current site URL.
8. Open **Bag → Game settings**. Try **Effects Standard** first to view the new models, then switch to **Effects Low** if your iPhone gets warm or the frame rate is uncomfortable.

### If the site fails to load

- Check that `index.html` and all **15 JavaScript modules** are present at the repository root and that `assets/` contains the six correct files. A wrong module name will stop startup, but a missing optional model/texture is designed to fall back gracefully.
- Refresh after GitHub Actions finishes. If the startup error persists, send Rosa a screenshot of the full message.
- Do **not** delete Safari site data to fix cache issues.

### Save migration and rollback

- Your v0.14 world remains under `wilderness_v014_singleplayer`. v0.15 migrates a **copy** into `wilderness_v015_singleplayer` and uses the new key for future progress.
- Your existing buildings, chests, crafting, farming, combat, survival, cave discoveries and foraging remain in the same save format and coordinates.
- If you need to revert, replace the repository files using the complete v0.14 ZIP and refresh the existing website. Your original v0.14 browser save should still be available.
- v0.15-only progress will not appear in the older build. Export JSON backups before either direction.
- Data lives locally in Safari, not on a server; exporting it remains the only portable backup.

## Acceptance checklist for v0.15

1. v0.14 world, raised cabin, resources, inventory, chests, crops, and survival meters migrate safely.
2. Hold the joystick and tap Jump with a second finger; both walking and jumping happen together.
3. Hold the joystick and tap Gather / Use with a second finger, without releasing movement.
4. Equip sword and hold the joystick while tapping Attack, Dodge and holding Block; no phantom extra actions or stuck movement.
5. Camera, stair collision, cave access, wolves, crafting, and sleep still function.
6. On Effects Standard, the trees / boulders and stone / wood surfaces visibly update; on Low the simpler foliage returns.
7. Game still runs smoothly on iPhone in both portrait and landscape; no overlapping Jump / action buttons.
8. Save, refresh, world JSON export / import and rollback protection work.

### Technical validation performed

JavaScript syntax, asset format parsing, module-path checks, and save/multi-pointer unit tests can be performed without Safari. Full GPU rendering, live frame rate, touch interaction hardware details and visual quality **must be checked on your actual phone**, and this build should not be considered accepted until you complete those tests.
