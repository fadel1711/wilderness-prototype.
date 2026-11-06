# Wilderness v0.23.7 — Torch Freeze & Installed-App Updates

**Complete game replacement:** all root files + all six files under `assets/`. This is a correction of v0.23.6, not a gameplay expansion. No Supabase SQL. No change to Wilderness cloud-save data formats or the `wilderness_v0235_singleplayer` browser save key.

## Exact cause of the torch freeze
The `tick()` function checked `amount('torch')` before executing `const amount = ...` (the movement magnitude declaration) in the **same block**. JavaScript treats the `const` as blocking the outer inventory `amount()` function for the entire block, so equipping a torch caused a `ReferenceError` on every frame and stopped normal gameplay. The movement variable is now called `moveMagnitude`. The torch's visual-effects updater is also isolated so a GPU effect failure cannot freeze the main simulation. Inventory, torch fuel, and cloud saves remain intact.

## Installed iPhone app update fix
v0.23.7 includes `release.json` and `version-check.js`. When Wilderness launches or returns from the background, it fetches the latest release version from GitHub Pages without using a cached response and validates that the corresponding HTML is already deployed. If newer, it switches to the updated version URL without erasing local saves. If you are currently playing, it shows an Update now button instead of interrupting gameplay. If you reopen the app from the background, it can refresh automatically.

**Important limitation:** The currently installed *older* v0.23.6 app has no version checker, so it cannot run this new updater until it loads v0.23.7 at least once. After deploying, **first** open your normal GitHub Pages game address in Safari with `?app=0.23.7` added to `index.html` (for example, `https://owner.github.io/repo/index.html?app=0.23.7`), and confirm the on-screen header displays v0.23.7. Then return to your Home Screen app and reopen it. If the installed app still shows the old version, first verify Cloud Save has synced and export your world backup before considering a new Home Screen icon. DO NOT clear Safari data or remove the existing icon while progress exists only on that device. The page's old service-worker cache, if any, is not removed.

Going forward, publish a **new** `release.json` with the new version in each release, alongside the complete game files. If this file isn't updated, the automatic checker cannot discover later releases.

## Install (iPhone / GitHub Pages)
1. From the CURRENT installed app, open **Bag → Export world** and save the JSON file in iPhone Files. Wait for the existing cloud-sync indicator to confirm a successful sync if you use an account.
2. Download and unzip the complete v0.23.7 ZIP. Keep the old v0.23.6 ZIP as a rollback backup.
3. On GitHub, replace all existing root files, **including** `index.html`, `game.js`, `torch-system.js`, `profile-gate.js`, `cloud-save.js`, and `manifest.webmanifest`. Add `version-check.js` and `release.json` in the same folder as `index.html`. Keep the same six files inside `assets/`. Avoid nesting a new project folder under the existing repository.
4. Upload the complete replacement **in a single GitHub commit** if possible, including `release.json`. Wait for the GitHub Pages deployment to finish. The checker verifies the updated HTML before reloading, so a partially completed deployment cannot trigger an update.
5. In Safari open `https://YOUR-GITHUB-PAGES-GAME-URL/index.html?app=0.23.7`, replacing the placeholder with your actual game URL and retaining any repository path. Confirm the HUD or start screen says **v0.23.7**.
6. Reopen the existing Home Screen app; do not delete it. Test torch equipped, lit, extinguished, and stowed. Move / jump at the same time, visit villages, then close and reopen to confirm the account/world persists.
7. The next release's `release.json` must be bumped. The built-in version checker can then offer / perform future updates without reinstalls.

## Recovery
- If Safari shows v0.23.7 but the Home Screen app still shows v0.23.6, the app may be using a cached old start page. It **cannot update itself** until the new page loads once. Keep local saves intact. Export JSON and confirm the cloud copy before attempting reinstall / replacement of the Home Screen icon.
- If any version fails to start, do not clear local data. Retry the Safari URL with the `?app=0.23.7` suffix, verify `release.json` is live, and check all GitHub Pages deployment logs.
- No SQL migration or rollback is required. Supabase projects were not modified.

## Checks performed
- JavaScript syntax and entire ZIP integrity.
- Static regression checks for torch shadowing, effects recovery, HTML/cache versions, manifest start URL and unchanged save key.
- Local browser test can verify the HTML layout but not Three.js rendering in this environment unless the CDN becomes accessible. iPhone Safari torch/light performance remains the acceptance test.
