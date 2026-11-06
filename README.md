# Wilderness v0.24.1 — Play as Guest + Nightfall Balanced

## What's new
- **Play as Guest** on the first screen. No email, password, account or Supabase connection needed for guest gameplay.
- Guest world autosaves to this device/browser only (`wilderness_v024_guest_singleplayer`), fully separate from signed-in account worlds (`wilderness_v0235_singleplayer`).
- Signed-in players still use automatic cloud saves; guest mode never calls Supabase save operations. Switching from guest to account in Bag → World backup keeps both worlds separate.
- Guest mode remains selected on next visit until switched to account; guest progress does **not** automatically transfer into an account.
- **Existing v0.24.0 Nightfall**: balanced zombies (max 6), survivor animations and original game features kept.

## IMPORTANT: preserve existing account worlds
1. In your current running account world, export its JSON backup from Bag → World backup before deploying.
2. Extract this ZIP on iPhone. Upload all root files to **the repository root** including **NEW `session-mode.js`**, `index.html`, `game.js`, `profile-gate.js`, `version-check.js`, `release.json` and the other `.js` files.
3. Upload the contents of ZIP's `assets/` into the repository's existing **`assets/` folder** (especially `survivor-animated.glb`). Do not move assets to root or create an extra `wilderness.../` folder.
4. After GitHub Pages publishes, open your existing Wilderness URL and check version `v0.24.1`.
5. On a browser that is **not already signed in**, the entry screen has **Play as Guest**. Tap it; the page reloads once and loads a new guest world. Enter the forest. The game autosaves approximately every 12 seconds while playing, and when leaving the page.
6. To return to an account, open Bag → World backup → **Sign in / Create account**; that saves guest progress, then reloads the account sign-in page. Existing account world stays separate.

## How guests can keep progress
- Same Safari/PWA website storage on the **same iPhone**: guest world resumes automatically.
- Different device, another browser, cleared website data, iOS storage eviction or private browsing: guest world is **not guaranteed** to survive.
- Guests should export a **world JSON backup** from Bag regularly and before app updates. Import replaces the *current* world only after confirmation. Before importing a guest backup into an account, export the existing account world first to avoid unintentionally replacing it.
- Guest mode doesn't remove the game's initial need to load JavaScript/Three.js over the internet; **no login** does not necessarily mean offline play.

## Tests to run on iPhone
- Guest button shows when account cannot connect; guest can start without Supabase setup.
- Build a floor / collect wood as guest; close game, reopen: guest resumes; equipment and buildings remain.
- Switch to account, sign in: original account world loads, guest changes do not automatically appear there.
- Switch back via the guest button on the account gate: original guest world resumes.
- Test existing controls, v0.24.0 zombies and 3D survivor, JSON export/import, and animated model path `assets/survivor-animated.glb`.

## What we checked / limitations
- Static syntax validation, bundled file references, and save-mode isolation tests; no deployment or physical iPhone runtime test performed. Keep the previous working ZIP until acceptance.
- **No Supabase migration required.** No GitHub or Supabase changes were made directly.
