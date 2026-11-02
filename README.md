# Wilderness — Single-player Survival Prototype v0.1

Working title only. This is a **playable 3D mechanics test**, not the finished survival game. The graphics deliberately use simple geometric models.

## What's included
- Third-person 3D movement and follow camera
- Touchscreen joystick and right-side swipe camera controls (iPhone)
- Keyboard and mouse controls (computer)
- Forest clearing, trees, rocks and nearby mountains
- Chop trees and mine rocks to collect wood and stone
- Cabin blueprint placement (12 wood + 5 stone)
- Free-build floor pieces (2 wood) and wall pieces (3 wood)
- Rotate, preview, placement checking and material consumption
- Local browser save and automatic saves. No login, servers, purchases, Supabase or ads.

## iPhone deployment via GitHub (a separate repository)
1. Sign in to GitHub in Safari. Create a **new public repository**, for example `wilderness-prototype`. Do not use your Dino Dominion repository.
2. From your iPhone's Files app, unzip `wilderness-prototype-v0.1.zip`.
3. In your new GitHub repository, use **Add file → Upload files** and upload **`index.html` and `game.js` into the repository root** (not nested inside a folder). You may also upload `README.md`.
4. Commit the changes.
5. Under repository **Settings → Pages**, choose **Deploy from a branch**, then **main** and **/(root)**. Save.
6. Open the Pages link GitHub shows (usually `https://YOUR_USERNAME.github.io/wilderness-prototype/`) in Safari. The exact link depends on your repository name and account.
7. If the GitHub mobile interface hides Settings or upload options, use Safari's **Request Desktop Website**.

**Note:** GitHub Pages for a GitHub Free account requires a public repository, and published content is accessible on the public internet. This prototype contains no secrets or private credentials. Do not upload other projects' configuration files or keys.

## Controls
**iPhone:** Left joystick to move; swipe across right area to look; approach a tree or rock and tap Chop/Mine. Tap Build, select Cabin/Floor/Wall, walk to position its transparent preview, Rotate or Place. Tap Close Build when done. Tap Save to save manually.

**Computer:** WASD / arrow keys to walk; drag mouse across the world to rotate camera; Shift = faster movement; E = gather; B = toggle build; F = place; R = rotate building.

## Save data / limitations
- World state is saved in the **same browser on the same device** using localStorage. Saves do not sync between devices; clearing website data deletes them.
- The 3D engine loads **Three.js 0.160.1** via a public jsDelivr CDN. You must be online to load it for the first time; if the CDN is unavailable the game will not start.
- No player-environment collision with walls or trees, no combat, no interiors/furniture interaction, no farming, no enemies, no procedural terrain, no swimming, no crafting menu, and no polished 3D character yet. Those are possible later milestones.
- Buildings are visible structures and cabin doors are open, but this is not yet a final modular building/physics engine.
- Mobile Safari performance has not been independently verified on your specific iPhone. Test it first and send any issues/screenshots.

## Acceptance test
1. Character walks and camera turns on iPhone.
2. Approach a tree, Chop until it disappears, check wood counter increases.
3. Approach a rock, Mine until it disappears, check stone counter increases.
4. Gather 12 wood and 5 stone. Open Build and place a Cabin in a clear space.
5. Gather more wood and place one Floor and one Wall.
6. Tap Save, refresh the page, and verify structures and inventory remain.

No Supabase changes are needed for this single-player browser prototype.
