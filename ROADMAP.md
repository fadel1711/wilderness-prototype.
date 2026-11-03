# Wilderness — Expansion Roadmap (updated for v0.20)

**v0.20 — Echo Depths Maze & Mining:** built as an iPhone acceptance candidate. Connected 28-cell maze, physical walls, mineable renewable ore veins, old cave cache preserved, new reliquary, cloud-compatible version-19 save and a separate private SQL migration.

**v0.21 — Construction 2.0:** true second-floor support with reachable stairs, elevated floor collisions, supporting walls, upper-story rooms and safe old-foundation migration. Test on a cabin first; do not mix with world enlargement.

**v0.22 — World Expansion:** make both map dimensions twice as large (four times the area) while preserving existing coordinates. Use terrain/foliage distance streaming and performance budgets, and extend save coordinate validation deliberately. Avoid spawning buildings over existing resources.

**v0.23 — Villages & Villagers:** one properly designed village (houses, pathways, gathering areas), villagers that live only within its discovered village boundary, then broaden if FPS remains stable. Preserve existing locations and map discovery IDs.

**v0.24 — Night Zombies:** only at nighttime, outside protected settlement areas. Keep relaxed survival and pause/offline safety. Start with simple state-machine behaviors, combat hit feedback, predictable despawn at dawn.

**v0.25 — Dog Companion:** bone/meat acquisition, taming, summon/follow/stay commands, simple pathfinding and saved companion data. No paywalls, ads or microtransactions.

**All upgrades:** First export JSON, then apply any validated private backend migration *before* deploying a new client format, then replace complete public GitHub package. Actual acceptance must happen on iPhone before advancing. Automatic account-first saving stays the default; only real cross-device conflicts may require a choice. Live backend or GitHub must not be modified without explicit action authorization.
