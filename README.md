# Wilderness v0.23.8 — Smart Combat Ring & Six-Slot Loadout

## iPhone install
1. Open the working v0.23.7 game and export your world from Bag. Keep that JSON in Files.
2. Extract this **complete** ZIP, then replace the existing GitHub Pages files with its contents, preserving the `assets/` directory structure.
3. Commit and wait for GitHub Pages to deploy. Open the game and verify **v0.23.8** in the header. If the installed app is cached, open the published `index.html?app=0.23.8` in Safari once. Do not clear website data.
4. Test six quick slots, the sword combat ring, and the contextual action with a torch, tree, rock, and village door.

## Controls
- Six bottom-center quick slots: tap to equip a tool or consume food. Missing items are dimmed.
- Tap ✎ then a slot to choose from the equipment/food palette. Custom hotbar arrangement is saved **on this device** as a preference, not to the account; your world and inventory still use the existing account cloud save.
- Sword: large central Attack (tap or hold), Block above, Dodge to the left, Jump to the right. Dedicated Attack does **not** open chests or trade.
- Other tools: smart action offers Chop/Mine/Use; torch offers Ignite/Extinguish. Existing village interactions still work.
- Landscape-only, joystick recovery, building editor, torch system, and account profile gate are retained.

## Cloud and rollback
- **No Supabase SQL required.** This is a controls-only release. Existing v0.23.7 save format and account-based cloud logic are unchanged.
- To roll back, redeploy the v0.23.7 game package and use your exported world backup if necessary. Never clear Safari site data.

## Testing limitations
- Automated JavaScript syntax, file references, and package integrity can be checked offline. Real iPhone multitouch and Safari WebGL performance must be verified on device.
