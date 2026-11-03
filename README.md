# Wilderness v0.21 — Second Floors & Bigger Modular Homes

A full, ready-to-upload **GitHub Pages** game update. Includes **every HTML/JS file** plus all six existing assets. This is the complete game, **not** an incremental patch, generator, or code snippet.

## What changed

- **Actual second-floor platforms**, built with `Upper Floor` pieces at roughly 3.32 m above ground, with collision that lets your survivor stand upstairs and still walk underneath.
- **Upper Wall, Upper Door, Upper Window and Upper Roof** pieces to create enclosed rooms above your existing modular construction.
- **Tall Stairs**, a 12-step ramp reaching a second-floor landing, with character gravity, walkable rise and proper collision.
- **Bigger modular homes**: extend ground/upper rooms across 2×2-metre tiles rather than being restricted to a single prefab cabin.
- **Two-Storey Starter** blueprint: a complete, small two-level structure costing **38 wood and 10 stone**. Find it in Build → Ready-made blueprints. You can continue expanding it afterward.
- **Upstairs interior furniture**: workbench, storage chest, table, chair, bed and shelf can be placed on the upper floor. Choose one, then use the **Ground/Upstairs** toggle in placement controls; default switches to upstairs when you are already on that level. Fires and furnaces stay downstairs.
- **Structural safety**: upper floors require underlying floors and wall support. Removing supports is blocked if a loft, staircase, roof or upstairs furniture still depends on them.
- **Saved second-floor positions**: if you save while upstairs, you reload upstairs. Old v0.20 building IDs, storage, farmland, campfires, deep cave progress, wardrobe and local/cloud worlds are preserved by the v0.21 migration.
- **Automatic account sync** follows the v0.19.2 design, including actual conflict protection, local fallback, and cloud restoration. No extra cloud/device choice added.

### Limitations

- **Prefab cabins cannot be stacked** because their existing pitched roofs occupy the space. Make two-storey houses using the modular building pieces or the Two-Storey Starter.
- Buildings still have a **500-piece world limit** for mobile performance.
- This is a lightweight custom character physics system, not a full rigid-body simulation. Multi-level traversal requires iPhone testing.
- Existing models and graphical fidelity are unchanged in this construction-focused release.

## Exact manual installation on iPhone

1. In **working v0.20**, open **Bag → Export world** and save the JSON backup in iPhone Files. Keep your working v0.20 ZIP for fallback. Don't clear Safari website data.
2. **If Cloud Save is enabled**, first download the **separate v0.21 private Supabase ZIP** and follow `README_PRIVATE.md`. Run the **forward** `wilderness_v021_cloud_format.sql`, then `verify_v021_readonly.sql` in your Wilderness Supabase project. **Do not run emergency rollback SQL.** If you aren't using Cloud Save, skip SQL entirely.
3. Download this **complete public v0.21 ZIP**, open it in iPhone **Files**, and extract the folder.
4. Open your existing Wilderness repository in GitHub Safari. Upload and **replace the existing `index.html`, `game.js`, every other `.js`, plus `README.md`/`ROADMAP.md`** with all same-named files in this ZIP. Add the new file **`second-story-system.js` beside `game.js`**. GitHub uses one file per path; do not create a nested `wilderness-prototype-v0.21/` folder inside the repository.
5. Keep an `assets/` folder in the **repository root**, with all six `.glb`/`.webp` files from this ZIP. Do not rename them or place them beside `index.html`.
6. Commit your changes to your GitHub Pages deployment branch (often `main`). Wait until GitHub Pages/Actions has finished deploying, and reload the **same game URL** in Safari.
7. Confirm the header says **Single-player · v0.21**. If it says v0.20, verify the deployment and hard refresh; do not delete browser storage. A built-in startup check also warns when mixed old/new JavaScript modules are detected.
8. Open Build → Ready-made blueprints → **Two-Storey Starter**, find a clear area and tap Place. You may need Bag → refill creative supplies if short of materials. Walk up the staircase, build extra upper-floor rooms, and try a bed/chest upstairs.
9. Verify Bag → Account & Cloud Save says **Automatic sync on** (if connected), and test saving/reloading and a second device only after the first cloud sync succeeds.

## Suggested iPhone acceptance test

1. Existing v0.20 settlement, chests, crops, cave mining, clothing, campfires and survival needs all load unchanged.
2. Two-Storey Starter places without an error, in a clear space.
3. Joystick + Jump still works, and you can **walk all the way up the tall stairs** without teleporting, hitting invisible walls, or falling through a gap.
4. You can stand on the upper floor, walk underneath it on the ground, and descend the stairs.
5. You can make a wider upper room, add upper windows and a roof, and place a chest and bed upstairs.
6. Upper furniture, its contents, and your upstairs position survive Save → Safari refresh and JSON export/import.
7. Removing a supporting floor/wall while a loft depends on it is correctly blocked. Removing an unrelated piece refunds its resources.
8. Cloud autosaves and restores without a routine cloud/device prompt; iPhone frame rate remains usable in Standard and Low Effects.

## Save and backup details

v0.21 local save slot: `wilderness_v021_singleplayer`, JSON format `version:20`. The previous `wilderness_v020_singleplayer` slot is read-only during migration and remains for rollback. Before a cloud restore, the existing local copy gets a separate recovery snapshot. Imported backups are validated before replacing a save; keep an exported JSON before upgrading.

## Code notes

New `second-story-system.js` contains structural rules, stair rise/profile and upper-floor support checks. Existing ground-piece geometry and v0.20 save semantics remain. Cloud Save's established baseline key is deliberately unchanged to avoid introducing another login/sync conflict.

**Verification performed:** automated unit tests for placement/support, ramp ascent, migration, upstairs furniture, legacy-world preservation and automatic-sync decisions; syntax and package integrity. **Not verified:** actual rendered graphics, iOS Safari touch/camera physics or live Supabase database writes (manual acceptance required).
