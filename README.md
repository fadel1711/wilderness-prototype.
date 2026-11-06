# Wilderness v0.23.8.1 — Calm Controls & Cloud Recovery

**Repair release after v0.23.8.** This is the complete GitHub Pages web game, not a patch. The upcoming v0.23.9 immersive building-camera update and v0.24 Night Zombies are **not** included.

## iPhone installation (no SQL)

1. **Before replacing anything:** open the currently installed game (if it opens) → **Bag → Export world**. Save the `.json` file in iPhone Files. Do not delete the Home Screen app or clear Safari website data.
2. Download/extract this ZIP in Files. You will find `index.html`, `game.js`, all other `.js` files, `manifest.webmanifest`, `release.json`, `wilderness-icon.png`, and the `assets/` folder.
3. Open the GitHub repository that currently hosts Wilderness. **Upload/replace ALL files from the ZIP**, keeping files at the root and keeping `assets/` as a subfolder. Don't put the entire game inside a newly named subfolder. Commit.
4. Let GitHub Pages publish. In Safari, navigate to your normal GitHub Pages `index.html` URL and append `?app=0.23.8.1` (or `&app=0.23.8.1` if there is already a query). The header should say **v0.23.8.1**. This URL bypasses a stale page cache. Then reopen the existing Home Screen app. Do not clear its website data.
5. Sign in to the **same existing Wilderness account**. The cloud should load and the game should unlock automatically. Look for `☁ Cloud live` in the top-right. If the cloud is unreachable, the game pauses and offers **Reconnect**, rather than creating an offline-only world.
6. Test sword attacks, axe chopping near a village door, pickaxe mining, torch, food Eat/Drink, village door/chest, Jump/Dodge/Block with movement, and returning to the installed app. Export another backup after confirming successful cloud sync.

**No Supabase migration is needed.** The existing production database was inspected read-only: `wilderness_worlds` has owner-specific RLS and `wilderness_save_world` accepts JSON save format **22** used by this game. We did not edit the live database or repository.

## What changed

- One large **right-thumb primary button**. It attacks with the sword; chops with an axe near a tree; mines with a pickaxe near a rock/ore vein; opens doors/chests and trades when applicable; ignites/refuels/extinguishes a held torch; or eats/drinks selected hotbar food. A sword **never** turns into a chest/door interaction while you are fighting. Interaction takes priority over lighting when standing right next to a usable object with the torch equipped.
- Six smaller customizable slots along the bottom. Tap a food slot to **select**, then tap Eat/Drink; it is no longer consumed as a surprise. Tap `✎` to choose assignments. The arrangement is a **local input preference**, not world progress.
- Duplicate oversized combat controls, huge statistics and mission overlays, unnecessary toolbar buttons, and redundant main-screen Save are hidden. Jump remains visible; **small** Block and Dodge appear with a sword. The normal Bag still offers JSON export/import.
- Corrected sword attachment direction and restored sword visibility on loading with it equipped. Axe/pick grip orientation corrected. Torch mesh **and its actual light position** now follow the hand/flame instead of projecting from the torso. Visual-effect failure is contained and won't halt normal movement.
- Removed the **device/cloud choice** from normal saving. The signed-in account's cloud world is authoritative; the game automatically reconciles safe unsynced changes only against an unchanged cloud revision. When another device has changed the cloud world, the cloud wins and a recoverable device snapshot is kept. If the cloud copy is invalid, the connection fails, or a local save cannot be validated, gameplay pauses instead of overwriting cloud data.
- The existing `.json` world format (version 22), cloud RPC, owned-world RLS, installed-app update check, profile gate, building editor, villages, chests, farming, combat and torches are retained.

## Cloud-only mode: how it protects you

- **Online required:** You must sign in and successfully check the cloud world before starting. Loss of connection pauses gameplay. When the service comes back, use **Reconnect**; the account is re-verified.
- **Automatic:** No modal will ask you to choose between “device” and “cloud.” The cloud is the authority. “☁ Save queued” is **not** a promise that data has reached the server; wait for `☁ Cloud live` and a successful revision/sync confirmation before closing after important actions.
- **Emergency local recovery exists intentionally:** The device retains a non-authoritative local snapshot and prior-world recovery copies so a network conflict, corruption, account switch, or import cannot silently destroy work. Back up occasionally with Bag → Export world.
- **Account switching:** An existing cloud world replaces this device's different-account cache after the device cache is backed up. A genuinely new account gets a fresh world; it does not inherit someone else's buildings.
- **Imports:** An explicit JSON world import is uploaded only against the known cloud revision. If that revision changed, the current cloud is protected and the imported local copy remains recoverable rather than being blindly pushed.

## Test coverage and limitations

- 45 focused pure tests for action priority, save-schema compatibility, cloud policies, movement normalization and account gating.
- 32 mock-runtime checks for 7 cloud scenarios, including offline, corrupt remote data and competing saves.
- 5 render-system torch-flame anchor assertions.
- JavaScript syntax, startup import paths, iPhone-shaped static HUD layout checks (844×390, 760×360, 667×375, 568×320 and portrait-lock rotated), and ZIP integrity checks.
- **Still requires live iPhone acceptance**: actual Safari multitouch gestures, 3D animations, timing under load, and live cloud saves between two devices cannot be reproduced by these checks. The static HUD screenshots are layout tests, not real 3D game captures.

## If something goes wrong

- **Cloud says Reconnect:** reconnect Wi-Fi/mobile data and use **Retry connection** in the cloud panel. The game purposely pauses without a verified cloud world.
- **Stuck on old version:** after deployment, load `index.html?app=0.23.8.1` in Safari. Don't delete the Home Screen app, wipe site storage, or sign out while you have unsynced progress.
- **Invalid cloud world:** stop. Do **not** run manual SQL or reset your account. Keep the JSON world export and a screenshot of the error; the backend save should not be overwritten.
- **Rollback:** if needed, redeploy the prior complete v0.23.8 ZIP while preserving browser data and your JSON backup. Because the save format is unchanged, this does not require a database rollback; cloud conflict warnings might return in older versions, so back up first.

See `AUDIT.md` for the fault-by-fault technical review and what remains unverified.
