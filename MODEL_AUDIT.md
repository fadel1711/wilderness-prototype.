# Wilderness v0.23.8.3 — Uploaded 3D Asset and Animation Audit

## What was received and what was actually checked

All **10** supplied GLB files were inspected directly (not inferred from their filenames):
`Survivor_rigged.glb`, `Walk.glb`, `Run.glb`, `Sword_attack2.glb`, `Block.glb`, `Dodge_roll.glb`, `Defeat.glb`, `Pick_item.glb`, `Hold_torch.glb`, and `Ignite_torch.glb`.

**Pass:** all ten use glTF 2.0 binary containers, the same **44-joint skeleton**, and an **8,236-vertex** single skinned character mesh. The character is oriented toward +Z, matching the existing game world. The rig contains `mixamorig:RightHand` (GLTFLoader may convert its name to `mixamorig_RightHand`). The newest export, `Ignite_torch.glb`, already contains all **20 unique clips** present across the other nine files. The other exports' animation names are subsets of it.

**Efficiency:** bundling the ten files individually would cost about **37.2 MB** in raw GLBs. The complete latest exported GLB is **5.3 MB** and contains the same model and all uploaded motion clips. For iPhone loading, the release uses only this cumulative GLB, renamed to `assets/survivor-animated.glb`, and retains the original procedural character if the new asset can't load.

**Not ready for final visual quality:** the supplied GLBs have **no embedded textures, images, or material definitions**. They render as a uniformly colored clay-like model. The existing game's clothing-color wardrobe cannot recolor the separate garment pieces inside that single merged Meshy mesh. The game therefore provides an **Animated Survivor On/Off** switch; Off restores the old dressable character.

**Motion naming:** some of the 20 clip names are opaque generated IDs. File-by-file cumulative differences let us associate some newly added clips with the requested activities, but **do not establish that the generated motion looks correct**. The player model is integrated directly into Wilderness, with locomotion and activity clips selected by gameplay. Named idle/walk/run/jump/attack/axe clips are present. The separate pickaxe-mining motion is **not clearly identifiable** in the exports; mining temporarily uses the chopping motion. Some long clips are sped up to fit the current gameplay action timing. Those mappings and timings are **provisional**.

## Integration scope

- A model loads asynchronously into the existing player object, preserving collision, movement and world position.
- An `AnimationMixer` blends Idle, Walk, Run, Jump, Sword Attack (two variations), Block, Dodge, Chop, Pickup, Hold Torch and Ignite Torch.
- The right-hand joint drives the equipment mount so the sword, axe, pickaxe and torch follow the animated arm. Root horizontal motion is removed to prevent animation clips from teleporting the character through solid buildings. Game physics handles jumping and dodge displacement.
- The Defeat motion and other unlabeled extra clips are bundled in the model but not triggered by gameplay, but the instant-forgiving respawn system is unchanged, so Defeat is **not played during an actual loss of health** yet. This avoids changing a core gameplay rule solely to expose an unused motion.
- Only new animation assets, client-side player rendering and an optional device-local appearance preference changed. **No save schema, Supabase SQL, cloud policy, RLS, authentication, gameplay hitbox or inventory edits.**

## Tests completed and limitations

- Checked GLB headers/lengths, chunk alignment, mesh/skin/accessor structure, the shared 44-joint skeleton and membership of all 20 animations in the combined file.
- Verified no textures are embedded; confirmed 20 clips and right-hand bone; tested code and HTML script syntax, cache-version links, asset presence and ZIP CRC after packaging.
- Verified the new animated survivor does not replace the original until loading succeeds, and a fallback path exists for missing/invalid assets. The survivor model is part of normal gameplay and does not change cloud data.
- **Not simulated:** actual iPhone WebGL render of this newly imported model, GLTFLoader bone binding and skinned movement appearance, Safari memory/performance, and smoothness/quality of each generated motion. The runtime uses Three.js from a CDN not accessible in this test environment. You must inspect the character during actual gameplay on an iPhone before considering these animations fully accepted.

## What's still worth creating or refining

1. **Textured, material-separated Meshy character export** if you want the jacket, skin, gloves, hood and boots to have realistic colors and support the existing wardrobe options.
2. **Dedicated pickaxe mining** and a short, confirmed **Axe Chop** motion (the exported `Charged_Axe_Chop` takes 7.67 seconds unretimed).
3. Verified **sword-attack variations**, correctly timed **Block/Dodge** and **Torch Hold/Ignite** after visually checking the unnamed clips.
4. Optional **damage / defeat / interact** hooks in a later focused release after the core gameplay remains stable.

Don't purchase more Meshy animation generations yet. Test the bundled animations in actual gameplay first; some may already be in the 20 exported clips under opaque names.

**Guest mode addition v0.24.1:** New local-only guest save key, profile gate entry, no guest cloud sync; account-mode cloud behavior preserved. Runtime iPhone test pending.
