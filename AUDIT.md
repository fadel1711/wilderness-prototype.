# v0.23.8.1 focused repair audit

| Report / issue | Confirmed cause or risk | Resolution in source | Verification |
| --- | --- | --- | --- |
| Controls cover the world | Combat ring, duplicate attack, oversized stats/waypoint and action dock compete on phone | One primary action button, bottom six-slot loadout, smaller conditional Block/Dodge, unobtrusive vitals | Static CSS screenshots at four landscape sizes + rotated portrait fallback; iPhone acceptance outstanding |
| Chop/mine/use unpredictable | Legacy interaction prioritized village doors/chests ahead of chopping, and smart-action could target wrong resource | Single policy selects equipped-tool resource, then interact; `smartAction` uses that decision | 20+ action assertions; live tap checks pending |
| Accidentally opening chest in combat | A general-purpose interact button while sword equipped | Sword **always attacks**, optional guard/dodge separate | Action policy tests |
| Torch cannot open doors | Torch ignition previously outranked nearby Use | Interactable objects outrank torch toggle unless using sword | Action policy tests |
| Food unexpectedly disappears | Hotbar touch directly consumed selected food | First touch selects; main action Eat/Drink consumes once | Action policy tests; live inventory checks pending |
| Sword upside down / missing after reload | Grip geometry directed blade down; visibility not restored on saved equip | Updated geometry orientation and explicit visibility sync after save load | Source verification; live 3D visual inspection pending |
| Torch light appears at pelvis | FX lighting used hardcoded player center instead of world-space flame transform | FX now takes actual rendered `torchFlame.getWorldPosition(...)` | 5 mock THREE effects assertions; live pose test pending |
| Cloud/device modal repeats | Old `cloudDecision` conflict workflow rendered user-choice controls | Cloud-authoritative `cloudAutoDecision`, no visible chooser, offline authentication gate | 32 runtime mock checks in seven cases |
| New profile accidentally uses prior person's local world | Device-first recovery path without account check | Guard baseline user id; automatic fresh/recovery or owned-cloud restore | Account-switch scenario test |
| Two devices both editing | Independent snapshots without deterministic precedence | Existing server revision-CAS; only same-revision known pending edits upload; newer cloud wins and old device snapshot saved | Mock concurrent revision tests + read-only server function audit |
| Cloud corrupt / local cache invalid | Risk of inadvertently overwriting healthy data | Validate before applying, fail closed, pause gameplay, no destructive SQL | Remote corruption + offline mock checks |
| Cloud not actually available | Offline caching may present false success | Gate gameplay on successful server session and cloud restore; status distinguishes queued from synced | Runtime offline scenario test |
| Installed app shows stale page | Previously no update check in older releases | Keep v0.23.7 update checker & release.json cache-busting flow | Static package startup checks; iPhone PWA test outstanding |

## Backend inspection (read-only)
- Project: Wilderness; `public.wilderness_worlds` has owner-specific select/insert/update RLS.
- `public.wilderness_save_world` is **SECURITY INVOKER** (not SECURITY DEFINER), validates `auth.uid()`, rejects unsupported world versions, accepts version 22, checks payload size, and updates by exact expected revision.
- No migrations required for v0.23.8.1; no live data was changed.
- One **independent Auth security advisory** remains: leaked-password protection is disabled in the project. Consider enabling it separately in Supabase Auth settings after checking impact; not part of this client release. Official guidance: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

## Known boundaries
- The user's request says *cloud exclusively*. Runtime authority is online account cloud; device copies are **non-authoritative emergency recovery**, intentionally retained to avoid deleting existing player worlds. There is no longer a normal cloud/device choice.
- No genuine Safari WebGL runtime or two-device server transaction was exercised here. Real iPhone acceptance is required before declaring it production-ready.
- v0.23.9 camera-building overhaul remains separate; v0.24 zombies not started.
