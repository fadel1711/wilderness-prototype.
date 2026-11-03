# Wilderness v0.18 — Campfires, Firelight & Animated Smoke

**Standalone GitHub Pages game for iPhone and desktop.** Includes all previous Wilderness v0.17 features (existing premium nature models, zoom, sun/moon, multitouch, survival, farming, seeds, crafting, cave, combat, building, optional cloud saving), PLUS placeable campfires with a controllable fire, warm flickering lights and light wind-drifting smoke.

## Two ZIPs: keep PUBLIC and PRIVATE apart

1. **PUBLIC — `wilderness-prototype-v0.18.zip`**: upload the extracted game files into your **existing** Wilderness GitHub Pages repository. Includes `index.html`, **19 complete JavaScript files**, six bundled art assets in `assets/`, `README.md`, and `ROADMAP.md` (28 files total). Your already-configured `cloud-config.js` is included, with **only** the Wilderness project URL and the publishable (public) key. No SQL, passwords or service-role keys.
2. **PRIVATE — `wilderness-v018-private-backend.zip`**: contains the **single optional cloud format upgrade**, read-only verification, rollback SQL and security instructions. **Never upload its SQL to your GitHub Pages repository.** Cloud Save had to be expanded to accept save schema v17; the old v0.17 function accepts only schema v16. The private migration does **not** create a new project and does not rewrite saved cloud worlds.

## NEW — v0.18 campfires

- Open **Build → Campfire**. Placement costs **4 wood + 5 stone**; use the existing nudge, rotate and Place controls. Campfires also work in custom building blueprints.
- Walk to within ~2.75 m of a built fire and tap **Use** (the action button) to open its panel.
- Tap **Add 1 wood and light (+3 minutes)**. Each log adds 180 seconds of **active gameplay** burn time, up to 15 minutes total. The game limits construction to 24 campfires to protect mobile performance. The fire can be extinguished and relit without consuming remaining fuel. The fire turns off when fuel reaches zero. Fuel does not burn offline.
- Animated flames / glowing coals and **up to two flickering warm point lights** illuminate nearby ground, especially at night.
- Wind-drifting, rising smoke uses a **bounded billboard particle simulation**, NOT costly fluid-dynamics simulation. Standard Effects uses at most 72 shared smoke particles near the camera, Low Effects at most 9. Offscreen fires are excluded, and extinguished fires have no smoke or light.
- Dismantle via the existing **Build → Dismantle nearest** action (confirmation and material refund). Campfire state is removed with the building.
- Fire state, amount of fuel and placement all persist in JSON, Safari saves and supported cloud saves.
- **Not in this release:** cooking directly at a campfire, spreading forest fires, actual fluid/smoke physics, or any of the other v0.19–0.25 features. The existing furnace recipes remain unchanged.

## REQUIRED setup order (iPhone)

**Before changing anything:** In v0.17 use **Bag → Export world** to save a `.json` backup to Files. Save your working v0.17 ZIP. **Do not clear Safari website data.** The old `wilderness_v017_singleplayer` Safari save stays untouched in v0.18.

### A. Upgrade Supabase format first (only if you have v0.17 Cloud Save configured)

1. Download the separate **PRIVATE** backend ZIP and extract it in Files. Open `README_PRIVATE.md` and review the instructions.
2. Open **https://supabase.com/dashboard** → choose the existing **Wilderness** project, NOT Dino Dominion.
3. Open **SQL Editor** and paste `wilderness_v018_cloud_format.sql`. Review and run. **This changes one existing RPC function only** to accept save versions `16` and `17` while keeping per-user security / revision checks. It neither clears cloud worlds nor adds tables.
4. In SQL Editor run `verify_v018_readonly.sql`. Check that `accepts_both_save_versions = true`, `security_definer = false`, and `row_level_security_enabled = true`. If the results aren't right, stop here and do not depend on cloud sync yet.
5. If your v0.17 project SQL has **not yet been installed**, do the **v0.17 private backend setup first** and only then this v0.18 migration. The v0.18 patch alone is not a complete cloud setup.
6. If you don't use Cloud Save, **skip section A**. v0.18 local saves work with no database or sign-in.

### B. Upload the full PUBLIC game ZIP

1. Download and **extract** `wilderness-prototype-v0.18.zip` in iPhone Files.
2. Open your **existing Wilderness GitHub repo**, on the branch used by GitHub Pages (usually `main`).
3. **Replace all existing** root `.html` and `.js` files with the complete ones from the extracted ZIP. **Add new `campfire-system.js`** in the root next to `game.js` (not inside `assets/`). Include `README.md` and `ROADMAP.md` if desired.
4. Keep your `assets/` folder with the same six `.glb` / `.webp` files. They are included in the ZIP and don't need uploading again if already identical.
5. Commit changes, confirm GitHub Pages deployment succeeded, refresh the same Wilderness URL. Header: **Single-player · v0.18**.
6. Reopen **Bag → Account & Cloud Save**. If an existing v0.17 cloud copy differs from your upgraded local v0.18 world, the game may ask you to choose **Use this device's world** or **Use cloud world**. **Export a JSON backup before choosing.** If your up-to-date settlement is on this phone, normally choose **Use this device's world**. The conflict is intentional and should not silently overwrite either copy.
7. Test building/refueling/extinguishing a fire, refresh, and confirm its position/fuel survived. Test Low Effects and Standard Effects. If using Cloud Save, test **Sync Now**, then test restore on a second browser only after exporting backups.

## Acceptance checklist

- [ ] v0.17 settlement, cabins, raised floors, chests, crops, inventory, progress and stamina/hunger/water migrate unchanged.
- [ ] Build → Campfire costs 4 wood and 5 stone, places only on valid spots.
- [ ] Use at a fire opens the campfire panel; 1 wood adds 180 seconds of fuel and lights it.
- [ ] Smoke drifts upward while burning; flame/firelight visibly respond at night.
- [ ] Extinguish and relight preserve unused fuel; burn stops when the game is closed.
- [ ] Low Effects reduces smoke and extra lighting overhead, without hiding the fire itself.
- [ ] Dismantle removes the fire and refunds construction materials, without stale campfire records.
- [ ] Safari save/refresh and JSON Export/Import restore campfires. Older v0.17 save is still present.
- [ ] If online: Supabase upgrade verified, signed-in Sync Now works; conflict choice protects progress.
- [ ] FPS and two-thumb movement / jump / combat remain comfortable on the actual iPhone.

## Recovery and constraints

- To roll back the **website**, upload all previous v0.17 public files again. Your `wilderness_v017_singleplayer` Safari save was not overwritten. Changes made only in v0.18 will not appear in v0.17. **Export them first.**
- Cloud format v17 (campfires) cannot be restored by older v0.17 clients. If reverting the website, keep the v0.18 backend function (which accepts both versions) and explicitly choose / export a compatible local v0.17 world; avoid SQL rollback while newer cloud copies need to be preserved. The private ZIP includes emergency details.
- A separate v0.18 `wilderness_v018_pre_import_recovery` and `wilderness_v018_pre_cloud_restore` snapshot support recovery, plus Bag → Export world.
- Missing/Wrong `campfire-system.js` will trigger a visible startup file/version message. Upload **all nineteen** JavaScript modules together to avoid mixed releases.
- No remote repository, Supabase project or database changes were made by the packaged build. SQL remains **manual and approval-controlled**.
- Automated tests validate logic and file consistency; actual Safari WebGL smoke rendering, lighting and FPS are **not** verified until you test on the iPhone.
