# Continuous object-paced playback fix — 2026-10-19 (KST)

The owner's actual 625px in-app browser reported `prefers-reduced-motion: reduce`. The old reduced-motion branch set every travel duration to zero, causing a held slideshow instead of continuous zoom. This was reproduced by reading the browser preference and comparing it with the source implementation.

Directly requested playback now uses continuous interpolation in both preference modes. Reduced motion increases travel duration by 1.5 times, preserving deliberate slower travel. Both modes ease to a stop at each exact scientific exponent, hold for 1,500ms, then continue. There is no autoplay on page load or looping. Pause, manual input, hidden-tab pause and motion-preference-change pause remain available. The owner's explicit request supersedes the previous zero-duration step behavior; unrelated UI motion still follows the site's reduced-motion styles. No OS/browser preference was changed.

Measurements, SVG geometry, physical size ratios and logarithmic positioning are unchanged. Existing requestAnimationFrame playback updates the slider, ruler and SVG from the same continuous exponent. Routing occurs only at pause/end rather than on every frame.

## Verification

- `bun run check`: 0 errors, 0 warnings.
- `bun run test`: 28 passed. Added dense 16ms sampling across every transition under both motion preferences to detect skipped intermediate positions; exact arrivals and 1.5s holds are retained.
- `bun run lint`: ESLint/Prettier passed.
- `bun run build`: static build passed.
- Full desktop/mobile Playwright: 48 passed in 162.0 seconds; no failures, skipped tests or flaky results. A regression test opens `/scale/?object=ecoli` with reduced motion and checks six intermediate slider/ruler/SVG positions, monotonic travel, physical shrink ratios and DNA arrival/hold. Existing navigation, sources, pause/resume, manual interruption, endpoints, accessibility and responsive checks also passed.
- Actual in-app browser: reduced motion remained true; intermediate exponents were observed during playback, followed by a successful pause. This checks the user's active environment in addition to isolated Playwright contexts.

`node scripts/verify-continuous-playback.mjs` independently exercised real-time playback without installing a fake clock. It sampled intermediate shrinking frames, checked DNA arrival and a further 400ms hold, then verified pause in three cases: desktop 1440×1000 with normal motion, 625×892 with reduced motion, and 390×844 with reduced motion. The 300ms moving windows returned 10, 17 and 19 samples respectively, with no browser runtime errors. These are functional opening-sequence samples, not a full-tour timing or FPS benchmark. The first capture attempt looked for a microscopic SVG body before starting from the Earth camera; that body was correctly culled. Reading the body after playback begins fixed the capture script, and all three final cases passed.

## Evidence

All final evidence is under `artifacts/continuous-playback/`:

- `playwright-results.json`: full 48-test report.
- `live-samples.json`: real-time intermediate camera and SVG lengths.
- `desktop.webm`, `625-reduced.webm`, `mobile-reduced.webm`: actual browser recordings.
- For each case: `NAME-between-1.png`, `NAME-between-2.png`, `NAME-dna-hold.png`.
- `desktop-moving.png`, `mobile-moving.png`: fake-clock regression captures.

Inspected the two actual 625px intermediate captures and the 390px DNA hold capture. No deployment, DNS changes, dependencies or new performance benchmark claims.
