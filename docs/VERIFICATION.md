# Verification record — November 5, 2026

## Actual input versus isolated tests

Playwright sends keyboard/pointer input to the running game. WWMDebug is read-only observation; no positions, room indices or win flags are injected. This is script-driven actual operation with known solutions, not independent human playtesting.

The public v1.0.0 Windows ZIP was anonymously downloaded, SHA256 matched, extracted completely and its EXE launched on this Windows machine. All four rooms through ending passed real keyboard input (artifacts/delivery-check/windows-playthrough.log). Early finish, automatic12-second cap, repeated recordings, clean T reset, Esc/synthetic blur pause, WASD and mute passed. Earlier actual browser runs passed all rooms in English and Chinese, narrow layouts and touch-pointer controls. The entrant separately reported official QR phone testing normal; device unspecified.

## v1.0.1 native-window correction

Initial public-build rechecks did not reliably observe pause 400ms after native minimize. The host now explicitly handles WindowState.Minimized as well as Deactivate, covering minimize before acquiring focus. The test polls every100ms with a bounded timeout because requestAnimationFrame polling can stop in a minimized window. A discarded elapsed assertion incorrectly included PowerShell startup. Failed attempts were not counted as passes.

The rebuilt actual EXE passed native minimize → time frozen → restore still paused → explicit Resume advances time → resize1000×780 → playback and D movement (native-window-v101.log). The Windows Chinese check passed title/room/status/pause, live EN/ZH switching preserving the echo, preference persistence and return to English (native-language-v101.log).

Full-run attempts interrupted by external window focus/occlusion were recorded as failures. The runner now explicitly clicks Resume during a movement step if an external focus loss pauses play. Final automation may use externally supplied Chromium occlusion flags solely to keep rendering while other windows cover the game; these flags and the CDP port are not enabled by the shipped EXE. See DELIVERY.md for final results.

Final v1.0.1 result: **all four rooms through the ending passed in the actual rebuilt Windows EXE**, followed by the 12-second cap, early finish, repeated re-records, T cleanup, Esc/blur time freeze, WASD and mute (windows-playthrough-v101.log). One external focus pause was resumed using the visible UI. The separate same-version browser run also passed four rooms, boundary operations, resize and touch input (browser-playthrough-v101.log). Overshooting tile centers in some automation attempts was corrected with short real key taps, never state injection. The final launcher used external CDP/occlusion options; the delivered host does not set them.

## Automatic checks

Additional actual browser keyboard run passed pressure overlap, both handoff directions, closure after both actors leave, and standing on a fading bridge until complete clean reset (pressure-playthrough-v101.log). This test also uses only keyboard actions and read-only observations.

node --test tests/engine.test.cjs: 7/7 passed. Covers planned routes, recording cap, endpoint hold/reset, pause clock, pressure handoff, bridge fade under player and echo collision/exit restrictions. These isolated engine tests are not actual playing.

tools/verify-release.py checks ZIP CRC, runtime bytes equal source, real x64 PE, WebView2 dependencies/licenses, full source and SHA256 manifest. Fresh result: release/VALIDATION.json. tools/language-check.cjs checks default English, EN/ZH keys, persistence, state-preserving language changes and narrow layouts.

## Unverified / limitations

- Independent new-player full run, tutorial clarity and actual5–8 minute duration.
- Audible quality by the agent. Entrant supplied theme impression; agent did not listen.
- Clean Windows without existing prerequisites, other hardware, physical human Alt-Tab and Mac. No Mac binary.
- Physical-phone testing is entrant-reported; touch simulation is separate.

## Reproduce

npm test. Start npm start, then node tools/playtest.cjs and node tools/language-check.cjs with Playwright (set WWM_NODE_MODULES if necessary). For actual desktop checks externally enable a WebView2 CDP port, set WWM_CDP and WWM_PROCESS_ID, then run desktop-check.cjs, desktop-language-check.cjs, playtest.cjs or plate-playtest.cjs. Normal release launches have no debugging port. Screenshots/logs in artifacts are excluded from source archives.
