# Walk With Me / 回声同行

A complete, small, four-room puzzle about cooperating with your own past footsteps. English is the default language. Intended first-time duration: **5–8 minutes**, not yet measured with an independent human player.

**Languages / 语言:** English + 简体中文. Click **简体中文 / English** in the top-right corner to switch. The first launch defaults to English; the chosen language is remembered locally. Titles, all four rooms, hints/solutions, controls, recording/playback feedback, pause/help dialogs, ending and accessibility labels are translated. Switching languages preserves your current recording, echo and progress. All translation text is in `js/strings.js`; no network service or external font download is needed.

## Play

**Windows:** extract `release/Walk-With-Me-Windows-x64.zip`, then launch `Walk With Me.exe`. The adjacent `game` folder and DLLs must stay beside it. Windows 10/11 x64, .NET Framework 4.8 and Microsoft Edge WebView2 Evergreen Runtime are required. No Node, server, network or account is required. The runtime is not bundled; an official download link and failure message are included. This is a WinForms desktop application hosting WebView2, not an Edge shortcut.

**Browser:** open `index.html` directly in a modern browser (works offline), or run `npm start` with Node 18+ and visit http://localhost:5183. The browser ZIP is an optional additional edition; it does not replace the Windows build.

## Controls and exact rules

| Input | Action |
| --- | --- |
| WASD / arrow keys | Move on the islands and lit bridges |
| R | Begin recording / finish early; record again to replace the single echo |
| T | Reset the entire room, including echo, bridges and recording |
| Esc | Pause / resume (cannot skip a completed-room screen) |
| Sound button | Mute / enable all sounds and any optional music |
| Touch arrows | Basic movement on narrow browser screens |

Every recording begins at the room's fixed initial state and lasts at most 12 seconds. Finishing restores the player and every room state before starting the echo. The echo follows recorded positions against the simulation clock, without collision solving, and holds its endpoint indefinitely. It never loops, blocks the player or activates an exit. Either actor can hold plates. Multiple listed letters on a bridge mean all those plates must be occupied.

After its plate condition releases, a bridge flashes and remains walkable for **2.4 seconds**. The timer is refreshed while its condition is held. If a bridge disappears beneath the player, the entire attempt resets with an explanatory message. All rooms use this rule. Pressure occupancy is recomputed for both actors before and after player movement to handle handoffs correctly.

Escape, losing window focus and tab visibility changes freeze the simulation and clear held input. Returning requires an explicit resume. Fixed 60 Hz simulation uses bounded accumulated frame time; no real-time clock is used for replay. Resize affects presentation only.

## Rooms and hints

1. **A first hello:** leave an echo on A to open a distant bridge.
2. **Meet me halfway:** hold A and B together; use the bridge's afterglow to cross.
3. **A little patience:** record A, wait, then B; take the two crossings in sequence.
4. **Until we meet again:** combine that timed route with meeting the echo at C.

Open **How to play**, then **Show a hint**. Click again for the full route. Initial tutorial hints change with recording/playback state. Full design routes were written before map expansion in `docs/SOLUTIONS.md`.

## Source layout

`js/engine.js` contains the fixed-step simulation and replay. `js/levels.js` is the map registry. `js/strings.js` centralizes English/Chinese interface and room copy; `index.html` contains semantic markup and English fallback copy. `js/render.js` draws original procedural graphics; `js/audio.js` generates simple sine-wave feedback. `js/main.js` coordinates input, dialogs and current-room progress. No third-party browser library is shipped.

`tools/DesktopHost.cs` is the Windows host. `tools/build.ps1` compiles it with the Windows .NET Framework compiler and assembles the Windows/browser/source ZIPs. The host maps bundled files to a local virtual HTTPS origin; it does not contact a server. Its local WebView2 profile is `%LOCALAPPDATA%/WalkWithMe/WebView2`.

## Build and verify

```powershell
npm test
npm start
# In another terminal, using an existing Playwright installation:
node tools/playtest.cjs
node tools/language-check.cjs
# Build on Windows:
npm run build
```

`tools/playtest.cjs` defaults to the bundled Codex Playwright path on the development machine. On another machine set `WWM_NODE_MODULES` to a directory containing `playwright`, or edit the fallback path. Set `WWM_LANGUAGE=zh` to run the full walkthrough in Chinese. An installed Edge browser is used for verification only. Neither is a player dependency. Tests use real keyboard/pointer events; a read-only snapshot observes state and never sets it. See `docs/VERIFICATION.md` for what was actually run.

Build requires Windows .NET Framework 4.8 (including its C# compiler), PowerShell, and the official WebView2 SDK **1.0.4314.35**. The build script downloads the SDK from Microsoft's NuGet feed only when its local cached copy is absent. Source ZIP excludes the SDK cache; internet access is needed for that first build. SDK redistribution license and notices are included with the desktop build. The app is unsigned.

For documentation/game-file repackaging with an unchanged, already compiled C# host, `powershell -NoProfile -ExecutionPolicy Bypass -File tools/build.ps1 -SkipCompile` refreshes the game files and archives without recompiling the host. Use the normal build after any C# or host icon change.

`assets/icon.ico` is included; `tools/make-icon.py` optionally regenerates it using Python/Pillow. It is not required to build or play.

Build outputs:

- `release/Walk-With-Me-Windows-x64.zip` — actual desktop executable, game and runtime-loader DLLs.
- `release/Walk-With-Me-Browser.zip` — optional offline/browser edition, root index.html.
- `release/Walk-With-Me-Source.zip` — full game, desktop host, docs, tests and build scripts.
- `release/SHA256SUMS.txt` — archive checksums.

## Theme and submission status

Official rules were fetched directly on 2026-11-04 from https://itch.io/jam/thatgamejam02. Deadline: **2026-11-08 15:59 Asia/Shanghai** (07:59 UTC; November 7, 23:59 PT). Submit on one platform only. English default and a Windows/Mac build are required. AI use must be disclosed. A new original work is required. See `docs/JAM.md`, `docs/SUBMISSION.md` and `CREDITS.md`.

**The official theme audio has not been listened to by this development agent.** No claim is made that the current emotional structure matches it. No official recording, sample, cover, third-party music or downloaded media is shipped. `WWMSound.setMusic(localUrl)` is a replaceable local music interface; a later authorized original recording may be supplied unmodified, with the required credit and jam-only permission. The current game is mechanically complete but theme interpretation and actual posting remain pending.

TapTap preparation on November 4: app 1027904 under RainStar工作室; landscape H5 package uploaded and bound; entrant reported the official QR phone test worked, including recording and Chinese switching. Store text, icon, promotional art, three actual screenshots and an actual keyboard-driven four-room demonstration video are saved. Activity 18 / creation event 29 questionnaire is saved as a draft (not submitted). Windows download hosting, a durable video link and an online AI-disclosure document remain pending. See `docs/JAM.md` and `docs/jam-entry.html`.

Known limits: independent first-play duration measurement pending; only this Windows machine and local Edge/WebView2 were tested by the agent; phone test success is entrant-reported, with device details unspecified; no clean-machine or Mac test; no Mac binary; current-room only save; no full screen-reader equivalent for the spatial puzzle. No advertising, store, leaderboard, networking or level editor.
