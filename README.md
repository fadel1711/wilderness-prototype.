# Wilderness v0.13 — Survival Foundation (Stage 1 of 3)

**This is a complete, ready-to-upload GitHub Pages replacement**, based on Wilderness v0.12. It does not overwrite your older Safari saves. **v0.13 focuses on hunger, thirst, energy and sleep—not new graphics or a physics engine.** The cave, character, building, farming, combat, and map systems remain included, with no new paid content, accounts, or Supabase requirement.

## The three-release upgrade

1. **v0.13: Survival foundation (this ZIP).** Food, clean water, hunger, thirst, energy, spring, bed sleeping and Creative Comfort. Separate save and easy rollback.
2. **v0.14: Movement + physical interactions (after acceptance).** Improve gravity/jumping, movement response, terrain contact, meaningful collisions, and object interactions. Keep existing homestead positioning and accessible controls.
3. **v0.15: Art pipeline + visual benchmark.** Cohesive authored 3D models (e.g. licensed GLB assets), material quality, richer environment, improved lighting and animations, tested in one village/forest/cave benchmark before spreading to the whole world. The user-provided game image is *directional reference*, not a claim of equivalent output.

## v0.13 features

- Compact **Hunger, Thirst, Energy** meters under existing Health and Stamina.
- Slow need depletion **only while the game is actively playing**. No offline drain, no hunger/thirst deaths. Critically low needs make the character slightly slower and stamina recover a bit more slowly.
- **Eat or drink:** open Bag and tap a carrot, potato, egg, vegetable stew, or bottled clean water. One item is consumed and the relevant meters recover. Wheat is a cooking ingredient, not eaten raw.
- **Freshwater spring:** located southwest of the starting homestead around X=-5.6, Z=-6.2. Walk close until “Freshwater spring” appears and press **Drink**; instantly restore thirst and collect three water portions into the backpack if room permits. A blue pond ring marks it; it intentionally has no blocking collider. If an old building overlaps it visually, it does not prevent existing structures from loading.
- **Starter supplies:** a new or freshly upgraded v0.13 world receives four water portions and four carrots *once*, added only in the new v0.13 save. Previous inventory/resources and older save keys stay untouched.
- **Bed sleep:** walk up to any previously built or newly built bed, press Use, then **Sleep until 07:00**. This advances the existing day/night clock, replenishes energy, health and stamina, and adds a temporary comfort bonus. In survival mode sleeping slightly reduces hunger and thirst; in Creative Comfort this reduction is disabled.
- **Creative Comfort:** open Bag → Game settings → toggle **Survival Needs: On / Creative Comfort: On**. In Creative Comfort needs do not drain; existing values are retained. The setting persists as part of the v0.13 save.
- Simple low-resource water-source models; no new engine, external image assets, or cloud dependency. Existing Three.js CDN is still needed to run the game.

## Package contents (13 root-level files)

- `index.html` — full game UI and v0.13 boot diagnostics
- `game.js` — complete runtime including survival interactions and save flow
- `save-system.js` — v0.13 save schema, item definition and old-save migration
- `survival-system.js` — **NEW**, independently testable needs/food/sleep rules
- `construction.js`, `craft-system.js`, `combat-system.js`, `exploration-system.js`, `farm-system.js`, `atmosphere-system.js`, `visual-system.js`, `cave-art.js` — complete compatible files
- `README.md` — this file

## Beginner-friendly iPhone GitHub upload instructions

1. Open your existing **v0.12** Wilderness site in the same non-private Safari tab you normally use. Go to **Bag → Export world** and save the downloaded JSON in iPhone **Files**. Keep your original `wilderness-prototype-v0.12.zip` available for rollback.
2. Download the `wilderness-prototype-v0.13.zip` file from ChatGPT and **Uncompress** it in the iPhone Files app. You will see 13 files directly in the extracted folder.
3. Open the **same** Wilderness GitHub repository. Go to the directory containing the existing `index.html` (usually the repository root; do not create a nested `v0.13` folder).
4. **Replace all 12 existing files from your v0.12 deployment**, using the complete files from this archive: `index.html`, `game.js`, `save-system.js`, `construction.js`, `craft-system.js`, `combat-system.js`, `exploration-system.js`, `farm-system.js`, `atmosphere-system.js`, `visual-system.js`, `cave-art.js`, and `README.md`.
5. **Add** `survival-system.js` beside `game.js`. Confirm spelling exactly.
6. Commit the files to the GitHub branch your site publishes (often `main`). Check **GitHub → Actions** for the successful Pages build/deploy.
7. Open your existing GitHub Pages URL in Safari and refresh. The top-left header must read **Single-player · v0.13**. Do not delete website data, open a private tab, or change your Pages domain.
8. If the game fails to start, do **not** clear Safari's data. Screenshot the error panel and confirm all 13 files are in the same directory and from the same ZIP.

## Save migration and rollback

- **v0.13** stores data at `wilderness_v013_singleplayer`, schema version **12**.
- The **v0.12** save remains under `wilderness_v012_singleplayer`, schema version **11**; migration reads it but never overwrites its key.
- v0.13 imports older-world JSON backups and validates the new hunger/thirst/energy state. Invalid data is rejected rather than silently replacing your world.
- v0.13 import undo has its own recovery key `wilderness_v013_pre_import_recovery`.
- To roll back, first **export your latest v0.13 world**. Re-upload **all files from your complete v0.12 ZIP** to the same GitHub repo, commit, and refresh the same site. It will open your unchanged earlier v0.12 save. Changes made **only** in v0.13 cannot appear in v0.12; they remain saved under the separate v0.13 key for when you return to v0.13.
- Browser storage is device/profile-specific. JSON export is the safest portable backup.

## iPhone acceptance checklist

1. Existing v0.12 buildings, equipment, chests, crops, cave treasure, map markers and time of day persist.
2. Hunger/thirst/energy meters appear without covering map, joystick, or build controls in portrait and landscape.
3. Need meters drain slowly in Survival Needs mode, but stay fixed in Creative Comfort. No offline drain.
4. Tap food/water stacks in Bag to consume one and restore the appropriate meters; food stock decreases correctly.
5. Locate the freshwater spring southwest of home, drink and collect water.
6. Walk up to a bed and Sleep until 07:00; clock advances, health/stamina/energy recover, save retains progress.
7. Combat, crafting, construction, raising floors/stairs, farming, cave exploration and maps still work.
8. Save, refresh, export/import and undo-import work. Preserve original v0.12 JSON and ZIP.
9. iPhone performance remains acceptable with Standard and Low Effects settings.

## What was actually verified

Before packaging: JS syntax, pure survival rules, old-save migration (including structures/chests/crops/discoveries), strict save validation, exported-backup roundtrips, file/HTML references and ZIP contents. **Actual iPhone Safari/WebGL rendering, touch control layout, sound, frame rate, and whole-game behavior must be validated by the user.** This is a candidate, not a declared production-ready final release.
