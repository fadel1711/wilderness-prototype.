# Wilderness v0.9 — Farming, Animals & a Modest Graphics Upgrade

A **single-player, free browser survival prototype** based directly on the player-tested v0.8 game.

## What changed

- **A subtle graphics improvement:** warmer daylight and lighting, natural ground detail, flowers, mushrooms, fallen logs, and small environmental accents. The existing art style stays simple and iPhone-friendly.
- **Crops:** carrots, potatoes, and wheat grow in the existing **Planter** building. Plants visibly change size while growing; they're ready after roughly 45, 60, and 75 seconds respectively. They **never spoil while you are away**.
- **Peaceful animals:** two wandering chickens and two rabbits animate near the starting homestead. They're ambient creatures, not livestock systems yet.
- **Cooking and comfort:** craft **Vegetable Stew** at the existing furnace using carrots, potatoes, and wheat. Crafting it gives a one-time health/stamina boost; the stew also goes into your backpack. Resting at a bed restores health/stamina and grants a short comfort recovery bonus.
- **Creative Supplies:** the existing refill button now adds seeds too.
- **Save preservation:** v0.9 writes to `wilderness_v09_singleplayer` and reads v0.8's `wilderness_v08_singleplayer` (and older versions) without overwriting those older saves.

## Complete GitHub files (9)

`index.html`, `game.js`, `construction.js`, `save-system.js`, `craft-system.js`, `combat-system.js`, `exploration-system.js`, **`farm-system.js` (NEW)**, `README.md`.

All nine files must be uploaded to the **root** of the same Wilderness repository. Do not upload the ZIP itself to GitHub as the website.

## Install from iPhone (Safari + GitHub Pages)

1. Open your **working v0.8** game, tap **Bag → Export world**, and save the JSON backup in the iPhone Files app. Confirm the file exists before proceeding.
2. Download and unzip `wilderness-prototype-v0.9.zip` in Files.
3. Open your **existing Wilderness GitHub repository** (the one publishing your current game). Do **not** create a new one.
4. Upload complete replacements for **`index.html`, `game.js`, `construction.js`, `save-system.js`, `craft-system.js`, `combat-system.js`, `exploration-system.js`, and `README.md`**. Choose to replace/overwrite files with matching names.
5. Upload **`farm-system.js`** as an additional new file in the repository root.
6. Commit your changes to `main`, then check **Actions** to confirm GitHub Pages finished deploying successfully. Do not change the Pages branch or root settings.
7. Open your existing game URL in Safari and reload. The top-left header should read **`Single-player · v0.9`**.
8. If you see a startup message about a missing or outdated file, confirm all seven JS files and `index.html` are at the repository root with the matching v0.9 files. Do **not** clear Safari's website data.

## How to use the new gameplay

- **Plant:** Tap **Build → Planter**, place it, exit building mode, walk close to the planter, and tap **Use**. Choose carrots, potatoes, or wheat.
- **Get seeds for testing:** Tap **Bag → Refill supplies (+ ore + seeds)**. This preserves your items and existing world; it isn't a purchase.
- **Harvest:** Return to the planter after the crop is ready and tap **Use → Harvest**. A harvested planter can be replanted.
- **Cook:** Take one carrot, one potato, and one wheat to a **Furnace** and craft Vegetable Stew.
- **Rest:** Walk to a **Bed**, tap **Use**, and choose Rest and recover.
- The chickens and rabbits are **ambient decoration** for this release; there's no feeding or breeding yet.

## Save/rollback safety

- **v0.9** uses a new browser storage key and leaves the v0.8 save intact. Do not delete Safari website data.
- Export a JSON backup after confirming your v0.9 world is correct.
- To roll back, replace the repository files with your archived **complete v0.8 release** and refresh. Changes made exclusively in v0.9 will not appear in the v0.8 save.
- Imports into v0.9 replace only its current save after confirmation; **Undo last import** supports reversing the most recent import.

## Acceptance checklist

1. Your v0.8 cabins, foundations, inventory, chests, crafting stations, discovered places, wolves, and waypoints load normally.
2. The new natural-color detail feels pleasant; iPhone movement and frame rate remain acceptable.
3. Planter allows planting all three crops, visibly growing, harvesting, and replanting.
4. Creative Supplies adds seeds; furnace can craft Vegetable Stew.
5. Chickens and rabbits move near the homestead without interfering with controls.
6. Bed rest, gathering, combat, building, and exploration still work.
7. Save → reload retains your farm plots, equipment, and buildings; JSON backup/export and import work.

## Verification limits

Source syntax and simulated runtime tests passed, including old-save migration, planting/harvest state, backup export and preservation. A real iPhone Safari graphics/runtime test is still required; successful simulated checks are **not** proof of device performance.
