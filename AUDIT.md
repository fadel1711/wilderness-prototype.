# v0.24.0 — Change audit

- Added `zombie-system.js` for 6 pooled low-poly zombies with pure balanced encounter constants.
- Zombies are integrated in `game.js` tick and sword target selection; no second webpage or engine.
- Night-time predicate uses the same hour bounds as `atmosphere-system.js`.
- Existing combat damage / shield / dodge, inventory, save, sound and safe-zone functions reused.
- Zombies are not serialized; old cloud saves require no migration or new item IDs.
- Assets folder restored to the user-confirmed working layout, and all code references updated.
- GitHub boot diagnostic required list now includes `zombie-system.js`.
- Added a one-click in-game 'Preview Nightfall' in Bag settings for testing, modifying only existing atmospheric elapsed time.
- Do not treat static QA as device rendering acceptance.
