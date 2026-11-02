# Wilderness v0.6 — Crafting, Storage & Interiors

**Single-player • iPhone Safari / GitHub Pages • complete replacement release**

This is a browser-based prototype using Three.js from a public CDN. It does not require Supabase, paid services, accounts, or multiplayer. It is intentionally a small indie-looking 3D prototype, not a finished game.

## BEFORE INSTALLING — protect your v0.5.2 world

1. Open your existing v0.5.2 game from **the same Safari address** you have always used.
2. Tap **Bag → Export world** and save the downloaded `.json` file in your iPhone's **Files** app.
3. Confirm you can find the exported JSON. Keep the older `wilderness-prototype-v0.5.2.zip` too.
4. Do **not** clear Safari website data, switch your GitHub Pages URL, or delete existing saves.

v0.6 reads the old v0.5 world and migrates buildings, cabin positions, foundations, inventory, collected resource states, blueprints, and the player's position into a **new separate key** `wilderness_v06_singleplayer`. The original v0.5 key `wilderness_v05_singleplayer` is not overwritten by the upgrade. Browser storage is device/browser/URL-specific and can still be lost if cleared; the downloaded JSON is the additional safety net.

## Installation on iPhone (replace **all SIX** files)

Unzip the `wilderness-prototype-v0.6.zip` file with the Files app. It contains the six files listed below **at the ZIP root**, not inside an additional subfolder:

- `index.html` — complete v0.6 page, mobile controls and diagnostics (REPLACE)
- `game.js` — complete v0.6 game, world, furniture, crafting UI and save wiring (REPLACE)
- `construction.js` — full new construction rules and furniture types (REPLACE)
- `save-system.js` — full version 5 save format with legacy migration (REPLACE)
- `craft-system.js` — new crafting, chest transfer and atomic material-cost module (ADD)
- `README.md` — instructions (REPLACE)

1. Go to your **existing** public Wilderness GitHub repository on GitHub, in Safari (desktop site view if necessary).
2. Use **Add file → Upload files** and upload all **six** files to the **repository root**, beside the existing `index.html`. Choose to replace existing filenames when GitHub prompts for duplicate names. You can also use GitHub's Edit file function when necessary, but use the full file contents, not snippets.
3. Commit to branch **main**. Do not delete old unrelated files and do not create a new repository.
4. In **Actions**, check that Pages completed successfully. GitHub Pages remains **Deploy from a branch / main / (root)**.
5. Open the **same game URL** you used for v0.5.2 and refresh. Confirm the label **Single-player · v0.6** appears. If Safari shows an old version, close the page and reopen the same URL after deployment; do not clear browsing data.
6. If you see a startup error, screenshot it and send it for diagnosis. Do not clear site data.

## What's actually new

### Workbench and equipment

Go to **Build → Workbench**. Place it in a valid outdoor area or inside a cabin, leave Build mode, walk within about 2.75 m and tap **Use**. Craft:

- **Stone axe** (3 wood, 4 stone), better tree chopping.
- **Iron pickaxe** (3 wood, 2 iron bars), better rock mining.
- **Iron sword**, **wooden shield**, **hunting bow** — these can be crafted and saved, but *combat use is reserved for v0.7*. The current tool buttons automatically select your stronger axe/pickaxe once you own one.

When a rock is fully mined, it now gives **1 iron ore** in addition to stone. No new rocks are spawned. Ore is also available via the free Creative Supplies refill.

### Furnace

Place a **Furnace**, walk to it and tap **Use**. It has two recipes:

- 4 wood → 2 charcoal.
- 2 iron ore + 1 charcoal → 1 iron ingot.

No paywalls, no cooldowns. One tap crafts one recipe batch.

### Chests and nearby materials

Build a **Chest**, walk within about 2.75 m and tap **Use**. Each chest provides **16 storage slots** and accepts resource stacks. Tap a backpack stack to store it or a chest stack to take it back. Tools/equipment stay in the backpack. If you build or craft **within 5 m of a chest**, the game can automatically draw required materials from that chest, without duplicating items.

You must empty a chest before dismantling it. Chest contents save and export with your world. On v0.6 reload, your original v0.5.2 buildings retain their positions.

### Interiors and furniture

The existing Build menu adds **workbench, chest, furnace, table, chair, bed and shelf**. These are intentionally simple 3D models using the approved v0.5.2 coloring. Select a piece to dismiss the large menu; position/rotate it using the compact dock. Furniture moves in **one-metre steps** for easier placement inside a cabin. Roof behavior, stairs, existing walls, foundations, blueprints, fences and paths are retained. Bed is a rest-area placeholder; health/sleep gameplay comes later.

### Creative Supplies

Your **Bag → Refill supplies** still restores your wood and stone to at least **999 each**; it also ensures at least **99 iron ore** for experimentation. No farming is required for the prototype.

## Test checklist

1. **Legacy world:** The screenshot-worthy cabins, raised foundations, tools, resources and custom blueprints from v0.5.2 are still present.
2. **Movement:** Joystick, camera, doorway, roof fade, stairs and collision still work.
3. **Crafting:** Place a workbench, approach it, tap Use and craft a stone axe. Switch to it, chop a tree, verify fewer swings.
4. **Furnace:** Place a furnace, make charcoal and an iron ingot. Reopen the station and check ingredient quantities.
5. **Chest:** Place a chest; store and retrieve an entire wood stack. Check materials don't duplicate. Try building using resources stored in a chest within 5 m.
6. **Interiors:** Place a table, chair, bed or shelf inside an existing cabin (nearby construction piece placement is used; try 1 m nudges). Walk around it and verify collision behaves reasonably.
7. **Save:** Save and refresh; furniture, equipped tool, chest contents and inventory should persist.
8. **Backup:** Export v0.6 JSON, import it, verify the same world loads. Export a new backup before testing any import. The old v0.5.2 JSON remains a separate recovery file.
9. **Performance:** No freezes, missing startup modules, or serious performance regression on iPhone.

## Emergency rollback without deleting your save

If v0.6 fails: **do not clear Safari website data.** Re-upload all five complete source files from `wilderness-prototype-v0.5.2.zip` to your existing repository; the extra `craft-system.js` file can remain unused. Once Pages finishes deploying, refresh your **same URL**. v0.5.2 will read its own older save key, which v0.6 did not overwrite. Any newly placed v0.6 furniture/chest data will not exist in that older world, but a v0.6 JSON export will capture it separately. If a save is corrupted, stop and send the displayed error before importing anything.

## Known limits

- v0.6 is a **prototype**, not a completed survival game.
- Sword, shield and bow are craftable *inventory items* but do not yet have combat behavior. v0.7 is planned for that.
- Beds currently decorate/rest spaces but do not manage real health or sleep.
- Furniture models are intentionally simple; they are not polished 3D assets.
- Saves are local to Safari and the website URL; there is no cloud sync.
- The HTML imports Three.js from an external CDN; first startup requires Internet access.
- Simulated code/runtime tests and static phone-layout checks were performed. A full 3D-rendered iPhone Safari acceptance test is still required.
