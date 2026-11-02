# Wilderness v0.7 — Combat & Survival

**Single-player • Third-person 3D • GitHub Pages / iPhone Safari • complete replacement package**

This v0.7 release adds a first melee-combat loop without changing your existing woodland visuals, construction, crafting, chests, 999-material refill or movement controls. There is no multiplayer, backend, account, payment or paywall. The 3D engine uses Three.js from a public CDN and needs an internet connection on first launch.

## FIRST: protect your approved v0.6 world

1. Open the existing Wilderness v0.6 website in the **same Safari browser** where you play.
2. Tap **Bag → Export world**, and save the `.json` file in the iPhone **Files** app.
3. Confirm that the file exists and keep your old `wilderness-prototype-v0.6.zip` too.
4. **Do not clear Safari website data, change your Pages URL, create a new repository or delete saved data.**

v0.7 reads `wilderness_v06_singleplayer` (plus older legacy saves if needed) and creates its **own new key** `wilderness_v07_singleplayer`. The upgrade code never overwrites the original v0.6 key. v0.7 preserves previous buildings, furniture, custom blueprints, inventory, equipment, chest contents, resource states and position. New saves also hold health, stamina and temporary wolf-defeat state. Local browser storage is not cloud storage: always keep the downloaded JSON backup.

## iPhone GitHub upload — replace the COMPLETE files

Unzip `wilderness-prototype-v0.7.zip` using the iPhone Files app. The seven complete files are in the root of the ZIP:

| File | Action |
|---|---|
| `index.html` | Replace existing complete file |
| `game.js` | Replace existing complete file |
| `construction.js` | Replace existing complete file (unchanged construction logic) |
| `save-system.js` | Replace existing complete file (v0.7 save migration) |
| `craft-system.js` | Replace existing complete file |
| `combat-system.js` | **ADD NEW FILE** — required for startup |
| `README.md` | Replace existing instructions |

1. In Safari, open your **existing Wilderness repository**, not the Dino Dominion repository.
2. Open the repository's root folder containing `index.html`.
3. Use **Add file → Upload files** (request Desktop Website in Safari if needed). Upload **all seven** files from the extracted folder, replacing matching names in the root. If GitHub doesn't allow direct same-name upload on mobile, open the existing file's pencil/Edit control and replace its entire contents instead; do not upload the ZIP itself.
4. **Commit all changes to `main`.** The original `/(root)` GitHub Pages source/settings remain unchanged.
5. Open **Actions** and confirm Pages deployment completed successfully.
6. Reopen your **same game URL**; refresh and verify the header shows `Single-player · v0.7`. If it still says v0.6, Pages may not have deployed or Safari may be showing an older file. Reopen the website without clearing browser data.
7. On first start, the game should say your existing v0.6 world was upgraded. Keep your v0.6 JSON as your rollback point.

## Combat instructions (iPhone)

- For testing without grinding: **Bag → Claim free sword + shield**. Both items appear in the backpack; this does **not** remove anything.
- Use the **Sword** button in the equipment strip (Axe/Pickaxe/Sword). Then the compact combat controls appear.
- **Attack:** tap when close to a wolf and facing it. Attacks cost stamina and have a short cooldown.
- **Block:** **hold** the Block button as the wolf bites. With a shield in your inventory, damage is reduced but blocking consumes stamina.
- **Dodge:** tap to dash briefly forward with a short invulnerability window. It costs stamina; time it near the wolf's attack.
- Watch the **HP/SP** bars near the top-left. Stamina refills while resting/not sprinting or blocking. Health gradually recovers inside a protected homestead; an existing bed can instantly restore both meters when you walk close and tap Use.
- **Safe homestead:** a protected region surrounds the start clearing and every existing cabin. Wolves are kept out, do not attack you in this area, and **never destroy buildings or inventories**.
- **Defeat:** you return near your home fully recovered; inventory, buildings, and storage are kept. No dropped backpack, lost supplies, or pay-to-revive.
- Three wolf encounters are placed in the outer woods. Wolves wander, chase nearby characters, telegraph bites, and retreat when you escape. Wolves driven away may reappear after about 90 seconds. Combat is optional; you can build and farm without fighting.
- Keyboard: **WASD** or arrows move, Shift sprint, **1/2/3** equip tools/sword, **X** attack, **hold Q** block, **C** dodge, **E** gather or Use, **I** Bag, **B** build.

## What did NOT change

Your approved coloring, character appearance, cabins, foundations, stair access, placeable furniture, construction menus, storage chests, furnace, crafting, joystick mapping, save backups, and **Bag → Refill supplies** remain available. This is intentionally a basic indie combat prototype, not photorealistic graphics. Bow fighting and additional enemy species are NOT part of this update.

## Acceptance checklist on your iPhone

1. **Migration:** all existing buildings, wood/stone, chests and inventory survive; the header shows v0.7.
2. **Movement:** left/right, camera, stairs and raised cabin doors still work.
3. **Free gear:** Claim free sword + shield in Bag, equip Sword, and see Attack/Block/Dodge buttons.
4. **Wolves:** travel beyond your homestead to find a wolf; approach to see it chase and attack.
5. **Melee:** face a wolf, tap Attack, verify hit feedback and wolf defeat after repeated successful strikes.
6. **Defense:** hold Block to reduce bite damage; use Dodge to avoid attacks; see stamina usage and regeneration.
7. **Safe home:** return near a cabin and verify wolves do not attack you there; rest at a bed if available.
8. **Defeat:** deliberately let a wolf defeat you, then verify your homes, backpack and resources are intact after respawning.
9. **Save:** save, refresh, re-equip the sword, verify health/stamina and saved world.
10. **Backups / performance:** export and re-import a v0.7 JSON after making another export; verify no severe slowdown or missing files.

## Safe rollback to v0.6

If v0.7 fails to start or has a blocking gameplay bug:

1. **Do not clear website data or start deleting saves.**
2. Re-upload the six **complete files from the original v0.6 ZIP** (`index.html`, `game.js`, `construction.js`, `save-system.js`, `craft-system.js`, `README.md`) to the same GitHub repository root. You can leave the extra `combat-system.js` present; v0.6 won't use it.
3. Commit to `main`, confirm GitHub Pages deployment and reopen the **same URL**.
4. v0.6 reads its original `wilderness_v06_singleplayer` save key, which v0.7 migration did not change. New v0.7-only combat progress will not appear in v0.6. Keep the v0.7 JSON if you want to restore it later.
5. If startup displays an error or migration warning, screenshot it and stop before importing an older JSON over the current world.

## Verification and honest limits

Automated tests cover JavaScript syntax, legacy v0.6-to-v0.7 migration, existing cabins/chests/resources, free kit, wolf damage, stamina, block/dodge calculations, world save/export and corrupted backup rejection. Simulated runtime tests cannot guarantee 3D rendering, full combat feel or mobile frame rate on your particular iPhone. The browser screenshot test environment is unavailable in this session, so **Safari acceptance testing remains essential**. This is a prototype, not a finished game or a guarantee of zero bugs.
