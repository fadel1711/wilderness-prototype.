# Wilderness v0.5.2 — Raised Cabin Door + 999/999 Creative Supplies

**Full five-file replacement for your existing GitHub Pages single-player project.**

## What's fixed

1. **Raised cabin entry:** The prefab cabin has a wider visible doorway and corresponding wider collision opening. The movement controller tolerates the 0.28m height change from raised foundations/steps into the cabin floor; stairs, walls, and building logic remain active. Existing cabins are redrawn on load with the new doorway (no rebuilding required). The solid parts of walls still block walking.
2. **999 wood + 999 stone automatically:** On first launch of v0.5.2 at the *same GitHub Pages address and Safari profile*, the game raises BOTH resource quantities to **at least 999** (without subtracting any you already had). This happens **once**, and the new totals are saved. You don't need to restart the world.
3. **Refill any time:** Bag → **🪵 🪨 Refill to 999 each**. This brings each material back up to at least 999 whenever you need more. Spending resources still works normally. This is a convenient prototype building/testing feature, not an online admin action.
4. **Save protection:** The previous v0.5 save is copied once to a separate pre-grant browser key, where possible, before resource changes. Older v0.4, v0.3 and v0.2 saves retain their keys. Building positions, blueprints, terrain resources, equipped tools, imported backups and inventory data use the SAME v0.5 save schema as before.
5. **Cache consistency:** All module imports have matching v0.5.2 version parameters so Safari requests the new files, not old versions.

## ZIP contents

- `index.html` — complete game page and buttons
- `game.js` — complete game code, doorway collision, movement and creative refills
- `construction.js` — original v0.5 construction and blueprint rules
- `save-system.js` — original v0.5 inventory and save format
- `README.md` — this guide

Upload the five **extracted** files, NOT the ZIP itself. No Supabase, SQL, sign-in, or new repository is required.

## Update using your iPhone

1. **Before changing files:** Open your current working v0.5.1 game in Safari. Tap **Bag → Export world** and save the `.json` file to your iPhone's Files app. Confirm the file is there. Keep your previous v0.5.1 ZIP as an additional rollback copy.
2. Download and extract `wilderness-prototype-v0.5.2.zip` from this chat in the iPhone Files app.
3. Open your **existing Wilderness GitHub repository** in Safari. Use **Add file → Upload files** to replace all five files in your repository root: `index.html`, `game.js`, `construction.js`, `save-system.js`, `README.md` (if the GitHub mobile UI doesn't let you overwrite directly, open each existing file, choose Edit and replace its entire contents with the new version). Do not nest files in a subfolder.
4. Commit everything to the existing `main` branch.
5. Open the repository's **Actions** tab and verify that GitHub Pages finishes deploying successfully.
6. Reopen your **same GitHub Pages game URL** in Safari and refresh. Confirm the top-left label says **Single-player · v0.5.2**. **Do not clear Safari website data or use a different Safari profile**, because your single-player save is stored locally per website.
7. The HUD should show **at least 999 Wood and 999 Stone**. Open **Bag** to see the new **Refill to 999 each** button. You can click it again whenever building materials run low.
8. Test your **existing raised cabin**: walk up the stairs, approach the *center* of the wider entrance and walk inside. Turn around and walk back out. Try the walls to verify you still cannot pass through them.
9. Tap **Save**, refresh the page, and verify your cabin, progress and remaining wood/stone survive. Export a fresh v0.5.2 JSON backup from Bag after confirming everything works.

## Acceptance checklist

- [ ] Game loads and HUD says `v0.5.2`.
- [ ] The old cabin, foundation, stairs, blueprints and resources are still present.
- [ ] 999+ wood and 999+ stone appear automatically on first launch.
- [ ] Character enters the existing raised cabin, even when slightly off center, and can exit.
- [ ] Walls remain solid; steps and doorway are walkable.
- [ ] Constructing a piece deducts the correct resources.
- [ ] Bag → Refill to 999 each works after spending resources.
- [ ] Refresh preserves buildings and inventory; exported JSON backup is valid.
- [ ] Movement, camera and compact Build/Pieces panel still work.

**If the door still blocks movement:** take one screenshot showing the character and stairs from the side, and another with the character standing at the threshold. The screenshots help identify an incorrectly positioned/rotated stair or overlapping structure in that specific save. Avoid deleting or relocating buildings until the cause is clear.

## Rollback / save safety

If v0.5.2 has a problem, **export its world** (if the game still opens), then upload the complete five-file v0.5.1 ZIP to the same GitHub Pages repository root. The v0.5 browser save schema and key (`wilderness_v05_singleplayer`) are unchanged, so rollback is structurally compatible. **Do not delete Safari site data**. The original v0.4 save key also remains separate.

One-time grant metadata is stored under `wilderness_v052_creative_grant` and a pre-grant snapshot (when possible) under `wilderness_v052_before_grant`. These are private local browser records and are not placed in your public GitHub repository.

## Verification performed

- `node --check` on `game.js`, `construction.js`, `save-system.js`.
- Simulated game runtime validated legacy save migration, 999/999 grant, one-time grant behavior, manual refill, resource consumption, blueprint/building preservation, backup export/import, and raised cabin entry from several sideways offsets.
- The simulated collision tests also confirmed the remaining cabin walls stop the player.
- Static mobile layout checks passed at 375×812, 390×844 and 844×390; the new refill button is available in the backpack.
- **Still unverified:** full 3D rendering and physical touch controls on your actual iPhone Safari. Your acceptance test is needed before calling the hotfix fully stable.
