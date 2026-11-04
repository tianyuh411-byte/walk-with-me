# Verification record

Development date: 2026-11-04, Asia/Shanghai. This record separates simulation assertions, real input execution, visual review, and missing human checks.

## Completed before Windows packaging

- First-room acceptance gate: actual browser **R + arrow key events** from title, recorded path to A, second R, room rewound, echo held A, player crossed the bridge and reached the exit. Passed before adding rooms 2–4.
- Node engine tests: **7/7 passed**. Includes full recorded solution plans, exact 12-second cap, final-position hold, clean reset, paused time, occupancy handoffs, closing bridge recovery, collision-free replay, and echo inability to finish the room.
- Full Edge browser run: title → room 1 → room 2 → room 3 → room 4 → ending. All routes performed through real keyboard events, with 3 seconds of actual waiting in rooms 3/4. Read-only snapshots observed positions and completion; no game state was injected or teleported.
- Browser boundary checks: automatic 12-second finish; early finish; four successive re-recordings; reset clears echo/samples/time/plates/bridges; Esc freezes replay and resumes; a blur event pauses and clears input; WASD movement; sound on/off button state; 960×720 viewport resize followed by movement; 390×844 layout and touch-control pointer movement; no horizontal overflow and no JavaScript console errors.
- Human-readable screenshots inspected by the agent: title and first-room echo/bridge view. Further screenshot review and desktop results are appended after execution.

This is **automated, agent-directed actual input playthrough**, not an independent human playtest. No claim is made that a human found the first-time puzzles clear or measured a 5–8 minute duration.

## Checks still requiring separate evidence

- Windows executable launch and actual desktop playthrough: completed; see results below.
- Real OS-level window deactivation/reactivation and resize: completed through native minimize/restore/resize. A human physical Alt-Tab sequence is not claimed.
- Physical phone, macOS, clean Windows machine without existing runtimes, minimum supported GPU/device: not tested.
- Audible sound quality: audio state/code tested; the agent has not listened to the resulting speakers. Human audio check required.
- Theme audio: not listened to. No fit analysis performed.
- Independent human full run, first-time tutorial usability and duration: pending.
- Real logged-in jam submission / uploaded artifact download / judging form: not attempted.

## Reproduce

`npm test` for engine assertions. Run `npm start`, then `node tools/playtest.cjs` for browser input execution. Artifacts are written to `artifacts/`. Optional `WWM_CDP=http://127.0.0.1:9337` attaches the same full input walkthrough to an already launched Windows WebView2 build; this debug port is enabled only by the external test launcher, not by the release executable.

## Actual Windows desktop results

The C# Windows x64 executable compiled successfully with .NET Framework and was launched from the built folder on this machine. It loaded its bundled files through the local WebView2 virtual host. The **full four-room keyboard walkthrough passed inside this executable**, including ending, 12-second cap, early finish, repeated re-records, reset, Esc/blur pause, WASD and sound-button checks. No browser-only simulation was substituted for this desktop pass.

`tools/desktop-check.cjs` also operated the actual WinForms window through native Win32 calls: restore → start recording → minimize → confirm time frozen → restore → confirm still paused → explicit resume → confirm time advances → finish recording → resize to 1000×780 → confirm playback → actual D movement. Both native checks passed. Screenshot: `artifacts/09-windows-resized.png`.

Two verification-tool issues were corrected: an initial CDP attach waited for a new page while an existing page was still navigating; an initial native-resume assertion waited a fixed 250 ms before WebView2 rendering resumed. The tools now observe the existing page and wait for the actual simulation clock. Failed attempts were not counted as passes.

Visual review also covered room 3, the ending, narrow mobile layout and native resized view. The ending lights now use the last recording's actual coordinates, rather than a decorative substitute. Final rebuild includes this change and both languages.

## English / Simplified Chinese verification

Complete English and Chinese packs have identical UI, HTML, ARIA and per-room keys. `node tools/language-check.cjs` passed: clean profile defaults to English; switching translates the title and room; reload preserves Chinese preference; switching during recording/playback keeps samples, mode, time and echo duration; Chinese pause freezes time; help, hints and full solutions are Chinese; 320/390/960 widths have no overflow; switching back and reloading restores English. Desktop and mobile Chinese screenshots were visually inspected.

The full four-room Chinese browser walkthrough passed through real keyboard events, including the ending, 12-second cap, pause/resume, repeated recordings and reset. No independent human translation review is claimed.

Final Windows bilingual acceptance also passed (`tools/desktop-language-check.cjs`): the rebuilt executable displays the Chinese title, room, recording/playback status and pause dialog; switching EN/ZH during replay preserves the same echo; reload preserves Chinese; switching back restores English. Final Windows screenshot: `artifacts/13-final-windows-zh.png`. A startup page-navigation race in this tool was fixed before the successful run. The game executable was compiled from the included C# host and includes both language packs.
