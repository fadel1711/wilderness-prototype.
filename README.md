# Wilderness v0.24.2 — First Steps (mandatory new-world tutorial)

This is a full game replacement ZIP, not a patch. It builds on **v0.24.1 Guest Mode** with **v0.24.0 balanced Nightfall zombies** and the same `assets/survivor-animated.glb`.

## The new first-time experience

On a truly **new world** (Guest or account), the player must do these real gameplay tasks before the full sandbox opens:

1. **Move** 3 metres with the joystick.
2. **Gather** at least 3 wood from a real tree and 2 stone from a real rock with the proper starter tools.
3. **Build** an actual Workbench on clear land. A one-time, small starter materials pack appears at this stage to avoid repeated grinding; it is separate from the old Creative Supplies refill.
4. **Craft** a Stone Axe using the actual Workbench recipe.
5. **Build** an actual Campfire.
6. **Practice** one real sword attack and one held shield block. A training sword and shield are granted for this safe step; the tutorial does not spawn an aggressive wolf.

A compact step card explains the next task and provides a context-aware Help button. A golden beacon marks the nearest relevant tree, rock, or workbench. This happens *inside normal Wilderness gameplay*, not on a separate preview page. You cannot tap Next/Skip to bypass the objectives. Time, survival needs, wolves, and zombies are suspended during the lesson, then resume afterward.

Completed steps resume after a browser refresh on the **same device/browser**. The tutorial progress marker uses a **separate mode-specific localStorage key**; the original save schema, server-side Supabase SQL, and auth flow are unchanged. The player's world itself continues using the usual guest/device or account/cloud save system. Tutorial steps do not automatically synchronize between devices, but downloading an existing world will not trigger the tutorial.

**Existing worlds are protected:** If the account or guest already has an original world save, and no tutorial progress marker is present, the system marks the tutorial complete automatically without altering the world. Importing/restoring an existing world and downloading an existing cloud world also marks tutorial complete. There is no forced tutorial for existing players.

## iPhone GitHub upload

1. First, open your currently working Wilderness game and **Bag → Export world**. Save the JSON backup in iPhone Files. Do not clear website/Safari data.
2. Unzip `Wilderness-v0.24.2-First-Steps.zip` in iPhone Files.
3. Upload/replace **all files at the root of the ZIP** in your GitHub repository root, including updated `index.html`, `game.js`, `release.json`, and the **new `tutorial-system.js`**. Do **not** upload only `index.html`.
4. Upload the **contents** of the ZIP's `assets/` folder into your existing GitHub **`assets/`** folder. Do **not** move `survivor-animated.glb` to the repository root or make a nested extra `assets` folder.
5. Wait for GitHub Pages to publish; open Wilderness and check **v0.24.2**. Existing account and guest saves should open as before.
6. For a **new-player test**, use a separate Safari browser/profile or device with no Wilderness saves. Do not clear your own current browser storage. Choose **Play as Guest** and complete the steps. Confirm closing/reopening resumes the same step.

No Supabase migration is required. The author has not deployed this ZIP to GitHub/Supabase or tested the real iPhone 3D rendering; validate on a non-production device or spare test profile first.

## Regression acceptance checks

- Guest can enter without a Supabase account; guest account/world key never overwrites an existing account save.
- Existing world shows no tutorial and preserves buildings, inventory, health and cloud auto-save.
- New guest sees step 1; walking progresses; 1 tree and 1 rock harvested unlock the next step.
- Build Workbench using highlighted control, craft Stone Axe from its actual crafting menu, then place Campfire.
- Combat practice works through the main action and shield hold; no combat damage during tutorial.
- Refresh between steps; resume correct objective, items, and built pieces.
- Existing zombies still spawn after the tutorial when night falls; game world runs as before.
- No missing assets/JS (especially `assets/survivor-animated.glb` and `tutorial-system.js`); landscape UI remains usable.

## Known limitations

- Tutorial steps use a per-browser marker, not the cloud save schema; they do not sync across a second device.
- The lesson teaches combat with an unopposed attack and block, **not** a forced wolf battle, to keep new players safe and avoid collision/death-loop issues.
- Tutorial screens and behavior need real iPhone acceptance testing; the browser runtime cannot be fully exercised offline without the external Three.js CDN.
- Existing prototype graphics, crafting balance and wider interface remain otherwise unchanged; further general UI simplification should be a distinct design pass.
