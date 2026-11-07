# Wilderness v0.24.3 — Clear Trails (interface simplification)

Complete **GitHub Pages replacement ZIP** for the last tested **v0.24.2 First Steps** game. No separate preview page. No Supabase SQL changes.

## What's improved

- **Backpack:** Four readable tabs: **Items**, **Outfit**, **Supplies**, **Settings**. The inventory is the default view when the Bag opens. Clothing is no longer mixed with crafting supplies and backups.
- **Creative supplies are still available:** **Bag → Supplies → Refill supplies** (wood/stone/ore/seeds); the original refill handler and amounts are unchanged, including the 999 wood/stone availability.
- **Construction:** Four categories: **Starter** (Cabin, Campfire, Workbench, Chest, Furnace, Bed), **Parts** (floors, walls, roof, etc.), **Upstairs**, and **More** (decor, stock blueprints and personal saved designs). All original build choices are preserved. Selecting a piece continues to use the existing placement, rotation and editing system.
- **Camera zoom:** Now lives in **Bag → Settings → Gameplay & display**, instead of occupying the game HUD. Pinch-to-zoom remains supported.
- **Joystick recovery:** The old `↻ Unstick` control stays near the joystick as a smaller, accessible reset button.
- **Tutorial:** The mandatory First Steps tutorial still controls its own lessons, highlights the correct building and provides the same progress persistence.
- **Combat, zombies, villagers, crafting, guest entry, cloud autosave, world import/export, and six-slot hotbar** stay in place.

The UI update organizes *the same DOM elements* rather than replacing their event handlers. `interface-system.js` moves controls into tabs at startup. All save/auth/cloud/game modules retain their original logic (versioned asset URLs changed solely to prevent a mixed-version cache).

## iPhone upload — follow in order

1. **Back up your world first:** open the working v0.24.2 game, select **Bag → Export world**, and save the JSON to your iPhone Files app. Account worlds also cloud-sync, but keep the JSON backup. Do not clear Safari website data.
2. **Download and extract this ZIP** in Files. You should see `index.html`, `game.js`, `interface-system.js`, other `.js` files, and an `assets` folder.
3. Open your existing `wilderness-prototype` GitHub repository. Upload/replace **all files in the ZIP's top level to the repository root**, especially `index.html`, `game.js`, `interface-system.js`, `release.json`, `manifest.webmanifest` and the updated versioned JavaScript modules. Keep the same filenames.
4. Open the ZIP's `assets` folder and upload **its contents** into the existing GitHub **`assets/`** folder. In particular, `assets/survivor-animated.glb` must be at exactly that path. Do **not** create `assets/assets/`, and do not move the model to the root.
5. Allow GitHub Pages to publish, then open the normal Wilderness game URL. Check that the title/version shows **v0.24.3**. If the old page is cached, fully close/reopen the browser or launch the game URL once with `?refresh=0243` (this does not clear local saves).
6. Test Bag tabs, Build tabs, movement, inventory, saving and the tutorial before sharing this release with other players. If GitHub Pages reports a missing JS file, verify that all root files—not just `index.html`—were uploaded.

**No Supabase migration is required.** This package has not been deployed to your GitHub and does not access or mutate your live database.

## User acceptance checklist

- [ ] Existing account and Guest worlds open with their existing buildings and items.
- [ ] The Bag opens to Items; Outfit, Supplies and Settings each open and show the correct controls.
- [ ] Bag → Supplies → **Refill supplies** still grants the usual creative materials.
- [ ] Bag → Settings → Account & world backup contains Export, Import, account/guest controls.
- [ ] Camera pinch-to-zoom and Settings camera +/− both work.
- [ ] Build → Starter contains Cabin, Campfire, Workbench, Chest, Furnace and Bed.
- [ ] Build → Parts, Upstairs and More contain all previous pieces, blueprints and design tools.
- [ ] Choose a piece, rotate, place, dismantle and edit; inventory quantities update normally.
- [ ] The joystick, main action, jump, sword/block/dodge, six-slot hotbar and reset button work on an iPhone in landscape.
- [ ] Cloud autosave still works for a signed-in test account; Guest mode remains local-only and separate.
- [ ] On a **new test profile only**, First Steps shows one required item during the workbench/campfire steps and the tutorial advances by real actions. Do not wipe your main device's browser storage to test it.

## Known limitations

- We ran source/syntax, DOM structure, package, and Chromium layout/control-visibility tests. **We did not complete a live Three.js gameplay test on a physical iPhone**, so treat this as an acceptance build until tested on your device.
- UI tabs are presentation-only. They do not change world files, cloud policies or crafting balance.
- The current character textures and other existing visual limitations remain untouched. The 3D art upgrade is postponed.
