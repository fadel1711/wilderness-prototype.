# Wilderness v0.23.1 — Four Living Villages, Interiors, Chests & Barter

**Full ready-to-upload GitHub Pages game package.** This update includes all game files and all six GLB/WebP assets. No partial snippets. A separate SQL ZIP is **not required**: the validated save JSON schema remains **version 21** and the existing v0.22+ Wilderness Supabase cloud RPC already accepts it.

## What's new

- **Four settlements total**: previous Amberfall Village remains at **X -112, Z +113**; Stonebrook Hamlet at **X +112, Z +110**; Briarhaven at **X -113, Z -112**; Sunridge Crossing at **X +113, Z -111**. Three are new to v0.23.1. Each appears as a hidden map discovery until visited, then can be selected as a waypoint.
- **26 larger houses** across all villages. All are *real hollow rooms* with walkable floors and collision around perimeter walls. Approach the front door and tap **Door** to swing it open or closed. The roof hides while you are inside to support the third-person camera.
- **21 villagers** with morning/work/plaza/evening routines. Villagers stay within their settlement. NPC models and houses render only near their villages to reduce mobile rendering load.
- **13 village supply chests**, placed in some houses. Approach a chest from inside and tap **Loot**. Chest rewards are pseudo-randomly generated **from the house's permanent ID**: every chest can have different supplies, but refreshing never rerolls it. One claim per chest per world, tracked in existing `exploration.claimed`, protected by save validation. Chest lids display as opened after claiming.
- **Barter trading**: talk to any daytime villager to open the mobile-friendly trade interface. Exchanges use existing wood, stone, food, seeds, charcoal and ore. Items are only subtracted if the entire trade can complete; any failed local save rolls the trade back. No currency, reputation or new unapproved resources.
- **No joystick rewrite**: the v0.22 touch-recovery fix and v0.23 landscape HUD and dual-thumb controls are unchanged.

### Why no Supabase SQL?

Save JSON stays on **version 21**, with all new treasure claims in the **existing validated exploration field** and all trades in the **existing inventory**. The current Wilderness SQL accepts v21. The account-first autosave baseline (`wilderness_v019_cloud_baseline`) and owner-only cloud RPC are unchanged. No Supabase tables or policies are created or modified by this ZIP.

**Important cross-device rule:** Update ALL browsers/devices that access your Wilderness account to **v0.23.1 before opening village chests or making trades**. An old v0.23 client cannot validate new v0.23.1 chest-claim IDs in a newer cloud save. Leave old clients closed. Keep a JSON export before upgrading.

## Install from an iPhone

1. On the working v0.23 site, open **Bag → Export world** and save the JSON file to Files. Keep the previous v0.23 ZIP.
2. Download/extract `wilderness-prototype-v0.23.1.zip` in iPhone Files.
3. Open your **existing Wilderness GitHub repository** in Safari. On the GitHub Pages deployment branch (usually `main`), replace every existing root `.html` and `.js` file with the full files in this ZIP. Do not upload the ZIP itself or a nested `wilderness-prototype-v0.23.1` wrapper folder.
4. Keep the `assets/` folder intact with `pine.glb`, `oak.glb`, `moss-boulder.glb`, `forest-ground.webp`, `stone-path.webp`, `timber-planks.webp`. All six are included in this ZIP.
5. Upload `CRAFTING_PROPOSALS.md` optionally; it is **not game code**. Commit changes and verify GitHub Pages deployment succeeded.
6. Refresh the game's original URL. It should show **Single-player · v0.23.1**. The HTML boot checker uses cache-busted `?v=0.23.1` imports to avoid mixed module versions.
7. Open Map, travel to one of the four village quadrants, discover the name, open a house, find a supply chest, and trade with a villager during the day.
8. Save, refresh, check the claimed chest remains empty and items remain in the backpack. Check your old house, stairs, cave, campfires, wardrobe and automatic cloud sign-in.

**No SQL migration and NO rollback SQL** for this release. Your configured `cloud-config.js` and publishable key remain included. Never upload SQL/admin secrets to a public GitHub site.

## Suggested acceptance tests

1. Landscape and portrait layouts still function; joystick + Jump simultaneously and `↻ Unstick` still work.
2. All four village markers discover normally; old Amberfall progress is preserved.
3. Door opens, you enter, roof hides so the room is visible, and you can exit and close the door.
4. An NPC house is suppressed if it would overlap one of your existing player builds.
5. Some houses have supply chests; other houses do not. Looting a chest gives supplies once only, even after refresh.
6. Daytime villager interaction opens the trade panel. Trade costs and rewards are shown before approval. Trading without adequate supplies is blocked.
7. Both local save and Cloud Save retain village discovery, loot claims and new inventory quantities.
8. A second device running v0.23.1 loads the same cloud world automatically without normal sign-in choice screens.
9. Cavern mining, campfires, clothes, two-storey construction and hunger/thirst/sleep still work.
10. Performance remains acceptable on a physical iPhone in Standard and Low Effects.

## Rollback / recovery

- Your **previous v0.23 Safari save** (`wilderness_v023_singleplayer`) is preserved separately. v0.23.1 uses the new `wilderness_v0231_singleplayer` key.
- Do NOT clear Safari website data. To recover, use your exported backup and redeploy previous ZIP only if needed.
- **Older code cannot read newer chest-claim IDs** after you've looted village chests. Do not run an old build against an account whose cloud save already includes those claims; older builds can show a save validation error. Keep all devices updated or restore an older pre-v0.23.1 backup deliberately.
- If a live cloud sync problem appears, export your current v0.23.1 world before changing anything. No Supabase rollback exists or is needed for this update.

## Verification limitations

All 36 focused automated checks passed: landmarks, villagers, house collision, door entrances, save migration and claim validation, stable chest loot, existing item catalog, barter offers, source/module imports, input-recovery preservation and JS syntax. A stubbed Three.js scene-assembly test built all 26 house groups and 21 NPC models and exercised room/door updates. This is **not** a real WebGL screenshot or an iPhone frame-rate/Cloud Save integration test. You should approve rendering and touch behavior only after testing on Safari.
