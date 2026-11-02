# Wilderness v0.12 — Visual Rebuild / Phase 1: Echo Cave

**Full ready-to-upload GitHub Pages replacement.** This is the *first benchmark zone* of a serious art rebuild, not a complete professional-asset conversion of the entire game. Gameplay is unchanged. Existing Safari saves are not erased or overwritten during migration.

## What actually changed

- Replaced the previous rectangular cave floor/walls/roof with a faceted, naturally arched tunnel mesh and an irregular exterior stone hillside.
- Created an integrated rocky mouth, rough cliff faces, graded approach trail, small stones, mossy vegetation, stalactites and two warm torch glows. New rock textures are generated locally from bundled code.
- The roof and tunnel ceiling hide when the player is inside, while side walls remain visible. The camera can continue to follow the player.
- Kept the cave entrance, interior, treasure coordinates, game interactions, compass discovery, collision constraints, and walking ground height unchanged.
- Optional Low Effects setting hides most cave decorations and disables the cave point lights. Point lights also turn off when the player is away from the cave.
- Existing v0.11 character, home/cabin visuals, crafting, farming, combat, map, day/night, sound and save features are included unchanged.

This is **Phase 1**, a cave-focused visual quality benchmark. It does not claim photorealistic terrain, imported custom character animations or full AAA-quality art. These 3D shapes are still procedural. If you like the new cave direction, future phases can replace the wider forest, buildings and character assets using proper authored 3D models. One visually consistent benchmark is more useful than claiming the whole world is rebuilt prematurely.

## Exactly what is inside (12 files)

- `index.html` — full HTML/UI and v0.12 startup diagnostics
- `game.js` — complete game including v0.12 cave integration
- `cave-art.js` — **NEW** cave geometry and detail module
- `save-system.js` — separate v0.12 save and older version migration
- `construction.js`, `craft-system.js`, `combat-system.js`, `exploration-system.js`, `farm-system.js`, `atmosphere-system.js`, `visual-system.js` — complete compatible versions
- `README.md` — this file

No Supabase update, login, purchases, new repository, images or asset license files needed. The game continues to use Three.js from its existing CDN; internet is needed to load that library.

## iPhone: upload all files safely

1. In your running **v0.11** game, tap **Bag → Export world** and save the `.json` file in your iPhone's Files app. Keep the v0.11 ZIP as a rollback copy.
2. Download the v0.12 ZIP and tap **Uncompress** in Files.
3. Open the **existing** Wilderness GitHub repository (the one serving your GitHub Pages game).
4. In the folder that already contains `index.html` (usually the repository root), **replace these 10 files with the complete copies** from this package: `index.html`, `game.js`, `save-system.js`, `construction.js`, `craft-system.js`, `combat-system.js`, `exploration-system.js`, `farm-system.js`, `atmosphere-system.js`, `visual-system.js`.
5. **Add** `cave-art.js` to that same folder (don't place it inside a separate version folder). Also replace `README.md`.
6. Commit all changes to the branch deployed by GitHub Pages (normally `main`). Check the **Actions** tab for a successful GitHub Pages deployment.
7. Open your **existing** website address in Safari and refresh. Header should read **Single-player · v0.12**. Avoid clearing Safari website data, changing domain, or opening the game in a private browsing tab.
8. When the game starts, open the Map, choose **Echo Cave Entrance** as a waypoint, and travel to the cave. Enter and exit, view its walls from several camera angles, and open the cache only if it is still unclaimed.

## Save protection and rollback

- New v0.12 key: `wilderness_v012_singleplayer`, schema version `11`.
- The earlier v0.11 key is **read-only on migration**: `wilderness_v011_singleplayer`, schema version `10`.
- Earlier saves remain in Safari. v0.12 uses a separate pre-import recovery key: `wilderness_v012_pre_import_recovery`.
- To roll back: keep/export the latest v0.12 JSON file, replace all GitHub files with your **complete v0.11 ZIP**, and refresh the **same** site. The old v0.11 save will be loaded; progress made only in v0.12 won't show in v0.11.
- The game saves to the device/browser, not GitHub. Never clear website storage to solve a startup error. If a save is invalid, capture the exact error and don't overwrite it.

## iPhone acceptance checks

1. v0.11 buildings, character location, equipment, chests, farming, loot claims, discovered map locations, and settings survive the migration.
2. Cave entrance looks more natural and you can walk **through** it (no hidden rock obstruction).
3. Cave interior is navigable; walls block walking through them, and the third-person camera shows the survivor while indoors.
4. Cave cache is still in its original location and cannot be collected twice.
5. Standard vs Low Effects both work; compare FPS, heat and responsiveness near the cave.
6. Original homestead, combat, farming, construction, map, day/night and sound still work.
7. Saving, page refresh, world JSON export/import and rollback all work.

## Verification notes

- JavaScript syntax and package consistency checks are performed before delivery.
- Pure save-migration tests check older-world structures, inventory, chests, farming, exploration and atmosphere.
- The new cave module is exercised under a fake Three.js runtime to verify geometry and quality toggles.
- Full Three.js rendering on your actual iPhone/Safari is **not verified here**; visual quality and in-game collision/camera behavior require your acceptance test.
