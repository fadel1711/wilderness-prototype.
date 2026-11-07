# Wilderness v0.24.3 — QA report

Source: the preserved `Wilderness-v0.24.2-First-Steps.zip` from the user's library.

## Passed checks

- All root JavaScript files passed `node --check` after release version cache updates.
- All 158 original static HTML `id` values preserved; all 32 original `data-type` build controls retained.
- All seven bundled binary assets, including `assets/survivor-animated.glb`, compared byte-for-byte identical to v0.24.2.
- Existing game, cloud save, guest session, saved-world format, profile gate and tutorial JS code retained without logic changes (only the `0.24.2` asset/version strings changed).
- Browser DOM test with Chromium at 844×390 pixels: Backpack tabs switch and hide inactive panes; Supplies contains the unchanged refill control; Settings contains account/export and camera zoom controls; Outfit contains clothing.
- Browser DOM test: Starter, Upstairs and More build tabs switch correctly, with existing Workbench/Campfire and saved-blueprint controls preserved.
- Browser DOM test: tutorial CSS exposes only the mandatory workbench button during workbench training.
- All relative module and asset paths referenced from `index.html` exist in the package. Manifest and release both show version `0.24.3`.

## Not yet verified

- Full live 3D WebGL game and camera rendering on iPhone (the browser test exercised HTML/CSS and interface tabs; Three.js game imports were not executed in that isolated test).
- Cloud write/read round-trip against the user's live Supabase instance.
- Real touch gesture stability during long gameplay sessions, active combat and construction.

No GitHub deployment or Supabase changes were made. Validate on an iPhone with a backed-up world before distribution.
