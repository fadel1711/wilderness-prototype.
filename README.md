# Wilderness v0.3 — Tools, Backpack & Gathering

**Single-player · iPhone/browser prototype · free, no ads, no purchases · full GitHub Pages replacement package**

This package is an upgrade of your working **v0.2** website. It retains the same forest, muted color palette, joystick mapping, resource positions, physical collisions, cabin doors, modular floor/wall pieces, and building costs. It does **not** require Supabase, accounts, or a new repository.

## ZIP contents — all four files are required

```
index.html       Complete mobile screen, build menu, backpack, backup buttons
game.js         Entire 3D game, tools, gathering, building, movement, save wiring
save-system.js  Inventory rules, version-1 save migration, JSON import validation
README.md       This guide and acceptance checklist
```

The spaces in the illustration above are for readability; actual filenames are exactly `index.html`, `game.js`, `save-system.js`, and `README.md`. Place **all four at the repository root** (not inside a `v0.3` folder). Do not upload only the ZIP or create duplicate names such as `game (1).js`.

## What's new

- **Equipable tools:** a visible axe and pickaxe on the character, on-screen quick-select buttons, and keyboard `1` / `2` shortcuts.
- **Tool-gated gathering:** use the axe on trees and the pickaxe on rocks. A wrong tool explains what to switch to. Chopping and mining have a short arm-swing animation, hit feedback, and a cooldown against rapid double-taps.
- **Resource rewards:** gather three wood per depleted tree, two stone per depleted rock, as before. Resources stay at their deterministic v0.2 positions and respect previously depleted states.
- **Backpack:** 24 initial slots, wood and stone stacks of 99, two starter tool slots, resource counters, tap a tool slot to equip it. Older legitimate material totals are preserved even if extra slots are needed. The existing building menu now spends materials from the backpack rather than obsolete counters.
- **Save migration:** reads v0.2's `wilderness_v01_singleplayer` key **without changing or deleting it**. Writes v0.3 data under `wilderness_v03_singleplayer`, using format version 2. Player position, cabin/floor/wall placement, resource depletion and amounts carry forward.
- **Backups:** Backpack → **Export world** downloads a JSON world file. **Import world** validates a JSON backup, previews counts in a confirmation dialog, and only then replaces the current v0.3 world. An automatic pre-import snapshot makes **Undo last import** available in the backpack after an import.
- **Saving:** local autosave approximately every 12 seconds, manual Save, and page-hide save. No internet account or database required. Three.js itself still loads from jsDelivr when first opening the page online.

**Not yet included:** inventory drag-and-drop/splitting, craftable tools or tool durability, new resources or biomes, enemy combat, advanced modular construction, farming, multiplayer. Those belong in later updates.

## Before updating — protect your progress

1. Use the **same iPhone, same Safari profile, and same GitHub Pages URL** where v0.2 currently saves. Browser storage belongs to that exact website address; switching to a different GitHub Pages URL will look like a fresh game.
2. Keep your **v0.2 ZIP** in the iPhone Files app as a code rollback copy. It is **not** a backup of your browser save.
3. **Do not delete Safari website data**, use Private Browsing, or delete your repository. Your existing v0.2 browser save will remain stored separately after upgrading, but changing sites or clearing data can lose it.

## Install v0.3 from an iPhone, step by step

1. Tap the `wilderness-prototype-v0.3.zip` download in ChatGPT, then open it in **Files** to unzip it.
2. Open **your existing Wilderness GitHub repository** in Safari. Do not create another repository and do not use the Dino Dominion repository.
3. Go to the repository's **main branch** and its top-level folder (where `index.html` and `game.js` are already located).
4. Choose **Add file → Upload files**. Select all four unzipped files. Replace the current `index.html`, `game.js`, and `README.md`, and **add the new `save-system.js`**.
5. Commit to `main`. If GitHub's mobile interface will not replace a same-named file by uploading, use **Request Desktop Website** in Safari, or open the existing file's editing menu and replace **its entire contents**. Do not leave the old `index.html` or `game.js` active with alternate names. Check that `save-system.js` is present alongside them.
6. Leave **Settings → Pages → Deploy from a branch → main → /(root)** exactly as it was. Your successful v0.2 configuration does not need changing.
7. Open the repository's **Actions** tab and check that the GitHub Pages deployment completed. Open **the same website URL** you used for v0.2.
8. Refresh Safari if necessary. If you still see v0.2, append `?v=03` to the end of the website URL (e.g. `https://example.github.io/your-repo/?v=03`), which changes the page request but keeps the same website's browser storage. **Do not clear site data.**
9. The top-left should read **Single-player · v0.3**. Your current cabin, collected materials, resource depletion, and player position should reappear automatically.
10. Tap **🎒 Bag → Export world** immediately after checking your progress. Save the downloaded `.json` file in the **Files** app and keep a second copy if possible.

### If an old world does not appear

