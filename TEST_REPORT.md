# v0.24.2 test scope

- Source base: v0.24.1 complete ZIP from prior release.
- Added `tutorial-system.js` pure state machine with 6 steps and mode-scoped localStorage key.
- Checks: JavaScript syntax; tutorial state-machine events, legacy-world auto-complete, separate guest/account keys, checkpoint reload, source dependencies; HTML/UI layout at landscape and rotated portrait dimensions; ZIP asset layout and integrity.
- **Not verified**: end-to-end 3D WebGL/Three.js runtime in iPhone Safari (the test container blocks browser network access, including localhost navigation). Real-player gameplay acceptance is required before promotion to production.
- No remote GitHub or Supabase writes performed.
