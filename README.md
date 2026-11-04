# Wilderness v0.23 — Landscape-First + Living Village

**Complete, ready-to-upload GitHub Pages release (34 files).** All JavaScript/HTML files and the original 6 GLB/WebP assets are included. Replace the entire matching root package; add `village-system.js` beside `game.js`. Keep `assets/` as a subfolder, not alongside the source files.

This is one deliberately scoped combined release: landscape-first mobile layout and **one** detailed, low-cost living settlement. It is **not** a complete multi-village economy or full NPC pathfinding simulation.

## What changed

### 1. Landscape-first iPhone gameplay

- Rotate your phone horizontally. The game's CSS automatically rearranges the HUD, survival meters, map, zoom, joystick, Jump, combat, backpack, building menu, cloud panel and crafting panels to use the wider screen. Portrait play remains supported.
- The original v0.22 `DualInput` + `InputRecovery` pointer logic is **retained** (same joystick owner, global touch release, `↻ Unstick`). Moving with the left thumb while using Jump / Attack / Talk with the right remains supported.
- The onboarding card has been shortened substantially. A brief portrait-only orientation hint fades away automatically.
- The desktop keyboard/mouse workflow still works. This does NOT forcibly rotate Safari; a normal web page cannot depend on that permission.

### 2. Amberfall Village — northwestern outer wilderness

- **Eight** small textured-style timber houses, stone paths, crossroads, an open village square, a well, gardens, poles and a communal fire ring.
- **Six NPC villagers**, with named jobs (farmer, woodcutter, baker, guard, gardener, resident). They have small walking animations and distinct routes to work, the village square and their homes. Their day/night timetable derives from the existing game clock; they never roam outside the village.
- A resident within interaction range adds **💬 Talk** to the existing right-hand action button. Conversations are short, fixed role-appropriate lines. There is not yet trading, recruitment, voiced dialogue, or enterable NPC-house interiors.
- NPCs are rendered/updated only near the village for mobile performance; Low Effects reduces their idle-motion and lighting cost. Village buildings are collidable; NPCs are not damageable.
- New `🏘️ Amberfall Village` map landmark, discoverable in-game with a selectable waypoint. Village discovery persists using the *existing* exploration-save field.
- The village is at **X -112, Z +113** in the existing expanded world. Historical trees/rocks keep the same IDs and coordinates; outer foliage close to the village buildings is hidden, not renumbered/deleted.
- If a player's own existing construction overlaps a proposed NPC house, that NPC house is hidden so the player's saved building takes priority.

### Data safety and cloud compatibility

- The older v0.22 Safari local key `wilderness_v022_singleplayer` remains **read-only**; v0.23 creates `wilderness_v023_singleplayer`. Export a JSON backup from v0.22 first.
- The JSON schema remains **version 21**, already accepted by the v0.22 Wilderness SQL migration. No new data fields, items or tables were added. This release **does not need Supabase SQL** if v0.22 cloud saving is already working.
- Cloud Sync retains the previously accepted account-first autosave and revision-based conflict protection. The baseline metadata key has not changed. The separate local cloud recovery slot is also preserved.
- Existing two-storey homes, crates, seed patches, cave maze, ore states, campfires, wardrobe, health, inventory, day/night and outer resource IDs remain supported.

## Exact iPhone upload — GitHub only (no SQL)

1. Open **working v0.22** → Bag → **Export world**. Save the JSON to iPhone Files. Keep your v0.22 ZIP; do not clear Safari website data.
2. Download and extract `wilderness-prototype-v0.23.zip` in iPhone Files.
3. Open your existing Wilderness GitHub repository, on the branch that GitHub Pages deploys (usually `main`).
4. Replace **every existing root `.html`/`.js` file** with the corresponding complete file in this extracted package. **Add `village-system.js` at the repository root** beside `game.js`; don't upload a nested `wilderness-prototype-v0.23/` folder.
5. Ensure `assets/` still contains **pine.glb, oak.glb, moss-boulder.glb, forest-ground.webp, stone-path.webp, timber-planks.webp**. They are also included in the ZIP. Do not flatten the assets folder.
6. Commit. Open GitHub Pages deployment status, then refresh your usual game website. The header must show **Single-player · v0.23**. The boot checker uses `?v=0.23` to avoid mixing older JS modules.
7. Turn your iPhone sideways. Enter the forest; hold the left joystick while tapping Jump or Attack. Check `↻ Unstick` if an interrupted gesture lingers.
8. Open Map, select **Unexplored location** in the northwestern outer region, and travel to **Amberfall Village (X -112 / Z +113)**. Once discovered, the map reveals its name. Talk to villagers during the day.
9. Save, refresh, reopen your world, verify second floors/caves/campfires and Cloud Save (if already configured) still work. If any cloud conflict appears, export a backup before selecting a copy.

## Acceptance tests on iPhone

1. Both landscape and portrait work; landscape is more comfortable and does not hide the player behind HUD elements.
2. Landscape joystick + Jump; joystick + Attack; joystick + Talk with a second finger.
3. Open Bag, Map, Build and Cloud panel sideways; scroll and close them safely.
4. Stuck-touch recovery still works after backgrounding Safari, orientation changes and opening panels.
5. Village houses, paths and residents appear after travelling to Amberfall; no villagers wander outside the settlement.
6. Villagers walk during daytime, gather around the square, and return home after sunset. Approach a daytime villager and tap Talk.
7. Collidable NPC house walls work. A saved player building in the village area isn't overwritten by a village house.
8. Save and refresh: original construction, upper floors, cave loot, mining, campfires, clothing and village discovery remain intact.
9. When signed in, cloud autosave and restoring from another device still work without routine world-choice prompts.
10. Standard and Low Effects perform acceptably on the actual iPhone.

## Verification limitations

Node JS syntax checks, pure-state save migration, deterministic NPC schedules, safe walking paths, map/landmark validation, desktop-sized CSS layout tests and ZIP/file-integrity checks were completed locally. The static HTML/CSS layout was checked at 667×375, 844×390, and 932×430; the camera/game engine could **not** be rendered end-to-end in the available browser environment due network restrictions. These checks are **not a substitute for real Safari WebGL, multitouch, framerate or live Supabase testing**.

## Rollback

If v0.23 misbehaves, deploy your preserved v0.22 ZIP (all files and assets). Your v0.22 Safari save stays untouched. Do **not** run any SQL rollback. If you have continued playing v0.23 and want to revert, first export its JSON backup; saves from newer versions may include newly discovered locations that older versions do not understand.
