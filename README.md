# Wilderness — v0.4.1 Stair & Build Menu Hotfix

This is a **complete replacement package** for the existing Wilderness v0.4 GitHub Pages repository. It does not require Supabase, SQL, a new repository, or a new URL.

## What's fixed

1. **Stair / raised-platform gap:** Stair treads extend into their adjoining foundation/floor rather than stopping slightly short. The player's walking-height calculations now cover the entire connection, including the seam. Stairs adapt their upper tread height to either a bare foundation or a floor built over the foundation. Existing stairs are repaired automatically when the world loads; you do not need to demolish or rebuild them.
2. **Unobstructed building view:** Tap **Build**, select a building piece (Floor, Foundation, Doorway, etc.), and the large selection panel **automatically closes**. A small placement toolbar remains with **Left / Far / Near / Right**, **Rotate**, **Reset**, and **Place**. Tap **Pieces** in that small toolbar to open the list again. Tap **Close Build** to exit construction mode.

No other gameplay or graphics overhaul was intended.

## Included files — upload all five

- `index.html` — v0.4.1 UI and updated cache-busting script URL
- `game.js` — repaired stairs / walkable joins and compact build-panel behavior
- `construction.js` — full construction rules (unchanged from v0.4)
- `save-system.js` — full save code (unchanged from v0.4)
- `README.md` — these instructions

Do not upload the ZIP itself to GitHub Pages. Unzip and upload the five files inside it, directly at the repository root, next to each other.

## Install from iPhone (Safari)

1. **Before changing files**, open your current v0.4 game and choose **Bag → Export world**. Save the resulting `.json` in the iPhone **Files** app. Confirm the exported file exists. Do not clear Safari's website data.
2. Download `wilderness-prototype-v0.4.1.zip`, then open **Files → Downloads** and tap the ZIP to extract it.
3. Open your **existing** Wilderness GitHub repository in Safari. Do not create a new repository.
4. On the repository's **main** branch, upload the extracted `index.html`, `game.js`, `construction.js`, `save-system.js`, and `README.md`, replacing the existing files with matching names. Make sure the files are at the **root** and not nested inside a new folder. GitHub may ask you to commit each edit; commit the changes to `main`.
5. Go to **Actions** and confirm the GitHub Pages deployment succeeded. Your Pages settings remain **Deploy from a branch → main → /(root)**.
6. Open the **same game URL** in Safari and reload it. The top-left label should show **Single-player · v0.4.1**.
7. Confirm your buildings, materials, and inventory are intact. Then test the stairs and the new building menu.

If Safari still shows v0.4, check that all five files were replaced in the repository root and that Pages finished deploying. Try opening the same game URL with `?v=041` added to the end to bypass a cached page.

## Acceptance checklist

- [ ] Game header shows **v0.4.1**, not v0.4.
- [ ] Your original house, newly built modular pieces, inventory, and resource totals remain intact.
- [ ] Walk from the floor **down the stairs** and then **up the stairs**; there is no drop through a seam at the top.
- [ ] The top stair tread physically meets the raised platform.
- [ ] **Build → Floor** closes the big menu immediately.
- [ ] The compact controls let you move, rotate, and place the floor while seeing the world.
- [ ] **Pieces** reopens the complete selection panel. Choose another item and the panel closes again.
- [ ] Joystick, gathering, saving, and world export/import continue to function.
- [ ] Reload the page. The new build pieces and your position are still saved.

## Save compatibility and rollback

- v0.4.1 keeps the **exact v0.4 save format and browser storage key**: `wilderness_v04_singleplayer`. No data migration or save deletion occurs.
- The older v0.3 and v0.2 save keys are unchanged, and the export/import JSON format is unchanged.
- For rollback, upload the complete five files from your retained v0.4 ZIP to the same repository root, wait for Pages deployment, and reload. No save schema was changed. Keep your JSON world backup separately as additional protection.
- Do not import a backup unless you intend to replace your active browser world; export your current world first.

## Technical verification / limitations

The JS syntax checks, simulated runtime behavior, save-state regression, stair/foundation joins (with and without a raised floor and at all four 90° rotations), and the 375px/390px/mobile-landscape CSS layouts were checked. The local browser environment blocked full site navigation and external renderer loading; **actual iPhone Safari 3D rendering and walking still need the acceptance test above**.

This is a focused hotfix. Combat, new materials, farms, custom blueprints, and other planned features are not added in v0.4.1.
