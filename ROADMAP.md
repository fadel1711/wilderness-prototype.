# Wilderness expansion roadmap — v0.16 to v0.25

**Principle:** One risk category per release. Preserve all previous local save keys, ship complete GitHub ZIPs and dedicated acceptance tests. Do not call a version stable before iPhone tests pass. No further steps require changing Dino Dominion.

## v0.16 — Camera and sky (implemented candidate)
- + / - camera distance, desktop wheel, adjustable 3.5-18m, saved as device preference.
- Visible 3D sun and moon tied to existing clock and day/night.
- Acceptance: old world intact; zoom buttons compatible with joystick; sleep changes sky; acceptable phone FPS.

## v0.17 — Cloud save and accounts (standalone backend milestone)
- Keep local-first save as the source for offline play, then implement explicit cloud upload/download with a secure sign-in option.
- Use a **new, separate Wilderness backend project**, not Dino Dominion. Use per-user ownership/RLS, no service-role key in public files, and HTTPS requests only.
- Protect local save with manual JSON export before cloud migration. Detect divergent local/cloud revisions and ask the player to choose; never silently overwrite one.
- Provide a separate backend SQL/migration ZIP and verification instructions only when this stage is ready. User must connect/approve creating a backend, auth policies and project configuration. No credentials in GitHub ZIP.
- Acceptance: new account, sign-in/out, offline play, download on second browser, conflicts, sign-out privacy, restore, and rollback all pass.

## v0.18 — Campfires and smoke (implemented candidate)
- Build campfires (4 wood, 5 stone), add 1 wood for 180 seconds of burning, extinguish/relight via Use interaction. No offline fuel depletion.
- Warm flickering light (2 non-shadow point lights maximum), embers, lightweight rising smoke with animated wind drift. This is a **particle approximation**, not volumetric fluid dynamics; Low Effects reduces particle count and light intensity.
- Campfire state stored in save schema 17, with a new Safari key and small private Supabase RPC compatibility migration. Live backend is NOT changed automatically.
- Acceptance: place/refuel/toggle/dismantle, smoke disappears when off, preserve all older structures, reasonable iPhone FPS, Safari and cloud save/restore. Campfire cooking intentionally not in this release.

## v0.19 — Outfits and wardrobe
- Change clothing appearance from an inventory wardrobe or bed. Start with a small consistent set of outfits (3).
- Cosmetic first; never lose underlying equipment, inventory or character position. Save selected outfit in new save version.
- Acceptance: shirt/pants/outfit switch persists, first/third-person render remains legible, no combat collisions changed.

## v0.20 — Deeper cave, maze and mineable resources
- Preserve Echo Cave entrance and treasure IDs. Extend an explorable interior, with optional map markers and visible safe return route.
- Minable ore/stone veins have IDs, respawn or finite resource rules, and real pickaxe interaction.
- Challenge: camera occlusion, jump collision, roof hide and performance in interior spaces.
- Acceptance: can reach exit without getting stuck, mining rewards preserved, persistent found/claimed state.

## v0.21 — Second floors and larger builds
- Elevation-aware construction supports floors on multiple levels, correct stairs, roof pieces, doors, and wall collisions.
- Use an explicit `level`/height in saved structures, migrate old pieces to level 0. More generous placement dimensions and floor support rules.
- First test with a two-story cabin and stairs before increasing blueprint complexity.
- Acceptance: level transitions, jumping, placing/dismantling, roof hiding, hitboxes and save/restore (including old raised cabins).

## v0.22 — Expand world twofold in each axis
- Target world dimensions **2x width and 2x length**, yielding roughly **4x area**. Preserve old landmark coordinates and old homestead.
- Chunked scenery/LOD, deterministic resource IDs, new boundary limits, scalable map coordinates and save validation; test on iPhone.
- Acceptance: existing world still in same location, explore farther, stable FPS, new remote regions persist.

## v0.23 — Village with houses and inhabitants
- Make a recognizable settlement with ~4-8 homes, paths, campfires and a few NPC inhabitants.
- Only activate the inhabitants in **villages the player has discovered**. Villagers remain inside their settlement boundaries, with simple idle/walk routines and optional dialogue.
- Discover markers and NPC states saved; no full economic trading simulator initially.
- Acceptance: NPCs do not roam into player's homestead, limited CPU cost, persistent discovered village state.

## v0.24 — Zombies at night
- Add a small capped spawn pool outside player home/village safe zones. No structure damage, no unavoidable offline attacks.
- React to the existing day/night cycle, spawn at night, retreat/despawn after sunrise; low density and accessible combat.
- Acceptance: spawns in darkness only, villages and home remain safe, FPS and defeat recovery remain stable.

## v0.25 — Tameable dog companion
- Add bones and meat from discoverable pickups or appropriate resource drops; dog tame interaction requires both.
- Tamed dog follows within sensible distance, waits safely when player enters cramped structures/caves, and never blocks stairways or doorways.
- Save companion ownership/position; basic passive protection behavior can be added only after navigation passes.
- Acceptance: tame, follow, wait, teleport recovery, cabin access, world save/cloud sync all work.

## Release policy
1. Export your current world JSON and keep the preceding ZIP.
2. Deploy complete files to the **same** GitHub Pages URL; never clear Safari website data.
3. Migrate to a new save key; previous key remains untouched.
4. Run JavaScript and pure-system tests locally; verify module references and archive contents.
5. iPhone playtest is mandatory before marking a release accepted.
6. A risky backend change is never mixed with a new art/model/physics system. Separate cloud migration/schema delivery from public game ZIP.
7. Feature scope can shrink if the current module fails stability/performance tests.

## v0.18 cloud/save implementation note
The existing v0.17 cloud client remains in the PUBLIC build with the previously configured Wilderness **publishable key**. The separate PRIVATE v0.18 ZIP upgrades the existing Wilderness RPC from version 16-only to accept versions 16 and 17. The remote database is **not modified automatically**. v0.17 Safari saves remain read-only migration sources. Safeguard local JSON exports and verify real cloud sync on your own device before depending on it.
