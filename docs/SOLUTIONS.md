# Room plans, written before the maps

Coordinates are tile centers. Movement speed is 3.2 tiles/second. Bridges stay open for 2.4 seconds after their condition stops being true. Echoes hold their last position forever. Recording resets the room, including both actors and every bridge, at both its beginning and end.

## 1 — A first hello

Start (4,9). Left island x2–10, y2–10. Right island x15–20, y3–10. Bridge x11–14 at y8. Plate A (3,3). Exit (18,6).

Record: move left once, then up six tiles onto A, end recording. Playback: the echo repeats that route and stays on A. Player: move up to y8, right across the bridge to x16, up to y6, right into the exit. Waiting at the bridge is safe. The plate is too far from the bridge to cross alone within its 2.4-second afterglow.

This is the first acceptance gate: run the entire route with real input before adding rooms.

## 2 — Meet me halfway

Keep the first room's geography. Add plate B (10,8). The bridge requires A AND B. Record the same route, ending on A. Player moves to B. With the echo on A and player on B, the bridge opens. Walk right immediately: the crossing from B to the far island takes 1.57 seconds, leaving more than 0.8 seconds of margin. Continue to the exit. Only new idea: two actors must hold two plates; the common afterglow allows leaving the near plate.

## 3 — A little patience

Left island x2–7, y2–10. Middle x11–14, y3–9. Right x18–21, y6–10. First bridge x8–10 at y5, requires A (3,3). Second x15–17 at y8, requires B (3,9). Start (5,9), exit (20,8).

Record: left two, up six to A (~2.5 seconds); wait 3 seconds; down six to B (~1.9 seconds); end (~7.4 seconds total). Player: up to y5, right to x7, wait for A; cross to x12, down to y8, then right through the second bridge after B lights. Each crossing takes at most 1.25 seconds. Only new idea: record a route with a deliberate wait and two distinct moments.

## 4 — Until we meet again

Use room 3's islands. A (3,3) opens the first bridge. B (6,9) AND C (14,8) open the second. Start (5,9), exit (20,8).

Record: left two, up six to A; wait 3 seconds; down six to y9, right three to B; end (~8.4 seconds). Player follows room 3's route through the first bridge, then stands on C until the echo reaches B. Move right across within the 2.4-second afterglow. Reach exit. This combines the previous rules; no new mechanical rule. At the ending, the recorded footsteps become lights and the echo dissolves.

## Playtest evidence

See `docs/VERIFICATION.md` for actual execution results and limitations. Plans alone do not establish solvability. First-time duration target: 5–8 minutes, pending independent human playtesting.
