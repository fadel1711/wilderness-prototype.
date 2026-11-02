# Wilderness v0.8 — Exploration & Discoveries

**Single-player, third-person 3D browser prototype.** This is a full GitHub Pages replacement package, not a patch. No database, account, payments, ads, or Supabase setup.

## What's new

- Larger forest, extending exploration from roughly ±46 to ±86 world units, with **independently generated outer woodland** so original trees, rocks, and saved resource IDs keep their positions.
- Discoverable **Forgotten Camp**, **Stonewatch Ridge**, **Echo Cave Entrance**, and **Echo Cave Cache**.
- Physically enterable cave corridor with rock walls, modest torches and a hidden supply cache; the cave ceiling becomes invisible when you are inside so you can see your character.
- A touch-friendly **Map** button, position marker, home marker, mystery markers, selectable waypoint and directional arrow and approximate distance readout. Tap a map location to set/clear its waypoint.
- Two one-time treasures (Forgotten Camp and cave cache) with material rewards. **Forgotten Camp** cache also unlocks the **Ranger Rest** blueprint in Build.
- v0.7 combat, cabins, elevated foundations, tools, chest storage, crafting, creative refills, and all current mobile controls remain.
- **Versioned v0.8 save slot**; the original v0.7 browser save key is neither edited nor deleted during migration.

### Exactly eight files to upload together

```text
index.html
game.js
construction.js
save-system.js
craft-system.js
combat-system.js
exploration-system.js   <-- NEW, required
README.md
```

All files must be in the **same top-level (root) folder** of the **existing** Wilderness repository. `index.html` refers to `game.js`, which uses ES modules. Missing even one of the six `.js` files will prevent startup. The 3D renderer loads Three.js from jsDelivr, so Safari requires network access. Do **not** upload the ZIP itself to GitHub Pages.

## iPhone: safe deployment

1. Open your **working v0.7 game** on your iPhone in Safari. Choose **Bag → Export world**. Save that JSON file to **Files** and check it exists. Keep the old v0.7 ZIP too.
2. Download the v0.8 ZIP from the ChatGPT message and tap it in iPhone Files to extract it.
3. Open the **same** Wilderness GitHub repository. Do **not** create a new repo and do **not** change GitHub Pages settings.
4. Replace `index.html`, `game.js`, `construction.js`, `save-system.js`, `craft-system.js`, `combat-system.js`, and `README.md` with the complete files from v0.8. **Add the new `exploration-system.js`**. Upload all eight files in the same commit when possible.
5. Commit to the existing `main` branch. Check GitHub **Actions** for a successful Pages deployment.
6. Open the existing GitHub Pages URL in Safari and refresh. It should display **Single-player · v0.8**.
7. Confirm the **old cabin, chest inventories, builds, equipment, resources, health, and player position** remain. Then export a **new v0.8 JSON backup** from Bag.

**Never clear Safari website data or local storage.** That is where both v0.7 and v0.8 worlds live. If Safari shows old content after Pages deployed, reopen the tab or refresh rather than erasing browser data.

## How to explore

- Tap **🗺 Map** near the top-right, see the white player dot, choose any location row to set a waypoint. Tap **Close** or select a location to return to the world.
- A small arrow (relative to the camera) and distance indicator show the active waypoint. Tap **Map → Homestead** to navigate home. Compass is an approximate distance guide; there is **no automatic pathfinding or fast travel** in v0.8.
- Walk toward **Forgotten Camp** (left side of map), **Stonewatch Ridge** (lower-right), and **Echo Cave** (upper-right on map). The scenery at new sites is stylized and deliberately lightweight.
- The cave mouth is open facing toward the center of the map. Walk in and follow the rock corridor to a chest near the back. The top of the cave hides when your character is inside.
- Walk close to a treasure crate, then tap **Open** in the same on-screen action area you use for gathering. A crate disappears after its **one-time** reward is claimed. Leaving the map and reloading does not reset claims.
- Once you open the **Forgotten Camp** box, **Build → Ready-made blueprints → Ranger Rest** becomes available. It uses the same material and placement rules as other structures; it is not a premium item.
- To test freely, **Bag → Refill supplies** still works.
- Keyboard: WASD movement, drag the mouse to turn camera, **M** open map, E interact, I backpack, B build, 3 sword, X attack, hold Q block, C dodge.

## v0.8 acceptance checklist

- [ ] Existing v0.7 settlement, equipped tools, backpack, chests, health, and world position preserved
- [ ] Normal iPhone joystick, camera, gathering, building, crafting, and wolves still work
- [ ] Map opens/closes, displays player/home, and tapping a waypoint updates the distance
- [ ] Can walk into the outer woodland and discover Forgotten Camp
- [ ] Camp treasure opens once and unlocks Ranger Rest; cannot repeatedly claim
- [ ] Stonewatch Ridge is visitable and recorded as discovered
- [ ] Echo Cave has an open entrance, solid side walls, and walkable interior
- [ ] Cave cache opens once; no double rewards
- [ ] Save, refresh, and JSON backup preserve discoveries, claimed caches and waypoints
- [ ] On-device graphics, touch controls, and performance remain acceptable

## Save format and rollback

- `wilderness_v07_singleplayer`: **v0.7 original**, read-only during v0.8 upgrade.
- `wilderness_v08_singleplayer`: **new active v0.8 save**, which additionally records `exploration: {discovered, claimed, waypoint}`. Save structure version is `7` (v0.7 used schema version `6`).
- `wilderness_v08_pre_import_recovery`: temporary **undo last import** slot if applicable.
- On first successful startup, if no v0.8 save exists, v0.8 reads v0.7 (or earlier if applicable), validates the contents, and writes only the v0.8 key. Old buildings, resources, storage, inventory, gear and combat data are copied. Invalid save input will **not** be overwritten.
- **Rollback:** if needed, replace the public GitHub files with the full **v0.7 ZIP**, commit and redeploy Pages. The game will read its untouched v0.7 local save. **Progress made only after v0.8 migration will not appear in v0.7.** Your v0.8 browser slot remains if you later reinstall v0.8.
- **JSON import:** from Bag → Import world, v0.8 supports valid older Wilderness backups and upgrades them to v0.8. It asks confirmation before replacing the active v0.8 slot. Export a backup of the current world first. Use **Undo last import** if necessary.

## Known limits and design intent

- The cave is a **single open walk-in tunnel in the shared 3D world**, not a separately loaded underground dungeon. It has no cave boss or new enemy type yet.
- Map is a simplified schematic (not GPS, not exact terrain). Distance is straight-line world units, not journey duration.
- Trees and rocks on the new outer ring are kept sparse to protect mobile performance; this is not an endless open world or procedural save stream.
- Existing v0.7 wolves roam the original wilderness. No multiplayer, quests, water swimming, new sword styles, or farming added in v0.8.
- Automated syntax, save, placement, exploration and runtime simulation are developer checks, **not a claim of on-device Safari GPU testing**. Player acceptance is required before treating v0.8 as stable.
