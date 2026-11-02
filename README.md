## What's fixed in v0.5.1

- **Versioned all local JavaScript imports:** Safari will no longer mix a cached v0.4.1 `save-system.js`/`construction.js` with the newly deployed game.
- **Improved startup screen:** if startup fails, it checks for missing/mixed GitHub files and displays a readable message instead of blaming only the 3D engine.
- **No gameplay or save schema changes:** v0.5 building features, existing v0.4 and v0.5 worlds, item totals and blueprints are preserved. No browser data clearing required.

**If you currently cannot enter v0.5:** keep Safari website data intact, upload ALL FIVE files from THIS ZIP to the existing repository root, wait for a successful Pages deployment, and reopen the game. This does not delete or reset your saved worlds. `index.html`, `game.js`, `construction.js` and `save-system.js` must all be updated together.

If the error screen still appears, screenshot the specific message shown on it and share that. If absolutely necessary, re-upload all five files from the working v0.4.1 ZIP to roll back; v0.4 save key is unchanged.

---

# Wilderness v0.5.1.1 — Startup Hotfix (full replacement)

**Single-player 3D browser prototype · Full-file GitHub Pages release · November 2026**

This is a complete v0.5.1 startup-reliability hotfix based on v0.5, which was based on Wilderness v0.4.1. No new game features or save migrations were introduced. It does not require Supabase, a database migration, a new repository, or a separate server. `index.html` loads Three.js from a public CDN, so the initial page load requires an internet connection.

## ZIP contents — upload all five files into your existing repository root

1. `index.html` — entire mobile interface and page
2. `game.js` — entire 3D game and controls
3. `construction.js` — snapping, foundation supports, plan rules and construction costs
4. `save-system.js` — inventory, v0.5 save format, migration, JSON backup/import
5. `README.md` — these instructions

**Do not upload the ZIP itself as your game website.** Extract it first, and upload the five individual files. Do not place them inside a nested folder. Keep the existing GitHub Pages branch `main` and directory `/(root)`.

## BEFORE installing — protect your current world

1. On your iPhone, open your **current v0.4.1** GitHub Pages game using the usual URL in Safari.
2. Tap **Bag → Export world**. Save the `.json` file to your iPhone's **Files** app (e.g. `On My iPhone/Downloads`). Check that the exported JSON file exists.
3. Keep a copy of the previous `wilderness-prototype-v0.4.1.zip` in Files. This is your rollback package.
4. Do **not** clear Safari website data. Keep the same GitHub Pages URL and Safari profile.

## Install using ONLY your iPhone

