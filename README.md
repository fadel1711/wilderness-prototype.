# Wilderness v0.23.6 — Account Profiles + Landscape Without Rotation Setting

This is the full GitHub Pages game replacement, including existing save code, 3D models and assets. **No Supabase SQL migration is required** if your v0.23.5 cloud backend and email auth already work.

## New players must make a profile
- On startup, the player must **sign up or sign in** before Enter the Forest is enabled. Sign-up requires **survivor name**, email and password (8+ characters). The name is stored in Supabase Auth user metadata for display only; it is not used for permissions.
- Supabase email confirmation may require checking email before the first successful sign-in. Existing returning accounts without a survivor name choose one once. Existing signed-in accounts reuse their session automatically.
- The account world is checked **before gameplay is unlocked**. If two devices truly have conflicting unsynced worlds, resolve this in Account & Cloud Save. Ordinary logins restore/sync automatically as in v0.23.5.
- Authenticated devices can play offline if this device was previously synced to the same account and the local save is valid; new players need internet. A missing or inaccessible auth service prevents first-time gameplay by design. This is an intentional account requirement, not a local guest mode.

## Landscape behaviour
- On platforms supporting the manifest orientation, installed Wilderness **requests landscape** on launch. On iPhone Safari, `screen.orientation.lock()` is not supported. Instead, **the game scene and its touch controls are rotated 90 degrees in a portrait-locked viewport**. Physically turn your phone sideways to view it normally, without visiting the Control Center orientation toggle.
- Player sign-in panels are upright when the phone is held vertically. Native landscape also remains supported. Do not assume this changes the iPhone OS orientation; it only rotates the game's content.
- The original v0.23.5 joystick / multi-pointer recovery is retained; touchscreen positions and WebGL aspect are converted to the rotated viewport. Safari-specific iPhone acceptance testing is essential.

## Installation on iPhone
1. On v0.23.5, open **Bag → Export world** and keep the JSON backup. **Keep v0.23.5 ZIP for rollback.**
2. Unzip the v0.23.6 full package. Replace ALL root HTML and JS files in your Wilderness GitHub Pages repository. Add **profile-gate.js**, **manifest.webmanifest**, and **wilderness-icon.png** alongside `index.html`.
3. Keep/upload the six unchanged model and texture files in `assets/`.
4. Commit changes. After deployment, open the game and confirm **v0.23.6**.
5. Existing user: with internet, sign in with the existing Wilderness account, choose a survivor name if asked, verify original cabins and items, and test auto sync. New player: enter name, email/password, confirm email if required, then sign in and play.
6. Test Safari with orientation lock ON: hold the phone sideways; the game should appear right-side-up via the rotated web canvas, and movement / jumping should work. Also test orientation lock OFF and PWA via **Share → Add to Home Screen → Open as Web App**.
7. Test account sign-out while in game (must pause and require a profile again). Test an offline launch only after previously signed in and synced; test a second device with the same account.

## Save and security notes
- Browser save key and JSON world version are **unchanged** from v0.23.5. Existing buildings, torches, villages, chests, clothing and cave discoveries are preserved.
- **No Supabase SQL migration** in this update. It uses the existing Supabase email/password authentication and world-save RLS. Never put service-role or secret keys in GitHub; only the publishable key.
- Cloud conflicts and older-world recovery protections are unchanged. No changes were made to your live GitHub or database.
- This is an iPhone acceptance candidate: local syntax, file and interface checks can pass even if Safari has an OS-specific touch or WebGL issue.
