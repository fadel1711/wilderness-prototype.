# Wilderness v0.20 — Echo Depths: Maze & Mining

**Complete GitHub Pages replacement — all 21 JavaScript modules, `index.html`, existing six bundled models/textures, and this README.** This is a playable candidate, not yet approved on iPhone.

## The new adventure

- Travel to **Echo Cave** on the eastern edge of the map. Enter through its original arch, pass the **original Echo Cave Cache** (still at its old position), and walk through the former rear dead-end into the new **Echo Depths**.
- Explore **28 connected maze cells** with **39 actual solid wall segments**, a rocky outer shell, cutaway ceiling, small torch markers and a discoverable map sketch. The maze is an expanded, interconnected cave *on the existing terrain plane*, not yet a separate vertically loaded underground world. The cave can be dimmer during daylight.
- Find **eight mineral veins**. Equip your stone or iron pickaxe; tap **Mine** near the rocks. Stone pickaxe needs three strikes; iron pickaxe needs two. On completion, each vein awards **5 stone + 3 iron ore**; depleted veins regenerate after **three minutes**. Regrowth uses wall-clock time, just as seed patches do. Harvesting is saved after each strike.
- Find and open the **Echo Depths Reliquary**: a one-time treasure with extra stone, iron ore and iron ingots. New discovery IDs do not replace original locations or original treasure.
- Existing v0.19.2 **automatic account-first Cloud Save** is retained. No new routine “Cloud or This Device?” prompt is added. Genuine different-account or divergent offline progress remains protected.
- All homestead, construction, farming, survival, clothing, campfires, resources, map, combat, jumping, multitouch, zoom, sunlight/moon and original save data remain supported.

## Installation from your iPhone — Supabase FIRST if Cloud Save is enabled

1. **Back up before deployment:** in the currently working v0.19.2 game, open Bag → Export world. Save the JSON in iPhone Files. Keep your v0.19.2 ZIP for recovery.
2. **Cloud Save users:** download the **SEPARATE PRIVATE v0.20 Supabase ZIP**. In the dedicated Wilderness Supabase SQL Editor, run `wilderness_v020_cloud_format.sql` and then `verify_v020_readonly.sql`. Confirm `versions_16_to_19_accepted=true`, `security_definer=false`, `row_level_security_enabled=true`, and owner-only policies. **DO NOT RUN ROLLBACK.** Do not run SQL in Dino Dominion. If verification fails, STOP—do not upload the new frontend yet.
3. **No Cloud Save?** Skip SQL entirely; v0.20 works with Safari local saves. You may configure cloud later.
4. Download and extract the **full public v0.20 game ZIP**. Open your Wilderness GitHub repository, replace root `index.html`, the twenty previous `.js` modules and `README.md`; add the NEW `deep-cave-system.js` alongside `game.js`. Keep the `assets/` folder and all six GLB/WebP files. Copy `ROADMAP.md` too. The ZIP contains complete replacements, not patches or snippets.
5. Commit to your GitHub Pages deployment branch (normally `main`), wait until Actions/Pages deployment succeeds and refresh the same game URL. It MUST say **Single-player · v0.20**. If it does not, reload Safari or append `?check=020` to the URL. **Do not clear website data.**
6. Open the Bag → Account & Cloud Save panel if signed in; verify that automatic sync is active. Allow some time for a complete sync before moving to another device. Export another JSON backup after your first mining session.

## Acceptance checklist

1. v0.19.2 cabin, chests, campfires, farms, clothes, inventory and discoveries migrate unchanged.
2. New Echo Depths is accessible through the OLD cave's back passage. Original cache is still present if not claimed.
3. The maze walls physically stop your character; paths are traversable, and you can return to the original exit.
4. The map reveals a compact maze sketch once the Echo Depths entrance is discovered.
5. Stone/iron pickaxe mines veins; reward is granted exactly once per depletion; the rocks regrow after three minutes.
6. Reload while a vein is partly mined and while depleted; progress remains consistent.
7. The Echo Depths Reliquary can be claimed only once and the reward survives reloading.
8. Cloud Save syncs the new ore and discovery state without extra routine device/cloud prompts (only after the private SQL has been applied).
9. Smooth enough in Standard/Low Effects on your iPhone; touch joystick, Jump, Gather and camera zoom still work.

## Rollback and recovery

- v0.19.2 uses `wilderness_v019_singleplayer` and **v0.20 uses `wilderness_v020_singleplayer`**. Both are kept; upgrading never clears the old version.
- v0.20 uses cloud JSON schema **version 19** (v0.19.2 used version 18). An old v0.19.2 frontend **cannot read a v0.20 schema-19 cloud world**; before frontend rollback, export the v0.20 JSON backup and avoid blindly replacing cloud data.
- Private SQL upgrades only `public.wilderness_save_world` to admit versions 16, 17, 18 and 19. It doesn't drop accounts or rewrite stored worlds. The rollback SQL is **EMERGENCY ONLY**; do not run it after v19-format cloud data exists unless backups and a verified recovery plan are in place.
- If a browser save fails validation, the game intentionally refuses to overwrite the damaged save. Keep all prior Safari storage intact. Never delete Safari website data to troubleshoot.
- The visual shell/collider region occupies roughly world x46–68 and z−84 to−71. Existing buildings in that previously walkable area are retained in save data but may visually overlap the new cave. Export a backup before approving the update, and report any overlapping structures.

## What was and was not tested

Automated pure-JS checks cover old world migration, connected maze layout, collisions, mining, cooldowns, rewards, JSON export/import, Supabase revision decisions, local module references and SQL admission. Syntax and ZIP integrity are verified before release.

**Not yet verified:** genuine Safari rendering/FPS, mobile joystick/roof camera around tight cave walls, or live Supabase SQL execution and sync on your account. No live GitHub or Supabase changes were made.
