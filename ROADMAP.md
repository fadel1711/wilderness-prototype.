# Wilderness — Upcoming small releases

## Current package

**v0.23.3 — Thumb-Friendly Combat:** right-thumb attack/hold-block/dodge, tap-or-hold attacks, lower-reach Jump, preserved multitouch and landscape controls. No save or backend migration.

## Proposed subsequent releases (not yet built)

- **v0.23.4 — Long-Press Building Editor:** select player-made constructions via long press, safely edit/rotate/move where structurally valid; protect chest inventory and supports.
- **v0.23.5 — Torches:** placeable and hand-held light sources, fuel and lightweight smoke/light effects.
- **v0.24 — Night Zombies:** limited nighttime enemies, safe homestead and villages, balanced difficulty.
- **v0.25 — Mountains & Rivers:** height-aware terrain, paths, bridges, preserved existing settlement coordinates.
- **v0.26 — Climbing:** terrain ledges, stamina, safe landing.
- **v0.27 — Wildlife:** chickens, cows, pigs, deer with a bounded world population and proximity-based simulation.
- **v0.28 — Underground Mine:** distinct navigable mine, branching paths and mineable resources.
- **v0.29 — Dog Companion:** bones and meat for taming, follow and simple assistance.

Crafting ideas are still **proposals**, not included in v0.23.3. See `CRAFTING_PROPOSALS.md`.

All future updates should preserve existing builds, player data, landscape input safety and the accepted automatic cloud-save flow; only create SQL migrations if new persistent data genuinely requires one.