**Stop and do not begin rebuilding or importing random files.** First check that you are using the exact same GitHub Pages URL and Safari profile, and that all four files were uploaded to the root. The v0.2 key is deliberately left untouched, so returning to v0.2 may still show your previous world. Share the visible error or page details before altering website data.

## iPhone controls

- **Move:** left joystick; push farther to run. **Look:** swipe on open space at the right of the screen.
- **Axe:** tap `🪓 Axe` above the action buttons, approach a tree, tap `Chop` three times, allowing a brief pause between swings. At the final hit you collect **3 wood**.
- **Pickaxe:** tap `⛏ Pickaxe`, approach a rock, tap `Mine` twice. At the final hit you collect **2 stone**.
- **Bag:** tap `🎒 Bag` to inspect wood, stone, and tools. Tapping a tool slot equips it. Tap **✕ Close** to return to the world.
- **Build:** tap `🔨 Build`, choose Cabin/Floor/Wall, rotate, and place. Costs still come from gathered wood and stone. Close Build before gathering.
- **Manual Save:** tap **Save**. The game also autosaves in the browser.
- **Desktop keyboard:** WASD/arrows move, Shift runs, mouse drag looks, `1` axe, `2` pickaxe, `E` gather, `I` bag, `B` build, `R` rotate, `F` place.

## Export, import, and recover

### Export (non-destructive)

1. Open **🎒 Bag**.
2. Tap **⬇ Export world**.
3. Safari should prepare a download named approximately `Wilderness-v0.3-world-YYYY-MM-DD.json`. Check Downloads/Files and **confirm the file is actually saved**; do not rely on the in-game toast alone.
4. Keep that `.json` as your offline backup. It includes the world, player location, buildings, depleted resources, tool selection, and inventory. The JSON does not contain login credentials.

### Import (replaces the current v0.3 world)

1. **Export the current world first.**
2. Open **🎒 Bag → ⬆ Import world**. Select a previously exported `.json` file from Files.
3. The importer checks the save version, material quantities, resources, buildings, coordinates, and item slots. Damaged/unsupported JSON is rejected **before** changing your current save.
4. Read the confirmation prompt with the backup's building count and wood/stone totals. Tap **Cancel** to keep the current world, or **OK** to replace the v0.3 world and reload.
5. The current v0.3 save is copied to a separate local pre-import recovery key before it is replaced. After import, **🎒 Bag → ↶ Undo last import** can restore that snapshot. This recovery is also browser-local, not a substitute for a downloaded backup.

### Rollback to v0.2

1. Re-upload the complete, saved **v0.2 `index.html` and `game.js`** files to your existing GitHub root, replacing the v0.3 versions. `save-system.js` is unused by v0.2 and can remain in the repository.
2. Wait for the Pages deployment and open your existing URL. v0.2 reads its **original, untouched** save key. Note that progress made **only in v0.3** won't show in v0.2; use v0.3 export/import to recover that later.
3. Re-upload all v0.3 files to return to the upgraded build. The separate v0.3 save key is preserved as long as Safari website data remains.

## v0.3 acceptance tests

- [ ] 1. Game opens from the existing URL and reads **v0.3** (not blank or stuck on the loading screen).
- [ ] 2. Previous cabin, buildings, player location, wood, stone, and depleted resources survive migration.
- [ ] 3. Joystick left/right/up/down and rotating camera remain correct.
- [ ] 4. Axe is visibly selected. Tree responds to three deliberate chops and adds three wood to the backpack.
- [ ] 5. Try mining with the axe: a helpful message requests the pickaxe and the rock remains unchanged. Switch tools; mine twice to receive two stone.
- [ ] 6. Backpack opens and shows 24 initial slots, both tools, and resource stacks. Tap a tool slot to equip it and close the backpack.
- [ ] 7. Place a floor, wall, or cabin. Materials are deducted from the backpack; the old walkable cabin doorway and wall collisions still behave properly.
- [ ] 8. Save, refresh, and confirm tools, buildings, items, and depleted resource states remain.
- [ ] 9. Export a JSON file; confirm it appears in Files and is readable. Import the file and confirm world restoration after the confirmation dialog.
- [ ] 10. After import, **Undo last import** is enabled and restores the preceding v0.3 snapshot.
- [ ] 11. Play for 5–10 minutes and check mobile responsiveness and performance.

## Technical verification and limitations

Automated checks performed for this release: Node JavaScript syntax, schema/migration tests (including legacy building/resource preservation, item stacking, atomic building costs, rejecting malformed JSON), and a sandboxed in-memory runtime with a stub renderer for game initialization, UI callbacks, gathering, building, saving, backup export/import, and its page-hide guard. These checks **do not render the real Three.js graphics or emulate iPhone Safari**. A real-browser test was attempted but blocked by the test environment's navigation restrictions. Your on-device acceptance checklist is the final verification.

This remains a small, ordinary-looking indie-game mechanics prototype, not a full survival game. Visuals remain purposefully modest and unchanged from the v0.2 style that passed your tests. The JSON backup is a downloaded user file, not a cloud save. Do not clear browser website data until you have independently verified a backup.
