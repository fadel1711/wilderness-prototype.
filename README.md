# Wilderness v0.4 — Construction 2.0

**Single-player · third-person 3D · free, no ads or purchases · GitHub Pages/iPhone browser**

This update **builds on the player-approved v0.3**. It keeps the same forest, natural colors, character controls, deterministic tree/rock locations, tools, backpack, resource gathering, cabin, collision behavior, and export/import system. No Supabase or online account is needed. The Three.js library still loads from jsDelivr, so the first page load requires an internet connection.

## Contents — ALL FIVE files are required

- `index.html` — complete interface and modular construction menu
- `game.js` — complete 3D game logic, character, forest, buildings, controls, camera
- `construction.js` — **NEW** snap rules, placement checks, resource prices
- `save-system.js` — **REPLACE** existing file; version-3 format and older-save migration
- `README.md` — this complete installation, verification and rollback guide

Upload the **individual extracted files** into the **root** of your existing Wilderness repository, not the ZIP and not a nested `v0.4` folder. All file names are lowercase and exact.

## What changed

Eight build choices: `Cabin`, `Foundation`, `Floor`, `Wall`, `Doorway`, `Window`, `Roof`, and `Steps`.

- **Hybrid foundation:** The original premade, walk-in cabin blueprint remains. Use new 2m modular tiles to build a separate room or home manually.
- **Smart snap:** Floors, foundations, roofs and steps snap to even-numbered 2m grid tile centers. Walls, doorways and windows snap to tile edges, changing alignment when you rotate 90°.
- **Positioning:** Four on-screen arrows shift the ghost preview relative to the camera in 2m increments. `Reset position` cancels those adjustments. Rotate turns it 90°.
- **Support rules:** Place a floor or foundation before its wall/door/window. A roof needs a floor beneath plus at least two neighboring wall edges. A staircase's high end must face an adjacent foundation.
- **Physical interaction:** Regular walls and window panels are solid; the middle of a doorway remains open. Raised foundations need steps to approach from below; character height changes smoothly while using them.
- **Interior roofs:** Modular roof panels disappear while your character stands below them, so you can view your room. Previous cabin roof behavior remains.
- **Material spending:** Building costs are deducted from your backpack only when a valid, affordable placement is confirmed. Green ghost = can build; yellow = insufficient resources; red = blocked/unsupported. Read the message for details.
- **World saving:** The new v0.4 save uses `wilderness_v04_singleplayer` (save format v3). The **old v0.3 save key** `wilderness_v03_singleplayer` and earlier v0.2 key `wilderness_v01_singleplayer` are **never changed by v0.4**. Older cabins, floor/wall pieces, inventory, resources, player position and tool selection are imported.
- **Backups:** Bag → Export world downloads `.json`; Bag → Import world validates backups (v0.2, v0.3, v0.4) and confirms before replacing. Undo last import keeps a separate v0.4 pre-import snapshot.

**Not in this version:** dismantling or recovering placed pieces, decorating, editing existing cabin blueprint geometry, saving reusable custom blueprints, complex terrain sculpting, advanced multi-story floors, combat, farming, multiplayer. Those are later goals. Stairs serve raised foundations, not full multi-story staircases.

## CRITICAL: Protect your existing world FIRST

1. **Before uploading v0.4**, open your *working v0.3 website on your iPhone*.
2. Tap **🎒 Bag → Export world**. Verify the JSON actually appears in iPhone **Files / Downloads**. Keep it as a backup. This matters because GitHub ZIPs are code backups, **not world backups**.
3. Keep the old v0.3 ZIP as your code rollback copy.
4. Use the **exact same Safari profile and GitHub Pages URL** after the upgrade. Browser saves are tied to that website origin. Do **not** clear Safari history/website data or switch to Private Browsing.

## Install v0.4 — detailed iPhone instructions

1. Download `wilderness-prototype-v0.4.zip` in ChatGPT, then go to iPhone **Files** and tap it to unzip.
2. Open **your existing Wilderness GitHub repository** in Safari, not a new repository and not Dino Dominion.
3. In the `main` branch at the repository root, choose **Add file → Upload files**. Upload/replace **`index.html`**, **`game.js`**, **`save-system.js`**, and **`README.md`**. Upload **`construction.js`** as a new file.
4. GitHub sometimes refuses replacing same-name files in mobile upload. If so, use Safari **Request Desktop Website**, or open each existing file and use GitHub's **Edit** function to replace its **entire contents**. Do not upload files named `index (1).html` or a nested ZIP folder.
5. Make sure the root now contains these five files: `index.html`, `game.js`, `construction.js`, `save-system.js`, `README.md`.
6. Commit all changes to `main`. If you commit in multiple steps, the site may temporarily fail until **all five** match—do not test until the last commit deploys.
7. **Settings → Pages** stays `Deploy from a branch → main → /(root)`. No change needed.
8. Open **Actions** and confirm the GitHub Pages deployment succeeded.
9. Open your **existing game URL** in Safari. If an older build is cached, append `?v=04` to the existing URL and reload. This preserves the same browser-storage origin. **Do not erase website data.**
10. The game should say `Single-player · v0.4`. Start the game and confirm your old cabin, materials, equipped tools and gathered resources remain.
11. Immediately open **🎒 Bag → Export world**, download your new **v0.4** JSON backup and keep it in Files.

