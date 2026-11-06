# Wilderness v0.23.8.2 — Meshy Survivor + Animation Preview

This is a **complete GitHub Pages game package**, built from the prior v0.23.8.1 Calm Controls & Cloud Recovery release. **No Supabase migration** and **no world-save schema change**. The upcoming separate v0.23.9 building-camera release and v0.24 zombies are not included.

## First: is the upload good enough?

**Yes for an interactive prototype, not for final production visuals.** All ten uploaded GLBs were inspected. They share an identical 44-joint rig and 8,236-vertex mesh. The most recent `Ignite_torch.glb` already includes all 20 combined motion clips, so only that cumulative file is needed. It has been added as `assets/survivor-animated.glb` (~5.3 MB). **The model is untextured**, so it will look clay-gray, not like the textured character shown in Meshy's thumbnails. Several motion clip names are opaque and their exact action quality needs visual inspection on your iPhone. See `MODEL_AUDIT.md`.

## Step-by-step iPhone installation (NO SQL)

1. On your current version, use **Bag → Export world** and store the JSON in Files. Do **not** delete your Home Screen app or clear Safari data.
2. Download and extract the **entire** `wilderness-prototype-v0.23.8.2.zip` package in Files.
3. Go to your existing Wilderness GitHub Pages repository and upload/replace **all** files from the extracted package. Keep `index.html`, all `.js`, `animation-preview.html`, `manifest.webmanifest`, and `release.json` at the root. Keep the complete `assets/` subfolder, **including `assets/survivor-animated.glb`**. Do not put all files inside an extra directory.
4. Commit and let GitHub Pages deploy.
5. In Safari, open the same deployed Wilderness website with `?app=0.23.8.2` appended to `index.html`. Verify the title says **v0.23.8.2**, log into the **same account**, and wait for **☁ Cloud live** before doing important work. Avoid deleting the existing installed app.
6. To see **all 20 animations** without opening your saved world, open the same site's `/animation-preview.html`. Rotate the character by dragging, pinch to zoom, select clips from the dropdown and adjust speed. The viewer does **not** use your account or cloud data.
7. Inside the game, open **Bag → Game settings**. The **Meshy Survivor** button toggles between the new rigged model and the classic avatar. The new model loads asynchronously; if the file is missing/broken it automatically leaves the classic avatar visible. Clothing-color controls still affect the classic avatar; the Meshy model has no garment materials yet.
8. Try walking/running/jumping, attacking, blocking/dodging, chopping/mining and igniting/holding the torch. Observe the actual tool in the animated right hand. If any movement is wrong, choose **Meshy Survivor: Off** in Settings; this is a device-local preference, not a world reset.

## Known limitations

- The model will be **plain gray** until you provide a textured/material-separated export. That is not a failure of this package.
- 20 imported clips are available in the animation viewer; gameplay uses the relevant subset. **Defeat** is deliberately not triggered yet because your world currently has instant, forgiving recovery. Dedicated mining is not verified; it temporarily uses chop motion.
- The preview uses an existing online Three.js CDN. The GLB is hosted locally with the game. An unavailable CDN will prevent both game and viewer from loading; a missing GLB should fall back to the classic model without freezing the rest of the game.
- Source/GLB and import validations are automated. Actual WebGL/skin animation, equipment alignment and performance on iOS remain **unverified** until your physical iPhone tests them. Do not describe the animation visuals as fully accepted yet.

## Rollback

Re-upload the prior full **v0.23.8.1** GitHub ZIP while preserving your account, browser site data and JSON backup. The cloud schema is unchanged. If your latest cloud save is invalid/unavailable, **do not overwrite it** or run manual SQL; preserve exported backup and report the error.

## Acceptance checklist

- [ ] Game shows v0.23.8.2; old world and Cloud live work.
- [ ] Animated character loads; it is gray but not invisible, gigantic or sunk underground.
- [ ] Walk/run/jump transition without obvious teleporting or sliding.
- [ ] Sword/axe/pickaxe/torch follow the animated **right** hand, not the torso; sword points in a sensible direction.
- [ ] Primary action continues to Attack, Chop/Mine, Ignite and Use without freezing.
- [ ] Opening `animation-preview.html` shows all **20 clips** and the preview controls work.
- [ ] Toggling **Meshy Survivor: Off** restores the old character with hood/scarf choices intact.
- [ ] Your cloud world is unchanged after closing and reopening the game.
