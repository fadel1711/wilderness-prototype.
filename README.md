# Wilderness v0.19 — Survivor Wardrobe

This is the COMPLETE GitHub Pages game release (not a patch). It includes **20 JavaScript modules**, `index.html`, 6 unchanged GLB/WebP assets, and this README plus `ROADMAP.md` (29 total files). All prior gameplay remains: cloud save, campfires, 3D foliage, zoom, sky, farming, survival, jumping, combat and crafting.

## New in v0.19

- Open **Bag → Survivor Wardrobe** to select any of 5 jacket/coat outfits, 4 trousers, 3 boot styles, 4 hair colors, and toggle a hood or scarf. Changes immediately recolor the ACTUAL 3D survivor and show/hide the added accessory meshes. These are **cosmetic, always unlocked, no stats and no new resource grind**.
- Save format **version 18** adds validated `wardrobe` data; old version 17 saves (v0.18) migrate with Woodland Ranger defaults. Current game saves to `wilderness_v019_singleplayer`, keeping v0.18 Safari data separately for rollback.
- Import older backup JSON as usual. Export includes wardrobe; recovery snapshots include it. Cloud backup includes it **after** the dedicated private Supabase RPC format migration.
- No 3D asset, collision, world-generation, crafting recipe, equipment, economy or authorization schema changes. Existing nature models and campfire visuals remain.

## iPhone deployment steps — follow IN ORDER

1. **Back up first:** On working v0.18 use **Bag → Export world** to download a world JSON to the iPhone Files app. Keep your v0.18 complete ZIP. Never clear Safari site data.
2. **If using Cloud Save:** Download the separate PRIVATE `wilderness-v019-private-backend.zip` (not inside this public ZIP). Open `README_PRIVATE.md`; in your **Wilderness** Supabase project SQL Editor, run `wilderness_v019_cloud_format.sql` FIRST, then `verify_v019_readonly.sql`. Check the returned outputs before continuing. This changes only the existing `wilderness_save_world` security-invoker function to accept JSON versions 16, 17, **18**. **Do not run rollback.** If you do not use cloud saving, skip SQL. Never upload private SQL to GitHub.
3. Extract this public ZIP. In the existing Wilderness GitHub Pages repository, replace all existing root `.html` and `.js` files, adding **`wardrobe-system.js`** alongside `game.js`. Do not rename files, nest the JS inside folders or leave older copies in place. Upload README and ROADMAP if you like.
4. Preserve your `assets/` folder with the six matching `.glb` / `.webp` files. The complete ZIP includes all six, but existing identical files need not be reuploaded.
5. Commit to the published branch, usually `main`; verify GitHub Pages deployment succeeded. Reload the same URL. It should display **Single-player · v0.19** and have an opening modal labeled Survivor Wardrobe.
6. Open Bag → Survivor Wardrobe. Try jacket, pants, boots, hair, hood and scarf; close Bag to inspect your character from behind while walking or jumping. Save, refresh, and confirm the look remains.
7. If cloud saving: Sign in under Bag → Account & Cloud Save and check `Sync now`. On first v0.19 sign-in, if the older v0.18 cloud copy and new local world differ, **export a JSON backup first**, then choose the device that actually has the newest settlement. Test restore from another device only after both local and cloud backups are verified.

## Acceptance tests

- [ ] All old v0.18 buildings, storage, campfires, farming, hunger, position, inventory and discovered landmarks load unchanged.
- [ ] Outfits and pants recolor the real survivor, not just the wardrobe buttons.
- [ ] Boots and hair visibly change; hood and scarf show/hide without covering eyes/camera.
- [ ] Saving, refresh, Export/Import and Undo Import retain the chosen clothing.
- [ ] Standard/Low Effects and multitouch movement, jump, combat and camera continue working.
- [ ] After PRIVATE migration (if using cloud): `Sync now` succeeds and outfit survives sign-in on a second device.

## Recovery / limits

- To undo website changes, restore the entire v0.18 public ZIP; its `wilderness_v018_singleplayer` Safari save still exists. v0.19-only outfit choices will not load in the old code. Export a JSON before reverting.
- Leave the new backwards-compatible SQL function in place when rolling back the website; the old v0.18 client does not understand JSON version 18, so explicitly use/restore a version 17 backup if necessary, after exporting all newer data. SQL emergency rollback is only for an incident reviewed with the developer, not routine installation.
- Styling is on the existing procedural 3D avatar; these are palette/outfit accessory changes, **not** fully modeled unique costumes, and not yet high-end character animations. The actual Safari result and frame rate still need on-device testing.
- This package does not modify the live GitHub repository or Supabase database.