## Construction controls on iPhone

1. Tap **🔨 Build**. Tap **▦ Floor** and aim at a clear patch of forest. The transparent floor snaps onto the 2m grid.
2. Tap **← Left**, **Right →**, **↑ Farther**, or **↓ Closer** to shift the preview, or walk a little. Tap **↻ Rotate 90°** for orientation. The status panel shows the selected piece, position and why placement may be blocked.
3. Tap **✓ Place** when green and affordable. Costs come directly from your backpack.
4. Select **Wall**, **Doorway** or **Window**. Aim at an edge of the floor. Rotate to change which edge is used. A wall edge must be near a floor/foundation tile.
5. Add another wall/door/window on a different edge. When there are at least two wall edges, select **Roof** to cover the tile.
6. For raised platforms, place a **Foundation**, optionally put a **Floor** on top, and place **Steps** on the neighboring tile facing uphill toward that foundation. The direction of the steps matters.
7. Exit Build with **✕ Close**. Walk through your doorway and around the new room. Roof sections hide while you stand underneath them.

**Important:** You can construct a separate modular home next to your older premade cabin. Directly editing individual walls of the pre-existing cabin and custom-blueprint saving are reserved for v0.5.

### Keyboard controls, if using a computer

- WASD / arrows move; Shift runs; drag mouse to turn camera
- `1` axe; `2` pickaxe; `E` gather; `I` backpack; `B` build; `F` place; `R` rotate
- In Build mode: `H` left; `L` right; `K` farther; `J` closer

## Acceptance tests — report pass/fail before starting v0.5

1. **Migration:** All old v0.3 buildings, wood/stone, inventory, equipped tools, saved position and depleted resources still load; old v0.3 remains available for rollback.
2. **Movement:** Camera, left/right joystick, collision with trees/rocks and old cabin doorway still work.
3. **Gathering:** Axe collects wood and pickaxe collects stone; resources arrive in backpack.
4. **Modular floor:** Place a floor, verify snapping and wood cost. The same tile should reject a duplicate floor.
5. **Walls and edges:** Place a wall next to a floor. Rotate it and test that a wall without any supporting tile is rejected.
6. **Door & window:** Add a doorway and window to separate floor edges. Walk through the doorway, but not through the window or solid wall.
7. **Roof:** Add at least two wall edges, then a roof panel. Verify a roof without support is rejected and that roof visibility changes while walking inside/outside.
8. **Foundation & steps:** Place a raised foundation with steps facing its edge. Walk up and down and inspect the character's height and camera.
9. **Placement feedback:** Red, yellow and green previews and status explanations make sense; nothing is charged after failed placements.
10. **Save / recovery:** Save and refresh; new buildings and inventory persist. Export JSON; verify it exists in Files; import it and confirm restoration.
11. **Performance:** Building menu is accessible, mobile controls don't overlap badly, and the game is still smooth enough on your iPhone.

If you can't test a feature because of missing materials, mark it **not yet tested**, not failed.

## Rollback if v0.4 fails

1. **Do not erase Safari website data.** Open your old saved v0.3 ZIP in Files.
2. Replace your repository's `index.html`, `game.js` and `save-system.js` with the **complete old v0.3 versions**, and also the old `README.md` if you like. The extra v0.4 `construction.js` can remain in the root; v0.3 doesn't import it.
3. Wait for GitHub Pages Actions to complete and reopen the **same URL**. The old **v0.3 browser save remains in its own key**, unchanged by v0.4.
4. Any progress made only in v0.4 will **not** appear when running v0.3. Export a v0.4 JSON backup before rolling back if the game still opens.
5. When ready to return to v0.4, reupload the full v0.4 package. Your v0.4 save remains unless you cleared Safari site data.

### Testing & limitations

Syntax checks, deterministic snap/support rules, v0.3→v0.4 migration, simulated gameplay events, collision, roof visibility, inventory charges and backup recovery were tested. The HTML build panel was also inspected at narrow portrait and landscape sizes. A full live GPU-rendered iPhone/Safari test could **not** be completed in this environment, so user acceptance testing is required before calling v0.4 stable.
