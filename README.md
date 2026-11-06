# Wilderness v0.23.3 — Thumb-Friendly Combat (Landscape)

**Full GitHub Pages release** built on the working v0.23.2 ZIP. All existing gameplay, villages, enterable houses, loot, trades, deep cave, second-story construction, weather/sky, seed gathering, campfires, wardrobe, wildlife, and cloud-saving behavior are retained. No new back-end requirements.

## What changed

- **Right-thumb combat pad when Sword is equipped:** a **large Attack** button at the bottom-right, with **Hold (Block)** above **Dodge** to its left. The **Jump** button stays immediately to the left of the pad. No more reaching up to the old high combat toolbar.
- **Tap OR hold Attack:** a quick tap makes one swing. On a touch screen, holding Attack keeps swinging at the existing 0.48-second attack cooldown while stamina permits. Releasing stops automatic swings. Attack damage, stamina cost, wolf behavior, and protection zones are unchanged.
- **Press-and-hold shield:** Hold the new Block button while you need protection; release to stop guarding. This is not a permanent toggle. Dodge remains a quick tap. Existing equipment and stamina requirements still apply.
- **Two-thumb movement:** one finger continues steering the trusted left joystick while the other attacks, guards, dodges, or jumps. Separate pointer IDs are retained; interrupted touches still release via the v0.22 recovery system and **↻ Unstick**.
- **Clearer combat state:** when your sword is equipped, Gather / Bag / Save / Build become a narrow row just above the combat pad, and equipment switches move above that row. Equip an axe or pickaxe to restore the previous everyday controls.
- **Safer menus:** attack, dodge, and block no longer fire through an open Map panel. All interactive buttons have accessible labels. Portrait gameplay remains blocked as in v0.23.2.

## Installation from an iPhone — complete replacement

1. In your current working v0.23.2 game, open **Bag → Export world**, and save the JSON backup into the iPhone Files app. Do not clear Safari website data.
2. Download and extract **wilderness-prototype-v0.23.3.zip** in Files.
3. In your **existing Wilderness GitHub Pages repository**, replace the `.html` and `.js` files at its ROOT with the full versions inside the ZIP. Do not upload this ZIP or its enclosing folder as one file; its files belong at the repository root. **No partial code snippets or patches** are needed.
4. Keep the six existing `.glb` / `.webp` art files in the **`assets/`** folder. Full copies are also included in the ZIP.
5. Keep `README.md`, `ROADMAP.md`, and `CRAFTING_PROPOSALS.md` if you want the latest instructions. Commit changes to your published branch (usually `main`); confirm GitHub Pages deployment succeeded.
6. Open the usual Wilderness URL with your iPhone sideways. Verify the header reads **Single-player · v0.23.3**. Equip your sword with **⚔ Sword** in the equipment strip (if you don't have a sword, use the Bag's existing Combat Kit or craft one).
7. Check that a large **Attack** button appears at the bottom right, **Hold** and **Dodge** alongside it, and **Jump** immediately to their left. Walk and hold Attack using separate thumbs. Switch back to an axe to see the normal Gather / Bag controls.

## Save / cloud safety

- **No new Supabase SQL**. Do not run any previous migration or emergency rollback. This build uses **the exact existing `wilderness_v0231_singleplayer` local save key**, the existing v0.23.1/0.23.2 JSON schema and existing cloud-sync baseline. No account or database settings changed.
- If you use Cloud Save, it should work as it did in the approved v0.23.2 build: normally automatic when signed in, with conflict prompts only for meaningful competing offline changes.
- Your old game ZIP remains a rollback option. Export the current world before rolling back. Do not delete Safari browser data.
- **No backend or GitHub accounts have been modified by this package**; you deploy the files yourself.

## Acceptance checks on iPhone

1. Header says v0.23.3, and landscape-only mode still blocks portrait gameplay.
2. Equipping Sword shows the right-thumb combat pad; switching to Axe hides it and restores the normal controls.
3. Walk with your left thumb, tap Attack with the right. Then walk while holding Attack: repeated swings obey the stamina cost / existing cooldown. Releasing Attack stops repeated swings.
4. Walk while holding Block. Release it: blocking ends. Test Dodge and Jump independently while walking. All combat buttons are within comfortable reach.
5. Open Map or Bag during/after combat: accidental attacks do not trigger; closing the panel resumes correct controls.
6. Rotate or switch away while holding a button: the controls release. The **↻ Unstick** button still resets both joystick and camera.
7. Four villages, doors, loot chests, existing structures, inventory, cave exploration and campfires behave as before.
8. Save, refresh and sign back into your usual account. Your world and automatic cloud saving work as before.

## Technical check scope

- JavaScript parser checks, full module-reference audit, binary art-asset inventory, identical save schema and cloud baseline, mocked independent-pointer actions, and browser layout checks at 568×320, 667×375, 844×390, 932×430 and 1024×768 are performed for this release.
- **Not claimed:** a successful live WebGL game playthrough in iPhone Safari, actual on-device thumb ergonomics, or a live Supabase write test. Please perform the acceptance checks before approving further features.

## Rollback

Deploy your **complete v0.23.2 ZIP** to the same GitHub Pages branch if the updated controls fail. **No Supabase rollback** is needed. Your existing browser save format is unchanged; keep your separately exported JSON backup.
