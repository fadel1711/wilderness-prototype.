# Wilderness v0.14 — Movement & Wild Seeds (Stage 2)

A **complete GitHub Pages replacement** with every game file. Built on the tested v0.13 source. The update adds renewable seed foraging and a lightweight jumping/gravity controller while retaining the existing custom collision system.

## New features

- **Wild seeds:** Three clearly marked, tool-free seed patches near home. Home Meadow (-11, 6) gives carrot seeds, Creekside Patch (-11, -12) gives potato eyes, and Grassy Grove (13, 9) gives wheat seeds. Press **Map** and select a **Wild seeds** destination to get a waypoint arrow. Stand close and tap **Seeds** to gather. Every patch regrows after roughly 35 seconds. Once planted, crops still yield seeds when harvested. Creative supply refill remains available.
- **Movement:** Jump button above the left joystick, Space on keyboard; gravity, controlled landing, basic air control, step-up/down handling. Jump costs 9 stamina. Existing sideways wall/cave collision checks, raised foundations, cabins and stairs are retained. This is a lightweight *kinematic character controller*, **not** a comprehensive rigid-body physics engine.
- **World protection:** New independent v0.14 Safari save `wilderness_v014_singleplayer`; old v0.13 save remains untouched. Existing cabins, resources, chests, crops, discoveries, time, and needs migrate. Seeds have their own validated cooldown record; imports/export preserve it. Current-player jump height isn't saved; the next load starts safely on the nearest ground.

## iPhone manual deployment

**First, export a world JSON backup from the existing v0.13 game (Bag → Export world).** Keep the v0.13 complete ZIP in Files for rollback.

1. Download and extract `wilderness-prototype-v0.14.zip` on the iPhone.
2. Open **the same Wilderness GitHub repository** and browse to the GitHub Pages site root (the folder currently containing `index.html`).
3. Replace these **13 existing files** with their complete files from this package: `index.html`, `README.md`, `game.js`, `construction.js`, `save-system.js`, `craft-system.js`, `combat-system.js`, `exploration-system.js`, `farm-system.js`, `atmosphere-system.js`, `visual-system.js`, `cave-art.js`, `survival-system.js`.
4. Add **two new files** to the same folder: `seed-system.js`, `movement-system.js`.
5. Commit to the existing deployment branch (normally `main`). Confirm success in **Actions**.
6. Reload the normal GitHub Pages address. It should show **Single-player · v0.14**. You do not need a new repo or backend.

Do **not** clear Safari website data, use private browsing as your main save, or replace only `index.html`. The built-in diagnostic page can help identify missing files.

## iPhone acceptance checklist

1. Loads the old settlement and earlier needs/farming/inventory without losing anything.
2. Wild patch markers are visible on Map; waypoints lead to them.
3. Carrot, potato, and wheat seeds are collectible without tools; regrow works.
4. Plant seeds, grow and harvest; crops return ingredients and seeds.
5. Jump works on-screen and landing behaves normally.
6. Walk up and down raised foundation stairs and enter cabins without getting stuck.
7. Walls and cave remain solid; combat, camera, crafting, water and sleeping work.
8. Save, refresh, export/import and rollback safeguards work.
9. Check frame rate in Standard and Low Effects on your actual iPhone.

## Rollback

If v0.14 fails to load, do **not clear Safari storage**. Replace the game files with the complete v0.13 package and commit; the separate v0.13 save will be read by v0.13. Progress made only in v0.14 will not show in v0.13. Before any experiments, export a v0.14 JSON backup as well. The in-game **Undo last import** control only undoes the latest imported world, not a GitHub deployment.

## Verification limits

Syntax, save migration, seed transactions, collision/vertical physics pure checks and archive integrity can be tested outside Safari. Real-world WebGL input and iPhone motion/landing still need player acceptance before calling this version stable.
