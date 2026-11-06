# Wilderness v0.23.4 — Long-Press Building Editor

This is the **complete GitHub Pages release**. Upload the files at the repository ROOT, keeping `assets/` as a folder. The ZIP is not an incremental patch.

## What changed

- **Long-press an existing structure** on the 3D screen for about 0.56 seconds to select exactly that building piece (within roughly 9 metres). A glowing outline shows the piece selected.
- **Move** with the four arrow controls (2-metre structural grid; 1-metre for furniture and campfires), **Rotate** by 90°, then press **Save Position**. Tap **Cancel** to restore the original position.
- **Dismantle** removes only the selected piece, after an explicit confirmation, and refunds its building cost. Empty chests first to avoid losing stored items.
- In Build's piece picker, **Edit nearest** is an alternative when finger selection is awkward.
- A gesture that turns into a swipe cancels the long-press and continues as normal camera dragging. Touch cancellation/rotation clears the gesture.
- Moving a chest or campfire preserves its original ID, chest contents, campfire fuel and lit state.
- Moving a load-bearing wall/floor or an upstairs support is refused when it would break an existing building; unsafe or overlapping placements are blocked. Village land cannot be edited into.

## Compatibility and rollback

- The v0.23.1-v0.23.3 browser **save key and database JSON schema version 21 are unchanged**. No Supabase migration is needed. Existing account-first automatic sync is unchanged.
- Existing villages, loot, world size, combat controls, survival, Echo Cave, and second-storey pieces remain as they were.
- **Export a world backup BEFORE installing**. Save a copy of the v0.23.3 ZIP as a rollback option; restoring an older code release after editing may require re-importing your exported backup.
- Editor changes are saved only after pressing Save Position (or confirming dismantle). Cancel never writes a new building position.
- Never delete Safari site data.

## Install on iPhone — GitHub Pages

1. In your current v0.23.3 game, open **Bag → Export world**. Save the JSON file in Files.
2. Download `wilderness-prototype-v0.23.4.zip` and extract it in the iPhone Files app.
3. Open the Wilderness GitHub repository, upload **complete replacements** for all root files from the extracted folder. This time there is **one new file**, `building-editor.js`, next to `game.js` and `construction.js`.
4. Keep all six existing `.glb`/`.webp` files under `assets/` at the same relative paths. They are also included in this ZIP.
5. Commit, check GitHub Pages deployment, refresh Safari. The header should show **Single-player · v0.23.4**.
6. Start in landscape, approach one of YOUR buildings, hold your finger on it, move it, rotate it, cancel once, then try Save Position. Test a chest containing items and a supported upper floor. Verify auto Cloud Save still works.

**No Supabase SQL or cloud-config changes** are required for this release. Do not run prior emergency rollback SQL.

## Acceptance checklist

1. Existing world/cabins/chests/loft furniture/cloud account are preserved.
2. A long press opens the exact building piece, not a nearby village house.
3. A quick swipe still rotates the camera and the joystick does not freeze.
4. Cancel returns the model to its original position without changing the saved world.
5. Valid move/rotate saves and persists after refreshing Safari.
6. Filled chest can move without losing contents but cannot be dismantled until empty.
7. Trying to move a support underneath an upstairs room is blocked.
8. The landscape HUD and combat pad remain comfortable.
9. Automatic cloud saving still works between devices, with no sync-choice loop.

Technical syntax/logic/archive checks are not a substitute for live iPhone Safari testing. If the editor gets stuck, use **✕ Cancel** and the existing **↻ Unstick** control.
