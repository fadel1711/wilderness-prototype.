# Wilderness v0.23.5 — Portable & Standing Torches

This is a **complete 38-file GitHub Pages replacement**, not a partial patch. Existing landscape mode, villages, deep cave, building editor, combat controls, and account-first Cloud Save are kept.

## New gameplay

- **Explorer torch**: Craft at a **workbench** for **2 wood + 1 charcoal**. Equip from the right-side toolstrip (`🔥 Torch`) or Bag. Tap the contextual **Fuel / Light / Extinguish** button to illuminate your way. Burn **1 charcoal for 240 seconds** of active play. The torch is a permanent reusable tool.
- **Standing torch**: Build > **Standing Torch**, costing **2 wood + 1 stone**. Approach and press **Interact / Gather**, then **Add charcoal** to light it, or extinguish/relight it. It keeps remaining fuel and position across save/reload.
- **Graphics**: Small animated flame meshes, up to three nearby non-shadow point lights, and at most 24 drifting smoke quads. Effects Low reduces particles and brightness. This is efficient visual approximation, not simulated fluid dynamics.
- Fuel does not burn in the background or while paused. No zombie/night combat behavior is added here.

## Critical installation order (iPhone)

1. In working v0.23.4, open **Bag → Export world**, save the JSON. Keep a copy of the old ZIP.
2. **Supabase FIRST if using Cloud Save**: open the **separate private v0.23.5 backend ZIP**, read `README_PRIVATE.md`; run the **forward migration** in your **Wilderness** Supabase project, then the **read-only verification**. **Never run emergency rollback as part of normal install**. No live database changes are performed by Rosa.
3. Extract this GitHub ZIP in Files. At repository root, **replace all** HTML, JS, README/ROADMAP files. **Add `torch-system.js`** beside `game.js`, `save-system.js` and `building-editor.js`. Keep `assets/` with six `.glb`/`.webp` files.
4. Commit. Wait for successful GitHub Pages deployment. Reload Safari in landscape and verify header **v0.23.5**. Do not clear website data.
5. Visit workbench, craft torch; then test handheld fuel/toggle, build standing torch, add charcoal, refresh, and test cloud syncing.

## Save safety

- New local save is **`wilderness_v0235_singleplayer`**; prior **`wilderness_v0231_singleplayer`** is left intact for rollback.
- New JSON save version **22**, with validated `torches` state, enables persistent portable and standing lights. v21 data is upgraded on load. Old player buildings/chests/outfits/campfire states are untouched.
- Cloud automatic account behavior is unchanged, but **Supabase must accept version 22 BEFORE uploading the new game** or cloud autosaves will fail. Cloud conflict protection still applies to truly independent changes.
- Do not play an older client on the same cloud account after creating torch items or builds.
- Save backups in Files; do not rely only on cloud sync when testing new versions.

## Acceptance checklist

1. My original v0.23.4 world remains intact after migration.
2. Workbench crafts Explorer Torch, costs exactly two wood and one charcoal.
3. Torch can be equipped, and lighting/refueling consumes charcoal only when needed.
4. I can walk + jump while using the torch.
5. Torch visuals illuminate dark areas and Low Effects are manageable.
6. Build > Standing Torch can be placed, lit, extinguished and fueled.
7. Fuel persists after refreshing and does not decrease offline.
8. Building Editor can move standing torch without losing its identity/fuel.
9. Cloud saves automatically and restores on a second device.
10. Sword combat, villages, Bag, chests and joystick recovery still function.

Developer tests verify schema, resource transactions and file checks only. Live iPhone Safari WebGL and live database migration are not verified here.
