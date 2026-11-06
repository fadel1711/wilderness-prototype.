# Wilderness v0.24.0 — Nightfall (Balanced Zombies)

**One complete Wilderness game update**, not a separate zombie demo. Zombies are included as lightweight in-game 3D enemies, so you don't need to find or download a zombie GLB.

## Balanced settings
- Up to **6 zombies nearby** after sunset (20:00–05:00 game time); gradual spawning rather than instant mob swarms.
- Slow roaming, moderate-speed chase, moderate attacks (**10 HP before shield / dodge reduction**).
- Existing sword attacks damage zombies; blocking and dodging use the original combat system.
- Defeated zombies automatically give wood, stone or charcoal; uncommon drops include iron ore and rare iron bars. Loot is added directly to the bag, only if it can be saved.
- Existing homestead areas, cabins, and village centers are protected. Zombies disappear at sunrise. No building destruction, permanent death, or lost inventory.
- Zombie encounters are **session-only**; your existing world save data and Supabase schema are untouched. This is intentional to avoid corrupting old saves.

## iPhone upload steps (IMPORTANT asset folder)
1. From the **current working game**, export a world JSON backup from Bag and retain it in Files. Do not clear website data or reinstall the app.
2. Extract this ZIP in the iPhone Files app. The package has root files and an **`assets` folder**.
3. On GitHub, replace all files in the repository **root** with the updated root files (including `index.html`, `game.js`, `zombie-system.js`, `version-check.js`, `release.json`, and existing JS modules). Do **not** upload the enclosing ZIP folder as a new repository folder.
4. Open your repository's **`assets` folder** and upload the **files inside the extracted `assets` folder**, especially `survivor-animated.glb`; confirm the URLs match exactly: `.../wilderness-prototype/assets/survivor-animated.glb`. Do not rely on a root-level `survivor-animated.glb` in place of the assets copy.
5. After GitHub Pages publishes, open the game and check **v0.24.0**. Confirm Cloud live/account world is correct before doing important gameplay. Use Bag → Settings → **🌙 Preview Nightfall** to advance the clock to 20:15 and test zombies outside the homestead.
6. Equip a sword (Bag → free combat kit, if needed). Walk beyond the protected homestead; see zombies appear gradually. Attack, block, dodge and confirm loot enters Bag.

## Before accepting the release
- Verify the player still walks, jumps and handles simultaneous touch inputs; no frozen joystick.
- Try normal day, nighttime near homestead, nighttime outside home, and morning transition.
- Confirm old saved buildings, chests, crops, villages, cloud loading and export still work.
- Check game stays responsive on your iPhone in low-effects mode with 6 enemies.

## Limits and safety
- The zombies use optimized **procedural, low-poly** meshes. They do not have imported cinematic animations or advanced pathfinding; for now they will sidestep some obstacles rather than navigate complex mazes.
- This ZIP was statically validated and game logic unit-tested, **not visually tested on a real iPhone**. Do not delete your previous working release until this is confirmed.
- **No Supabase migration is required**, and no repository, live database, or player data was modified by the assistant.
