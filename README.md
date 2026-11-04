# Wilderness v0.22 — Double World + Joystick / Camera Recovery

**Full GitHub Pages game replacement.** Every .js/.html file and all six original GLB/WebP assets are included. Cloud SQL is in a **separate private ZIP**; do not put SQL on GitHub Pages.

## What changed

### 1) Fix for stuck joystick and frozen camera gestures (priority)
- Joystick and camera gesture use an explicit pointer owner and are released on global `pointerup`, `pointercancel`, `lostpointercapture`, browser blur, pagehide, orientation change, and interrupted iOS touch sequences.
- Movement zeroes out immediately when a gesture stops; moving the same finger on the joystick and tapping Jump with another still works.
- Opening Bag, Map or Build clears stale control state before the panel opens.
- New unobtrusive **↻ Unstick** button just to the right of the joystick: one tap resets joystick, camera-drag ownership, held block, queued jump and keyboard input **without refreshing and without touching your saved world**.
- Added `input-recovery.js`; existing `dual-input.js` is retained. This addresses stuck input state; it is not a guarantee against hardware freezes, Safari crashing or WebGL GPU context loss.

### 2) World expands x2 in each horizontal dimension
- World half-width is now **172m versus 86m**, a traversable **344×344m** square compared with **172×172m** before: **4× the total land area**. The homestead remains at (0,0).
- **Four new map discoveries:** Westwood Thicket, Northreach Pines, Sunstone Flats, Willowmere Fields. The areas have deterministic, collectable outer trees and mineable rocks, additional ground vegetation, and recognizable clearings.
- New, stable outer resource IDs are `et0..et101` and `er0..er53`. All existing `t0..t73`, `r0..r50`, buildings, cave treasures, campfires, seed patches, furniture, and two-storey homes remain at their historical coordinates. New scenery doesn't consume the historical random placement sequence.
- Optimized low-cost outer tree proxies and distance-dependent 3D models on Standard Effects; the original low graphics option remains available.
- Building placement now reaches the new world edges, still with the 500-piece total safety limit. Fog/sky/ground resized so the camera remains inside a consistent environment.

### Save and cloud
- Separate Safari key **`wilderness_v022_singleplayer`**, previous **`wilderness_v021_singleplayer`** remains untouched.
- JSON backup save `version:21` (v0.21 JSON was `version:20`). JSON import/export, upstairs height, closets, chests, existing mining progress and discovery list remain supported.
- Account-first automatic cloud sync stays. Newly generated full-health outer resources do not count as independent progress for the cloud conflict comparison.
- If Cloud Save is enabled, apply **the separate v0.22 Supabase migration first**, then the game ZIP. The SQL only adds admission for JSON version 21; no new tables or account changes.

## Exact iPhone upload steps

1. In the **working v0.21**, Bag → Export world. Keep its JSON backup AND the old v0.21 ZIP. Do not clear Safari website data.
2. If you use Cloud Save, **first** open the **private Supabase v0.22 ZIP** and follow `README_PRIVATE.md`: run `wilderness_v022_cloud_format.sql`, then the read-only verification. **Do not run emergency rollback.** If you don't use Cloud Save, skip SQL.
3. Download the complete public **Wilderness v0.22 GitHub ZIP**. In iPhone Files, tap the ZIP to extract it.
4. In your existing Wilderness GitHub repository, replace **all** existing root HTML/JavaScript files with the matching new files. Add **`world-expansion-system.js` and `input-recovery.js`** at the root next to `game.js`. Do not upload a nested `wilderness-prototype-v0.22` folder inside your repository.
5. Keep `assets/` at the repository root containing all six `.glb` and `.webp` files from the ZIP; upload missing ones into that folder only.
6. Commit on your GitHub Pages branch (usually `main`), confirm deployment, and refresh the SAME game URL in Safari. Header must read **Single-player · v0.22**. The startup version checker is also updated to verify the new modules.
7. Move and rotate the camera with two thumbs, try Jump/Attack while moving, and test **↻ Unstick** while walking. Open/close Bag and Map; the controls should be fresh each time.
8. Open Map → select the four new locations; walk into each region, harvest a tree/mine a rock and check the map markers. Build near an outer edge and save/refresh.
9. Open Bag → Account & Cloud Save, ensure it automatically backs up. If an actual conflict appears, export before choosing; don't overwrite independent worlds without review.

## Required iPhone acceptance tests

1. Old v0.21 homestead, upstairs furniture, campfires, maze, mining, crops, clothing and inventory are unchanged.
2. Hold movement and Jump/Attack simultaneously, release either finger in either order, repeat; no stuck axis or frozen camera.
3. Open Map/Bag mid-movement: the joystick recenters and movement stops. Tap **↻ Unstick** when needed.
4. Background Safari mid-gesture, then return: controls are released, not held forever.
5. Four new outer landmarks appear on the full map and can be discovered, and outer resources can be gathered.
6. Walk the original perimeter (~86m) without hitting a wall; the new boundary is ~172m.
7. Build and save beyond the old map; refresh restores the same coordinates and buildings.
8. If cloud enabled: auto-sync and a second-device restore work without routine manual selection.
9. Test both Standard and Low Effects for acceptable iPhone performance.

## Testing limitations

Automated unit/integration tests cover deterministic outer resource placement, old-save migration, resource IDs, new world bounds, input release, cloud-conflict classification, import references, syntax, and archive integrity. Actual touch and WebGL performance must be tested in Safari. The new outer regions are deliberately exploratory landscapes, not yet NPC villages or dungeons; v0.23 is the village milestone.