1. Download `wilderness-prototype-v0.5.1.zip` from the ChatGPT message.
2. Open **Files**, tap the downloaded ZIP to extract the folder `wilderness-prototype-v0.5`.
3. In Safari, sign in to `github.com` and open **the same existing Wilderness repository** you used for v0.4.1.
4. Use **Add file → Upload files** (or open each old file and replace its complete content with the new one if GitHub's mobile upload UI refuses overwrites).
5. Replace these existing root files with the complete new versions: `index.html`, `game.js`, `construction.js`, `save-system.js`, and `README.md`. Ensure there is only one active file with each name and that case/spelling match exactly.
6. **Commit changes** to `main`. The `index.html`, `game.js`, `construction.js`, and `save-system.js` files must all be from v0.5 — do not mix versions.
7. Open **Actions** in the same repository and verify the GitHub Pages deployment has completed successfully.
8. Return to **your existing game URL** in Safari; refresh. The upper-left title should say **Single-player · v0.5.1**. If the previous title remains, refresh again after the deployment completes.
9. Open **Bag** and confirm the old inventory, equipped tool, cabins, paths, foundation pieces, wood and stone. Walk around to verify movement and camera controls.
10. **Bag → Export world** again when you have confirmed v0.5 successfully migrated your world. This second JSON file protects your v0.5 progress.

If Safari shows "3D engine couldn't load", verify the four JavaScript/HTML file names and that your internet connection allows the Three.js CDN. If the old version remains, verify the deployment rather than deleting Safari's data.

## What's changed in v0.5

- **Floors on foundations:** place a `foundation` tile, then place a `floor` at the same snapped X/Z. The floor automatically raises above the foundation, and its surface is walkable.
- **Cabins on foundations:** create a **complete 3×3 pad of nine neighboring foundation tiles** (centres spaced 2 metres apart), with no trees/rocks inside. Choose `Cabin` from outside the pad and move its preview near the pad. The preview snaps toward the finished pad. A partial pad will show `Cabin needs 9 foundation tiles (N/9)` and cannot support a cabin. Do not cover the pad with floor tiles before placing the cabin; the cabin already includes its own floor.
- **Entrance and steps:** rotate the cabin before placing if you want the doorway to face another direction. Place `Steps` in front of its doorway with the high end pointing toward the front foundation row. The raised cabin's walkable floor and the stair top share the same height.
- **Two built-in blueprints:** `Raised Deck` and `Garden Corner`. A blueprint previews and places multiple pieces at once, consuming the combined wood/stone cost.
- **Save your own layout:** stand near your buildings, open `Build`, tap `Save nearby design`. The game saves up to **six** user designs, each up to **30** pieces in a roughly six-metre radius. Reopen Build and select the new layout from `Your Designs`; position, rotate, and place it elsewhere using materials. This is a reusable template, not a duplicate of the original physical structures.
- **Land pieces:** `Path`, `Fence` (solid), and a **decorative** `Planter`. Farming and crop harvests are NOT part of v0.5.
- **Dismantle and refunds:** walk beside a building piece, open `Build → Dismantle nearest`, confirm. The game refunds the piece's original materials. It will block dismantling a foundation that still supports an elevated cabin or floor — remove dependent pieces first.
- **Modular additions:** place extra rooms and floors adjacent to the existing prefab cabin; the original cabin's wall/roof geometry itself is not directly editable in this version.
- **Compact placement toolbar retained:** selecting any building piece or blueprint hides the full picker and exposes its position controls; tap `Pieces` to return to the selection menu.

## v0.5 saved worlds and migration (IMPORTANT)

v0.5.1 uses the **same v0.5** browser save key and stores progress separately under the browser localStorage key `wilderness_v05_singleplayer`. On first load it reads, in order, the v0.5 key, the existing v0.4 key, v0.3, then earlier save data. It **does not overwrite** v0.4/v0.3/v0.2 keys as part of migration.

The new save format is version 4 and stores original character position, resource states, buildings, inventory, equipped tool, and any custom blueprints. Heights of raised structures are recalculated from supporting foundations on each load; older non-elevated buildings remain in their saved positions.

`Bag → Export world` writes a `.json` file with your current v0.5 save. `Bag → Import world` accepts compatible earlier backups and v0.5 backups after a confirmation. **Import replaces your CURRENT v0.5 world** and creates a single pre-import recovery copy. `Undo last import` reverses the most recent import. Always export your current world before importing.

Never upload saved JSON worlds or personal data to the **public** GitHub repo. Keep backup files privately in the iPhone Files app.

## v0.5 iPhone acceptance checklist

1. Old v0.4.1 world loads: previously placed cabin/floors/stairs, inventories, materials and tools intact.
2. Joystick direction and camera remain correct; trees, rocks, walls, fences block movement.
3. Build one foundation and place a floor **directly above** it; walk on the raised floor.
4. Build a clear 3×3 foundation pad (nine tiles). A cabin aligns on top when preview is near, not blocked by the foundations.
5. Position steps by the cabin entrance and walk up and down **without a seam or sudden fall**.
6. Select a piece; the big menu closes, compact controls remain, and `Pieces` reopens it.
7. Preview and place `Raised Deck` or `Garden Corner`; total costs deduct correctly.
8. Add `Path`, `Fence`, `Planter` and confirm there are no visual overlaps or inappropriate collision.
9. `Save nearby design` captures a small layout, and you can select that design to preview it elsewhere.
10. Dismantle a standalone item and recover its materials; verify supporting foundations can't be dismantled while occupied.
11. Save and refresh. Everything including custom blueprints persists.
12. Export a JSON backup and import that same backup; world is restored correctly.
13. Graphics/performance remain acceptable on Safari, in portrait and landscape if possible.

**Do not claim v0.5 has passed until all applicable checks are performed on the actual iPhone.** Automated tests below do not replace rendered iPhone testing.

## Rollback if needed

1. If v0.5 is running, first export its world to JSON so your newest progress is recoverable later.
2. Re-upload **all five original v0.4.1 files** from your retained old ZIP, overwriting the v0.5 files in the same GitHub root. Commit to `main` and wait for GitHub Pages to deploy.
3. Open the same URL; the title returns to v0.4.1 and will read the unchanged `wilderness_v04_singleplayer` save key. Your v0.5-only progress and pieces will **not** appear in v0.4.1; they remain in v0.5 browser storage/JSON backups for when you upgrade again.
4. Don't clear Safari site data and don't delete existing localStorage keys.

## Verification performed before packaging

- `node --check` passes for all JavaScript modules.
- Node tests cover snapping, 3×3 cabin support, floor stacking, collision and invalid placement, new pieces, both built-in blueprints and their 90-degree rotations, old save migrations, backup validation, and atomic inventory cost deductions.
- Renderer-stub runtime integration checks cover v0.4 migration isolation, placement of a foundation and floor, cabin on nine foundations, stair walk heights, blueprint capturing, protected supporting pieces, dismantle refunds, and export/import.
- Static layout tests in a headless Chromium browser pass at 375×812, 390×844, and 844×390: picker scrolls, compact placement controls fit, and no horizontal overflow.
- **Not verified:** complete GPU-rendered gameplay on iPhone Safari or all real-world performance configurations. Safari acceptance tests remain required.
