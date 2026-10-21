# A2O — Decisions and Progress Ledger

Last updated: 2026-10-19 (KST)

## Agreed decisions

1. Canonical site identity is **A2O — Atom to Orbit** (`a2o.kr`). Korean-first, independent science atlas dedicated to scales, distances and accessible visual explanations.
2. The website must have genuine independent educational value, transparent sources, and real operating history. No invented material or fabricated history.
3. Visual direction is **Editorial Observatory**: warm paper, restrained editorial type, precise diagrams, a dark measurement instrument as the key interactive visual; not a generic starfield/AI landing page.
4. Current delivery will be developed **separately with Codex Desktop** using Svelte 5 / SvelteKit 2 / TypeScript / Bun / static-first architecture.
5. Build **locally first**; user will later report implementation progress. No production deployment or DNS changes are authorized yet.
6. Detailed scientific article production, public deployment and external evidence collection will be revisited after the site's first implementation.
7. The master specification is `A2O_MASTER_GUIDE.md`; root `AGENTS.md` points Codex to that specification.

## Current state

- 2026-10-19: Design research, master design/implementation guide and responsive visual reference **prepared**.
- Actual SvelteKit repository implementation: **not yet reported**.
- Production website availability: **not claimed**.
- Real scientific article library: **planned, not yet co-written here**.
- Domain deployment and independent operation proof: **later phase, not started in this pack**.

## Handoff prompt for next session

> We're continuing the A2O (Atom to Orbit) science atlas project. Use `docs/A2O_MASTER_GUIDE.md` and `docs/A2O_DECISIONS_AND_PROGRESS.md` as the governing charter. We build the site with Codex Desktop, review concrete screenshots and functionality, then co-author sourced science articles and only later move to public deployment, GitHub evidence and web archival. Do not silently rewrite agreed identity/design decisions.

## How to update

Append a dated, factual entry after each accepted milestone. Keep old entries; state superseded decisions explicitly. The owner may authorize changes to scope, design, publication rules and production actions.

## Implementation milestone — 2026-10-19 (KST)

This entry supersedes only the earlier unimplemented state; all agreed identity, design and local-only decisions remain in force.

- Implemented the first local Svelte 5 / SvelteKit 2 / TypeScript / Bun site with adapter-static, Korean Editorial Observatory styling and responsive navigation.
- Added a logarithmic explorer with seven checked measurements, SI-meter data, measurement definitions, conversion derivations, source records, a native keyboard slider, direct object selection and a JavaScript-independent data table.
- Wrote two real, sourced local sample articles: Earth–Moon distance and atomic reference length. These are local first drafts, not a claim of prior public publication.
- Added method/source index, about, actual updates, 404, sitemap, robots, favicon and original social preview art.
- Retained original root specification files and placed an unmodified master-guide copy under docs/ to resolve AGENTS.md paths. The docs ledger and root ledger both carry this factual milestone.
- Self-hosted a 94,016-byte renamed SUIT glyph subset with OFL notice and a reproducible subsetting script.
- Verified check (0 errors / 0 warnings), lint, 8 unit tests, 18 Playwright tests and static build. Reviewed desktop/mobile screenshots. Automated axe checks on representative pages reported no violations; tested 360/390/768/1280/1440/1920 widths, keyboard, 200% text enlargement, reduced motion, no-JavaScript content and real 404 handling.
- No public deployment, DNS edits, remote pushes or fabricated operating history. See docs/IMPLEMENTATION_REPORT.md and artifacts/ for evidence and remaining verification limits.

## UI/UX improvement — 2026-10-19 (KST), v0.1.1

Applied the official UI/UX Pro Max skill's verified readability, input-label, drag-alternative, state-feedback and responsive-table recommendations while preserving the master guide. Improved the full explorer, mobile selection/data reading, article contents and keyboard menu focus. Science data and sources remain unchanged. check/lint/static build passed; 8 unit tests and 22 Playwright tests passed. See docs/UIUX_PRO_MAX_IMPROVEMENTS.md and artifacts/uiux-before/, artifacts/uiux-after/. No public deployment or DNS changes.

## Vercel Agent Skills improvement — 2026-10-19 (KST), v0.1.2

- Retrieved official vercel-labs/agent-skills at commit 063bee94c3f4df8453406c830b0a7df0f2860278 and applied web-design-guidelines after fetching its current Web Interface Guidelines source. Kept React/Next.js and deployment skills outside this SvelteKit task.
- Made object choices, precise logarithmic cursors and article topic filters shareable through URL queries, with reload and browser history restoration. Preserved keyboard focus and scroll; continuous range input replaces rather than appends history entries.
- Added filter result announcements, explicit select focus, balanced headings, table numeral alignment, matching theme color and critical font preload. Regenerated the licensed subset to 99,612 bytes.
- Verified check: 0 errors / 0 warnings; lint passed; 13 unit tests passed; static build passed; 28 Playwright tests passed. Representative axe checks found no violations. Local mobile Lighthouse: 96 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 2.4s, CLS 0, TBT 30ms.
- Evidence: docs/VERCEL_AGENT_SKILLS_IMPROVEMENTS.md and artifacts/vercel-before/, artifacts/vercel-after/. Original brand, source-backed scientific dataset and static architecture remain intact. No public deployment, DNS changes or remote push.

## Emil skills follow-up — 2026-10-19 (KST), incomplete verification

- Read the official emilkowalski/skills README and emil-design-eng skill through web browsing. Applied source changes for pointer-specific hover, short press feedback, immediate repeated selection and keyboard link emphasis. Preserved the owner's removal of the object picker's focus outline.
- GitHub clone and the owner-requested Aside alternative were not executed because automatic approval review failed with model capacity errors. No local skill installation or new check/lint/test/build/browser pass is claimed.
- Resume installation and verification when review is available. Current pending details: docs/EMIL_SKILLS_IMPROVEMENTS.md. No deployment or DNS changes.

## Taste Skill application — 2026-10-19 (KST), verification pending

- Applied the available shared design-taste-frontend skill to the homepage as a preservation redesign. Recorded project-specific scope and overrides in docs/A2O_TASTE_DESIGN_WORKFLOW.md and linked it from AGENTS.md.
- Removed repeated section-number labels and the decorative hero brand/year line. Replaced three matching topic boxes with an editorial topic index, stacked the section explanation under its heading, distinguished the cosmic topic with the existing Sun diagram, and shortened the featured question heading.
- Kept page routes, navigation, original scientific measurements/sources, log geometry, paper/ink/teal/copper palette and the owner's object-picker outline preference.
- Reviewed existing v0.1.2 screenshots and current source; these are not after-change visual results. Two attempts to run check were not executed because automatic approval review failed with model capacity errors. New type/lint/test/build/Lighthouse and browser verification remain pending. No public deployment or DNS changes.

## Hallmark follow-up — 2026-10-19 (KST), download and verification pending

- Located official Nutlope/hallmark and read its SKILL.md plus relevant editorial/responsive/redesign references through web browsing. Repository clone was not executed because automatic approval review failed with model capacity errors; no installed skill or local upstream snapshot is claimed.
- Updated existing homepage grids to shrink within their containers, added long-heading wrapping, separated topic link names from their descriptions, and named existing shared interaction colors. Kept scientific content, routes and the master visual system.
- Required check/lint/test/build invocation was also not executed due to the same review failure. Browser verification, fresh screenshots and all pending installation work remain outstanding. Details: docs/HALLMARK_IMPROVEMENTS.md. No deployment or DNS changes.

## Impeccable refinement — 2026-10-19 (KST), installation and verification pending

- Read official pbakaus/impeccable skill (web frontmatter 4.6.0), polish and craft-floor guidance. Download was not executed due to automatic approval review model capacity failure; no local skill installation is claimed.
- Removed decorative diagram ticks/coordinate labels, layered panel grids/gradient, hero eyebrow/underline and redundant header tagline. Retained the actual source-backed logarithmic chart and scientific geometry. Increased mobile hero action text to 14px.
- Current browser tab binding and check/lint/test/build execution were also blocked by the same review failure. Source changes are present; installation and all after-change verification remain pending. Details: docs/IMPECCABLE_IMPROVEMENTS.md. No deployment or DNS changes.

## Anthropic frontend-design — 2026-10-19 (KST), final verification pending

- Read the official anthropics/skills frontend-design instructions through web browsing. Retained A2O's subject-specific brand and implemented shared editorial refinements across home, scale, article index/detail, method, about, updates, footer and error pages.
- Added context-appropriate article heading levels and accessible link names/descriptions. Removed redundant decorative labels, clarified category/contents treatment and aligned footer interactions. Extended existing Playwright coverage and planned capture targets.
- At task start, check successfully ran on the then-current prior changes: 0 errors / 0 warnings. This partially resolves earlier type-check uncertainty, not runtime or visual verification. After this task's edits, check/format/lint/test/build and repository clone were again blocked by automatic approval review model-capacity failure.
- No final build, screenshot or browser pass is claimed. See docs/ANTHROPIC_FRONTEND_DESIGN.md for exact scope and status. No deployment or DNS changes.

## Cumulative verification — 2026-10-19 (KST), v0.1.3

- Diagnosed automatic review timeout/model capacity errors and the active app policy. Following the owner's manual-approval response, required commands executed normally. No global approval/security configuration or file permissions were changed; permanent reviewer-service recovery is not claimed.
- Fixed formatter traversal of temporary vendor files, strengthened link/fragment/image/browser-error checks, verified the mobile picker outline preference, added reproducible link/display evidence and actual v0.1.3 updates. Rebuilt the licensed font subset to 100,700 bytes.
- Final results: check 0 errors / 0 warnings; ESLint and Prettier passed; 13 unit tests passed; static build passed; 28 Playwright tests passed in 56.1 seconds with no failures/skips/flaky outcomes. Representative desktop/mobile axe checks: 0 violations. Widths 320 through 1920px, 200% text, keyboard navigation, URL history and scientific geometry passed.
- Additional Playwright audit: 18 page visits; 30 internal URLs/assets and 7 external scientific sources all HTTP 200; no failed requests, font failures or horizontal overflow. Fresh full-page and viewport captures: artifacts/verification-2026-10-19/.
- This closes the after-change verification pending in the Emil/Taste/Hallmark/Impeccable/Anthropic entries. Their separate upstream-download/installation limitations remain truthful. No new Lighthouse score, deployment, DNS change or remote push is claimed. Details: docs/VERIFICATION_2026-10-19.md. Existing dev preview at 127.0.0.1:5173 serves current v0.1.3.

## Stable homepage explorer height — 2026-10-19 (KST)

- Reproduced atom-to-ball panel height shifts of 3.90625px at desktop 1440px and 107.375px at mobile 390px. Reserved the atom's name/value footprint in the compact readout using hidden, aria-hidden sizing content and a shared CSS Grid area. No fixed panel pixel height, new runtime dependency or scientific-data change.
- Added desktop/mobile regression checks for every object, panel height/top and slider position across 320/390/649/768/1024/1440px. Accounted for screenshot-induced scrolling with document-relative coordinates.
- Final check: 0 errors / 0 warnings; lint passed; 13 unit tests passed; static build passed; all 30 Playwright tests passed. Atom/ball captures have matching dimensions: desktop 633x620, mobile 350x722. Details: docs/STABLE_EXPLORER_HEIGHT.md; captures: artifacts/stable-explorer/. Existing localhost:5173 serves the fix. No deployment or DNS changes.

## Ruler-only explorer — 2026-10-19 (KST)

- Owner explicitly requested removing the staggered-point plot instead of explaining its vertical placement. Removed object dots, dashed guides, plot height and the object-position legend from both home and scale. Kept a short logarithmic ruler, current cursor, native slider and source-backed data table. Removed stale point explanations; added no vertical-placement caveat. This direct owner decision supersedes the master's point-plot example without modifying its source document.
- Check 0 errors / 0 warnings; lint passed; 13 unit tests passed; static build passed; full Playwright 30 passed. After removing stale explanatory copy, rebuilt and passed 6 additional desktop/mobile link, responsive and accessibility checks. Height stability and input synchronization remain covered.
- Evidence: docs/RULER_ONLY_REFINEMENT.md and artifacts/ruler-only/. Existing localhost:5173 serves the new ruler without the old legend. No public deployment or DNS changes.

## Continuous shared-scale SVG zoom — 2026-10-19 (KST), v0.1.4

- Implemented the owner's requested shrinking/revealing interaction in both home and scale. All registered objects share a continuous SI-based horizontal scale; moving one logarithmic decade divides each drawn length by ten, without resetting on nearest-object selection changes. Kept the ruler-only axis and stable readout layout.
- Added a responsive SVG scene, viewport width and physical scale bar. Atom comparison uses the 2a0 reference segment; table comparison uses its long side. Tiny objects are not enlarged to fake visibility, and giant circular surfaces use stable clipped geometry. Decorative shape details/positions do not introduce new measurements or inter-object distances.
- Updated method, actual local updates and package version. Rebuilt the licensed font subset to 101,340 bytes. No new runtime dependency or scientific source-data change.
- Final results: check 0 errors / 0 warnings; lint passed; 17 unit tests passed; static build passed; all 32 Playwright desktop/mobile tests passed. Tested actual SVG pixel shrinkage, simultaneous table/ball ratio 68.5, continuity across object-selection boundaries, prior height stability and accessibility. Captured 14 zoom stages and inspected major stages. Evidence: docs/CONTINUOUS_SCALE_ZOOM.md and artifacts/scale-zoom/.
- Existing localhost:5173 serves the new scene and v0.1.4. No public deployment, DNS change or remote push.

## Expanded scale catalogue — 2026-10-19 (KST), v0.1.5

- Implemented all 15 owner-approved additions, bringing the catalogue to 22 source-backed SI measurements. Added distinct definitions for representative examples, maxima and nominal sizes, stored ranges, micrometer formatting and limited display precision for the derived football diameter. Corrected Lotte World Tower 555.7 m to tip height, distinct from architectural height 554.5 m.
- Observed at least one actual reference image for each new subject (15/15 loaded), then drew original SVG forms. Recorded the image addresses, observed features and measurement sources separately; exposed scientific and illustration references on /method. No remote photos are required to render the site.
- Applied the shared physical scale to each measured direction, including vertical thickness and tower height. Added continuous catalogue camera spacing, restrained incoming-object opacity, and maintained finite rendering coordinates and the ruler-only axis. Reserved all catalogue labels, descriptions and source labels to prevent height shifts. Preserved native mobile selection, keyboard, URL history and no-JS data.
- Final check: 0 errors / 0 warnings; ESLint and Prettier passed; 20 unit tests passed; adapter-static build passed; all 36 Playwright tests passed after the final artwork refinements. Tests cover actual tenfold SVG shrinkage for all 22 objects, pointer dragging, responsive height stability, 200% text, no-JS content, internal links and representative axe checks.
- Additional evidence: 30 object/device display checks without horizontal overflow; 32 unique scientific/illustration links all HTTP 200 without access challenges. Font subset: 114,480 bytes. Confirmed localhost:5173 serves the new red-cell SVG and 22 data rows without browser errors.
- Evidence: docs/SCALE_CATALOGUE_EXPANSION.md; artifacts/scale-expansion/ (individual panels, desktop/mobile galleries, image reference boards, source/display audits and final Playwright JSON). No new runtime dependency, public deployment, DNS change, remote push or new Lighthouse claim.

## Complete solar-system planets — 2026-10-19 (KST), v0.1.6

- Renamed display labels to 화성의 위성 포보스 and 소행성 베스타; preserved their IDs, measurements, explanations and graphics. Added Mercury, Venus, Mars, Saturn and Uranus so all eight planets are present among 27 size-sorted objects.
- Verified NASA volumetric mean radii and converted every new planet to body diameter. Size order is Mercury, Mars, Venus, Earth, Neptune, Uranus, Saturn, Jupiter. Giant-planet measurements use the 1 bar reference level; Saturn rings are excluded from its stated body diameter.
- Viewed NASA reference images for all five new subjects (5/5 loaded) and drew original SVGs. Added source-backed C/B/A ring radii, front/back occlusion and a Cassini division for Saturn. Kept the 100-unit mean body diameter and shared physical camera scale; ring overflow is allowed inside the scene but clipped at the outer viewport. Circular clipping also keeps planet cloud/terrain motifs inside their discs.
- Final check: 0 errors / 0 warnings; ESLint and Prettier passed; 22 unit tests passed; adapter-static build passed; 38 Playwright tests passed in 2.0 minutes with no failures, skips or flaky outcomes. Coverage includes all 27 rendered shrink ratios, eight-planet order, distinct Saturn body/ring geometry, new names, responsive fixed height, keyboard/history, accessibility and no-JS data. Source/illustration audit: 43 unique URLs returned HTTP 200 without challenges. Eight-planet/device display audit: 16 screens without horizontal overflow. Font subset: 118,184 bytes.
- Evidence: docs/SOLAR_SYSTEM_EXPANSION.md and artifacts/solar-system/ (NASA reference board, individual panels, desktop/mobile galleries, source/display audits and final Playwright JSON). No deployment, DNS change, remote push, new runtime dependency or new Lighthouse claim.

## Sun endpoint — 2026-10-19 (KST), v0.1.7

- The owner requested that the right edge finish at the prominent Sun position. This accepted decision supersedes the master's original 10¹⁰ m upper bound; the master source remains preserved. Both explorer variants now end at the existing source-backed Sun diameter, 1,391,400,000 m (log₁₀ ≈ 9.14345).
- Unified the ruler and slider bounds with the scientific measurement. Preserved equally spaced logarithmic decades and added the true fractional endpoint, labeled 1.39 × 10⁹ m. The Sun reaches the existing 92px reference size at the center; no additional zoom-out tail follows it.
- A continuous native slider and explicit keyboard increments make the fractional endpoint exactly reachable with pointer, End and object selection. Exact endpoint URLs survive reload without rounding the Sun exponent. Updated method text and actual local updates; font subset is 119,648 bytes.
- Final check: 0 errors / 0 warnings; ESLint and Prettier passed; 22 unit tests passed; static build passed; 40 Playwright tests passed in 129.7 seconds with no failures, skips or flaky outcomes. New endpoint tests cover pointer, keyboard, shared URLs, exact 92px Sun size, aligned ruler cursor, equal decade spacing and overflow in home/full variants on both devices. Existing scientific, height, links and accessibility checks passed. Evidence: docs/SUN_ENDPOINT.md and artifacts/sun-endpoint/. No deployment or DNS changes.

## Consistent decade labels — 2026-10-19 (KST)

- Follow-up owner feedback removed the special 1.39 × 10⁹ m endpoint label and tick. Visible ruler labels now use powers of ten throughout; the last label is 10⁹ m at its true logarithmic position. The slider still ends at the Sun's exact source-backed exponent, preserving its central 92px size. Precise scientific values remain in the object readout.
- Updated method and existing local v0.1.7 update copy, README and endpoint report. No science-data, logarithmic-coordinate, camera-scale or dependency changes. Font subset: 118,960 bytes.
- Verification: check 0 errors / 0 warnings, lint, 22 unit tests and static build passed. The full Playwright run passed the existing 38 checks; two new regression expectations needed whitespace/CSSOM precision corrections, then both passed in a focused 15.4-second run. Do not claim a single clean 40-test run for this follow-up. Both-device home/full captures, initial and final focused JSON evidence: artifacts/decade-ruler/. Inspected desktop/mobile home captures and confirmed localhost:5173 serves the new labels. No deployment or DNS changes.

## Larger shared-scale scene — 2026-10-19 (KST), v0.1.8

- Owner requested more space for the primary SVG comparison. Increased the previous 125px viewport to 276px on wide screens and 216px at 390px mobile. The common reference measurement is now min(180px, canvas width / 2.6), giving 180px/120px reference sizes in those examples while fitting Saturn's rings. All objects and the physical scale bar use the same viewport-dependent reference; SI values, logarithmic positions, sources and the Sun endpoint remain unchanged.
- Added generous vertical framing, wider catalogue spacing and responsive physical field-of-view calculations. Container-unit CSS shares the camera constants and reserves the right height before JavaScript runs, preventing a new initial-height shift on narrow screens. Existing catalogue label/description sizing reserves remain in place. Updated capture helpers, real local updates, version and font subset (119,496 bytes); no new runtime dependency.
- Final check: 0 errors / 0 warnings; ESLint and Prettier passed; 23 unit tests passed; static build passed; the final full Playwright run passed all 40 tests in 116.2 seconds, with no failures, skips or flaky outcomes. Tests cover all 27 actual SVG shrink ratios, responsive fixed height, clipped-frame margins, Saturn ring fit, Sun endpoint/pointer/keyboard/history, no-JS initial canvas heights on both devices, 200% text, internal links and accessibility. The pointer test now scrolls the longer full panel's slider into view before coordinate clicks.
- Inspected actual desktop/mobile and 649px captures plus the 1280×800 first view; the primary CTA remains in view on the laptop. Evidence: docs/LARGER_SCALE_SCENE.md; artifacts/larger-scene/ (18 final PNGs and the full Playwright JSON). Confirmed localhost:5173 serves the change. No deployment, DNS change, remote push or new Lighthouse claim.

## Object-paced autoplay and concrete entry points — 2026-10-19 (KST), v0.1.9

- Applied the owner's three browser comments: removed the keyboard-hint text while preserving native keyboard controls; added a left-aligned triangle play/pause button; removed the repetitive logarithm primer and made the existing discovery section concrete DNA/ball/Earth question links with original SVGs, typed measurement bases, sizes and approximation labels. This direct owner request supersedes the master's old primer composition and the prior workflow's default avoidance of automatic motion. Playback remains user initiated.
- The tour moves continuously from the left edge through all 27 exact source exponents, holds every subject for 1.5 seconds, and ends at the Sun without looping. It supports pause/resume, cancels for manual pointer/keyboard/object controls and navigation, cleans up frames on unmount, and pauses when hidden or motion preference changes. Reduced motion uses held object steps. Paused/finished full-explorer state replaces the URL; frames do not trigger routing or history entries. Scientific data, source URLs and common SVG/logarithmic geometry are unchanged.
- Final check: 0 errors / 0 warnings; ESLint and Prettier passed; 27 unit tests passed; static build passed; all 44 Playwright checks passed in 157.0 seconds, with no failures, skips or flaky outcomes. Coverage includes both players, timing/holds, pause/resume, pointer and keyboard interruption, end/restart, navigation cleanup, history, reduced motion, hidden-event simulation, concrete links, existing physical ratios/height stability/200% text/internal links/accessibility/no-JS content. Font subset: 120,988 bytes.
- Additional real-clock Playwright smoke via Node at 1014×892 verified five stages from start through the atom hold to DNA arrival, then pause, without browser runtime errors or horizontal overflow. It samples the opening part, not a full real-time tour or FPS benchmark. Inspected actual desktop/mobile and live captures. Evidence: docs/AUTOPLAY_AND_ENTRY_POINTS.md; artifacts/autoplay/ (11 PNGs, final full Playwright JSON and live timing JSON). localhost:5173 serves the changes. No deployment, DNS change, remote push, new runtime dependency or new Lighthouse claim.


## Owner-provided orbital header logo — 2026-10-19 (KST)

- Applied the owner's attached transparent orbital A2O PNG to the header, superseding the master's typographic header mark for this location. The raster is copied unchanged; a tightly framed SVG viewport excludes blank margins without altering artwork or proportions. Width is 112px on desktop and 92px on mobile, with the existing ATOM TO ORBIT text/divider centered beside it and a minimum 44px home-link target. Footer, navigation and scientific geometry are unchanged.
- Check: 0 errors / 0 warnings; ESLint/Prettier passed; 27 unit tests passed; static build passed; all 46 desktop/mobile Playwright tests passed. Verified original/static/built asset hashes match. Inspected actual 1440/1014 desktop and 390/320 mobile captures, with no clipped ring, navigation overlap or overflow. The new test also verifies image decoding and keyboard home navigation. Evidence: docs/ORBITAL_LOGO.md; artifacts/orbital-logo/ (12 PNGs and full report). Confirmed localhost:5173 serves the new mark. No deployment, DNS changes, remote push, dependencies or new performance claims.

## Remove public methodology and update pages — 2026-10-19 (KST)

- Applied the owner's four browser comments: removed Methods and Sources from desktop/mobile navigation and footer; removed the entire homepage methodology teaser and its styles; deleted the /method/ and /updates/ page sources, without replacement pages or redirects. Cleaned the remaining links and obsolete wording in /about/ and /scale/, and removed both paths from the generated sitemap, audit script and current README page list. This explicit request supersedes the master's public methodology/changelog architecture. AGENTS now records that changes belong in this internal progress file, not a recreated public changelog.
- Retained typed SI measurements, measurement bases, derivations and per-object/article citations. The source/reference data is intact. Rebuilt the existing licensed font subset for remaining source text: 105,788 bytes. The first default-permission font command could not read the local fontTools folder; the authorized escalated retry succeeded. Final static build contains neither removed page nor their old links/teaser.
- Validation: Svelte check 0 errors / 0 warnings, ESLint/Prettier passed, 27 unit tests passed, final static build passed. Full desktop/mobile Playwright run: 46 passed in 135.5 seconds, no failures, skips or flaky outcomes. Tests now verify both removed routes return 404, neither is listed in the sitemap or linked from current pages, and mobile navigation reaches About. Existing source links, scientific geometry, autoplay, no-JS content, 200% text and accessibility checks passed.
- Added a layout assertion that the final story section meets the footer without an empty intermediary region; both responsive tests passed again after allowing two paint frames following scroll, giving accurate bottom captures (the first immediate capture showed unpainted content). Inspected final desktop/mobile home-bottom screenshots and the full desktop home. Evidence: artifacts/simplified-pages/ (6 PNGs, full 46-test report and targeted 2-test responsive report). No deployment, DNS change, remote push, dependency addition or new performance benchmark claim.

## Continuous playback under reduced-motion preference — 2026-10-19 (KST)

- Reproduced the owner's object-by-object jumping in the actual 625px in-app browser: prefers-reduced-motion was true and the existing reduced branch set travel time to zero. Replaced zero-duration steps with continuous user-triggered travel at 1.5 times the normal duration. Every exact scientific stop still holds 1.5 seconds; no automatic start/loop was introduced. Pause, manual controls, hidden-tab pause and preference-change pause remain. OS/browser settings, source measurements and physical SVG/logarithmic geometry were not changed. This explicit owner request supersedes the earlier reduced-motion held-step decision.
- Check: 0 errors / 0 warnings; ESLint/Prettier passed; 28 unit tests passed; static build passed; all 48 Playwright tests passed in 162.0 seconds, with no failures, skips or flaky outcomes. New tests sample every model transition at 16ms and verify six intermediate slider/ruler/SVG sizes on /scale/?object=ecoli with reduced motion, including physical shrink ratios and the exact DNA hold. Existing full-tour/control/navigation/source/accessibility/responsive checks passed.
- Also observed intermediate positions and pause in the actual user's browser with reduced motion still true. The real-time Node/Playwright capture script passed at desktop 1440px, the reported 625px, and mobile 390px; sampled 10/17/19 moving frames in 300ms windows, verified DNA arrival/hold and pause, and recorded three videos plus nine actual-time PNGs. The first capture attempt incorrectly read a culled microscopic body before starting from Earth; reading it after play fixed the capture. These opening-sequence functional samples are not a full-tour real-time/FPS benchmark.
- Evidence: docs/CONTINUOUS_PLAYBACK.md and artifacts/continuous-playback/ (48-test report, real-time JSON, 3 videos and 11 PNGs). Updated the original autoplay workflow's current behavior description and marked its older verification as historical. No deployment, DNS changes, remote push, dependency addition or new performance claims.

## Playback control over the drawing — 2026-10-19 (KST)

- Moved the existing play/pause button from its row below the slider to the lower-right of the SVG drawing on both homepage and full explorer, matching the owner's arrow. ScaleScene accepts an optional controls snippet outside the SVG image semantics; its positioned control stays at the object baseline, above the scale bar, unit label and field-of-view caption. Removed the obsolete row and its styles. The button has a restrained solid-teal background/border and retains a minimum 44px target, accessible name, range association, focus, Enter and Escape handling.
- Playback timing, continuous interpolation, exact source sizes, object holds, pause/resume, reduced-motion speed and manual interruption logic were not edited. The SVG viewBox, reference size and common physical geometry are unchanged; the new viewport wrapper preserves the existing CSS-reserved canvas height.
- Validation: check 0 errors / 0 warnings, ESLint/Prettier passed, 28 unit tests passed, static build passed. All 50 Playwright tests passed in 163.2 seconds with no failures, skips or flaky outcomes. The two added responsive overlay tests check home/full pages at widths 1440/979/625/390/320, button containment and lower-right position, 44px target, measurement/caption clearance, no overflow and Enter/Escape control. Existing continuous playback, source links, fixed heights, no-JS, 200% text and automated accessibility checks also passed.
- Inspected the actual 979px homepage capture, 1440px full-explorer capture and 390px homepage capture. Evidence: artifacts/playback-overlay/ (8 PNGs and the full 50-test JSON). Updated the original autoplay workflow's current placement description. localhost:5173 returned 200 with the scene control and without the old row. No deployment, DNS change, remote push, new dependency or new performance benchmark claim.

## Transparent playback control with preserved hit area — 2026-10-19 (KST)

- Applied the owner's follow-up: the drawing overlay now displays only the triangle/pause icon and text. Background and the existing 1px border are transparent, corner rounding is removed. Keeping the border width, padding, font and minimum 44px height preserves the previous hit area and exact placement. Native button semantics, keyboard focus and all playback behavior remain.
- Check: 0 errors / 0 warnings; ESLint/Prettier passed; 28 unit tests passed; final static build passed. The initial concurrent check/build raced while updating generated SvelteKit types (ENOENT); running the build alone after the other commands completed passed. Run check and build sequentially to avoid that shared-output race.
- Targeted Playwright overlay checks: 2 passed in 17.2 seconds on desktop/mobile, covering both home/full explorers and widths 1440/979/625/390/320. Added clicks at (2,2) inside the invisible padding to verify the full control still starts and pauses playback; Enter/Escape, containment and 44px target checks remain. This was a targeted rerun for the visual-only change, not a new full 50-test run.
- Inspected actual 979px and 390px homepage captures. Evidence: artifacts/playback-overlay-transparent/ (8 PNGs and targeted report). Original placement evidence remains in its prior folder. No deployment, DNS changes, dependencies or playback/science logic changes.

## Playback at the upper left, aligned to SCALE — 2026-10-19 (KST)

- Moved the transparent playback control to the drawing's upper-left corner on home/full explorers. Offset the unchanged invisible padding so the triangle's actual left edge aligns with the S in SCALE EXPLORER. The original hit-area width/height, icon, text, transparent appearance and playback behavior remain. A tighter focus-outline offset keeps the keyboard ring inside the panel at 320px while the invisible padding extends into the panel gutter.
- Validation: check 0 errors / 0 warnings, ESLint/Prettier passed, 28 unit tests passed, static build passed. Targeted desktop/mobile Playwright overlay tests both passed in 22.4 seconds, covering home/full pages at widths 1440/979/625/390/320. Tests compare the triangle's visual edge with the heading, verify upper-left placement, 44px targets, caption/scale-bar clearance, no overflow, Enter/Escape and clicks on invisible padding. This targeted layout rerun is not a new full 50-test run.
- Inspected actual 979px and 390px homepage captures. Updated the original autoplay workflow's current placement. Evidence: artifacts/playback-overlay-left/ (8 PNGs and targeted JSON). No deployment, DNS changes, dependencies or playback/scientific logic changes.

## Optical playback alignment correction — 2026-10-19 (KST)

- Applied the owner's visual correction: shifted the transparent triangle/text control together 2px right relative to the previous SCALE alignment (left inset -14px to -12px). Hit-area dimensions, padding, transparency, vertical placement and playback behavior are unchanged.
- Validation: check 0 errors / 0 warnings, ESLint/Prettier passed, 28 unit tests passed, static build passed; targeted desktop/mobile Playwright overlay checks: 2 passed in 20.3 seconds, including the +2px optical offset, all existing responsive target/padding-click/keyboard assertions. No new full-suite run was required for this position-only change. Inspected the actual 979px home capture. Evidence: artifacts/playback-optical-alignment/ (8 PNGs and targeted JSON). No deployment, DNS or scientific/playback logic changes.

## Larger playback over an upward-extended SVG canvas — 2026-10-19 (KST)

- Applied the owner's request to enlarge playback and their clarification that the SVG itself must extend upward. Removed the interim separate control row. The real SVG viewBox/CSS height gains 64px of headroom and its object baseline shifts by the same amount; actual SI-based pixel sizes, widths, camera scale and source data are unchanged. Large objects can render behind the overlaid control in that exposed canvas area. The control remains absolute inside the SVG viewport at top 8px, with the prior +2px optical left alignment.
- Enlarged type from 13px to 17px/650, triangle from 9x10px to 12x14px and hit height from 44px to 48px. Foreground is lighter with a small text/icon shadow for artwork behind it; background and border remain transparent. Pause icon grows correspondingly. Playback timing, controls and physical ratios are unchanged. SSR CSS reserves 340px desktop / 280px configured mobile SVG height, without a separate spacer.
- Check: 0 errors / 0 warnings; ESLint/Prettier passed; 28 unit tests passed; static build passed. Full Playwright run: 48 passed, 2 Sun tests failed only because their height expectations still used 276/216px. Updated the expected extended heights/top margins; targeted Sun rerun passed both desktop/mobile cases in 17.7 seconds. All 50 application cases were validated across those runs; do not describe this as a new single full 50-pass run. Includes all 27 physical shrink ratios, fixed heights, continuous playback, sources, accessibility, no-JS height, 200% text and laptop CTA fit.
- The overlay test now checks the SVG starts at the viewport wrapper's top and contains the control, larger type/icon/target, optical alignment, padding clicks and keyboard behavior. Added 594px cases and enlarged incoming-battery captures showing artwork behind the control. Inspected 979px Earth, 594px battery and 390px Earth captures. Evidence: docs/EXTENDED_SVG_PLAYBACK.md; artifacts/extended-svg-playback/ (12 PNGs, initial full report and successful Sun rerun report). Updated the original autoplay workflow's current layout. No deployment, DNS change, remote push, dependency addition or new performance benchmark claim.

## Footer back-to-top and typography alignment — 2026-10-19 (KST)

- Replaced only the footer's About link with a 48px outlined upward-arrow link to #page-top. Header navigation and the About page remain. The shared header has that ID and tabindex=-1 so native fragment navigation scrolls to the top and moves keyboard focus there, including without JavaScript. No script-driven scrolling or animation was added.
- Changed the footer top row to a three-column grid with centered vertical alignment. Mission copy is 16px/500/1.7 on desktop and a responsive 14-16px on mobile. The brand line has explicit compact leading and cleaner metadata spacing. Mobile uses the brand above a mission/arrow row; 320px remains readable without overflow. The original editorial palette and content are retained.
- Validation: check 0 errors / 0 warnings; ESLint/Prettier passed; 28 unit tests passed; static build passed. Rebuilt the existing licensed font subset for the accessibility label: 105,824 bytes. Targeted Playwright: all 12 tests passed in 58.3 seconds with no failures, skips or flaky outcomes. New footer tests cover home/explorer/article at widths 1440/976/768/390/320, mouse and Enter, repeated top navigation, focus to header then Tab to home, 44px-or-larger target, mission/arrow vertical alignment, no overflow and no-JS action. Existing internal links/fragment targets, navigation focus, responsive screenshots, 200% text and automated accessibility checks also passed. This is a targeted 12-test run, not a new full-suite run.
- Inspected actual 976px and 320px footer captures. Evidence: artifacts/footer-top/ (4 PNGs and targeted JSON). No deployment, DNS changes, remote push, dependency addition or scientific/playback logic changes.

## Conditional floating back-to-top — 2026-10-19 (KST)

- Applied the owner's request to keep the upward arrow fixed at the viewport's lower-right corner after scrolling. It appears after 75% of viewport height, bounded to 320-640px, and hides again above that threshold. The 48px circle sits 20px from the bottom/right with safe-area protection, a solid midnight-teal background and subtle shadow for contrast over both paper and footer.
- Removed its reserved footer grid column; desktop retains two centered columns and mobile stacks the existing brand and mission copy. Native #page-top navigation, header focus and next-Tab behavior remain. Hidden controls leave keyboard/accessibility navigation; Svelte window bindings clean up with the component and follow restored scroll, resizing and client navigation. Without JavaScript the same link remains in the normal footer flow.
- Validation: type check 0 errors / 0 warnings, ESLint/Prettier passed, 28 unit tests passed, static build passed. Targeted Playwright: 14 passed in 1.1 minutes, including new conditional visibility/fixed position/restored scroll checks, home/explorer/article widths 1440/976/768/390/320, click/Enter/focus and no-JS fallback, plus internal links/fragment targets, navigation, responsive layouts, automated accessibility and 200% text. This is a targeted run, not a new full-suite run.
- Inspected actual 1440px content, 390px content and 320px footer screenshots. Evidence: artifacts/floating-top/ (6 PNGs and playwright-results.json). No deployment, DNS changes, dependencies or scientific/playback logic changes.

## Footer-bound floating arrow — 2026-10-19 (KST)

- Applied the owner's lower-limit correction: the floating arrow keeps its usual 20px viewport inset through the content, then stops with its bottom aligned to the footer mission paragraph. It stays above the separator/copyright area and follows the footer while docked. Scrolling back upward restores its viewport position. Visibility threshold, native top link, focus behavior, 48px target and safe-area protection remain.
- Measure the paragraph's document position with ResizeObserver on the paragraph and body, then derive the viewport bottom inset from existing scroll/viewport bindings. This avoids reading layout on every scroll and updates for page content, font/viewport size changes. Disconnect the observer on teardown. Reserve 64px beside mission copy to avoid overlap at narrow widths or enlarged text; no-JS native footer fallback remains.
- Validation: type check 0 errors / 0 warnings; ESLint/Prettier passed; 28 unit tests passed; static build passed. Targeted Playwright: 16 passed in 1.2 minutes, covering normal fixed position, footer limit and 40px reverse scrolling, native click/Enter/focus, restored scroll, client navigation, no-JS fallback, widths 1440/976/768/630/390/360/320, viewport changes with 32px mission text and glyph-level overlap checks, plus links, responsive layouts, accessibility and 200% text. This is a targeted run, not a new full-suite run.
- Inspected actual 630px, 360px and 320px footer captures. Evidence: artifacts/footer-stop/ (8 PNGs and playwright-results.json). No deployment, DNS changes, dependencies or scientific/playback logic changes.

## Reachable back-to-top threshold on short pages — 2026-10-19 (KST)

- Fixed the missing arrow on short pages such as /articles/?topic=micro: the previous 320-640px threshold could exceed the entire scrollable distance. Cap that existing reveal threshold at half the actual scroll range. The arrow remains hidden at the top, appears while scrolling short pages and keeps the same footer-paragraph lower limit. Pages with no overflow remain at the top and hide the control.
- Track document height with the existing ResizeObserver and remeasure on window resize, including height-only changes. Filter changes, content reflow and restored scroll update the range without adding a per-scroll layout read. Native top navigation, header focus, no-JS fallback and scientific/playback logic remain.
- Validation: final type check 0 errors / 0 warnings; ESLint/Prettier passed; 28 unit tests passed; static build passed. Targeted desktop/mobile Playwright: 18 passed in 1.3 minutes. The added regression reproduces the real 775px filtered route whose scroll range is below the old 640px threshold, checks hidden near the top and visible before the bottom, correct docking/click/focus, 976/390px captures, client-side filtering and height-only resizing through a no-overflow viewport and back. Existing fixed/docked behavior, links, responsive layouts, navigation, accessibility and 200% text checks also passed. This is a targeted run, not a new full-suite run.
- Inspected actual 775px and 390px filtered-page captures. Evidence: artifacts/short-page-top/ (3 PNGs and playwright-results.json). No deployment, DNS changes or dependencies.

## Date-only article metadata — 2026-10-19 (KST)

- Applied the owner's marked correction: removed A2O 편집, 로컬 초판 작성 and adjacent separators from the article header, leaving the original date in its semantic time element. Shared article cards on the homepage and article listing also display only the date. Article dates, measurements, citations and the separate source/change-note content remain unchanged.
- Validation: type check 0 errors / 0 warnings; ESLint/Prettier passed; 28 unit tests passed; static build passed. Existing targeted Playwright article/filter/source/explorer, responsive screenshot and automated accessibility checks passed on desktop/mobile: 6 passed in 42.3 seconds. No new tests were added for this small text-only edit, and no full-suite claim is made.
- Inspected actual desktop/mobile article screenshots. Evidence: artifacts/date-only/ (6 PNGs and playwright-results.json). No deployment, DNS changes or dependencies.

## Remove public article writing dates — 2026-10-19 (KST)

- Applied the owner's follow-up: remove the article header date/byline wrapper and dates from shared homepage/list cards. Remove the separate public local-draft writing-date note beneath the sources as well. Keep internal article date metadata and scientific source access dates. Removed unused date styling and moved the header separator to the header itself, eliminating the empty metadata row and its padding.
- Validation: type check 0 errors / 0 warnings; ESLint/Prettier passed; 28 unit tests passed; static build passed. Existing targeted Playwright article/filter/source/explorer, responsive screenshots, automated accessibility and short-page top-arrow checks passed on desktop/mobile: 8 passed in 46.0 seconds. Extended the existing article smoke test with atomic-header captures; no new test cases were added for this small presentation change and no full-suite claim is made.
- Inspected actual desktop/mobile atomic article header captures. Evidence: artifacts/no-article-dates/ (2 atomic header captures, 6 full-page article/list/home PNGs and playwright-results.json). No deployment, DNS changes or dependencies.

## Remove About navigation and page — 2026-10-19 (KST)

- Applied the owner's request: remove A2O 소개 from the shared desktop/mobile navigation and delete the /about/ page. Remove its sitemap entry and preview-audit route; update README's current routes and AGENTS.md to preserve the owner's removal decision. Remaining header destinations are scale exploration and science stories. Historical master/reference documents and earlier evidence remain as historical records.
- Update existing navigation/brand checks to use the live article listing, remove About from representative page inventories and assert no About links, no sitemap entry and a 404 response for /about/. Keep the existing mobile menu close/focus checks and verify its two remaining links.
- Validation: type check 0 errors / 0 warnings; ESLint/Prettier passed; 28 unit tests passed; static build passed. Targeted desktop/mobile Playwright: 12 passed in 55.4 seconds, covering logo/home navigation, internal links, removed-route 404, sitemap, mobile menu/focus, responsive layouts, automated accessibility and 200% text. This is a targeted run, not a new full-suite run.
- Inspected actual desktop/mobile header captures. Evidence: artifacts/no-about/ (4 PNGs and playwright-results.json). No deployment, DNS changes or dependencies.

## Compact mobile full-explorer spacing — 2026-10-19 (KST)

- Applied the owner's two marked mobile spacing reductions at widths up to 767px, scoped to the full explorer. Reduce the top readout margin to 12px, description separator padding to 12px and the gap before the ruler to 16px. Remove hidden catalogue readout/context reservations from mobile layout so selected names and descriptions use their actual height. Keep all selected text visible. Explicitly stack name and measurement in one left-aligned column so short names do not cause object-dependent side-by-side wrapping. The mobile full panel now follows selected content length; compact homepage reservations and desktop layout remain.
- SVG canvas dimensions/headroom, physical size ratios, playback overlay/hit targets, scientific values and sources are unchanged. Extended the existing responsive screenshot test with Vesta, Mars and football at 360/390px; no new test cases were added for this CSS change.
- Validation: final type check 0 errors / 0 warnings; ESLint/Prettier passed; 28 unit tests passed; final static build passed. Final targeted Playwright: 12 passed in 1.2 minutes, covering playback overlay/padding clicks/keyboard, physical shrink ratios, all-object homepage height stability, responsive layouts, accessibility and 200% text. Initial spacing pass also passed 10 tests before the explicit single-column refinement; its report is retained separately. Neither run is a full-suite claim.
- Inspected initial 360px Vesta/Mars captures and final 360px Mars/390px football captures. Evidence: artifacts/mobile-explorer-spacing/ (6 final PNGs, initial-results.json and final playwright-results.json). No deployment, DNS changes or dependencies.

## Refine football illustration from a public-domain SVG — 2026-10-19 (KST)

- Replaced the irregular hand-drawn football patchwork with FootballGlyph.svelte, adapting flomar's CC0 Football (soccer ball).svg after inspecting its original browser-rendered image. Preserve curved leather-panel contours and three seam paths; recolor with A2O paper/teal tones and gentle radial shading. Remove the reference's ground shadow, strong highlights and duplicate seam accents. Clip all artwork to a true 100-unit circle so edge panels cannot protrude; use per-instance Svelte IDs for the clip/gradients. Scientific values, circumference-to-diameter conversion, normalized measurement and scene/playback logic are unchanged.
- Store the unmodified source in docs/reference-assets/football-flomar-cc0.svg, exclude reference snapshots from formatting, update the football reference manifest and document creator, source URL, CC0 license, source SHA-256 and adaptation in docs/FOOTBALL_SVG.md. The application renders local SVG paths with no remote image dependency.
- Validation: final type check 0 errors / 0 warnings; ESLint/Prettier passed; 28 unit tests passed; static build passed. Initial targeted Playwright run: 10 existing cases passed, while the 2 new football cases passed roundness/coverage but failed their shrink assertion because the test overlooked existing two-decimal URL cursor rounding. Corrected the test to compare two representable cursor positions and allow subpixel DOM rounding; focused desktop/mobile rerun: 2 passed in 20.0 seconds. All 12 selected cases were validated across those runs, not a new single full-suite pass. Existing checks cover physical ratios, homepage height stability, responsive captures, accessibility and 200% text.
- New pixel regression checks verify no painted pixels beyond the circular boundary and no interior holes, plus exact tenfold data-length shrink and square rendered dimensions. Inspected reference, desktop native/detail and mobile detail captures. Evidence: artifacts/football-refinement/ (reference, native-size/detail and full mobile-panel PNGs, initial-results.json and football-results.json). The 400px detail artboards show the glyph alone; they do not alter the scientific scene scale. No deployment, DNS changes or dependencies.

- Final capture refinement: use a complete standards-mode HTML artboard with fixed dimensions, wait for its mobile viewport and two paint frames, and check that the SVG is fully in view before capturing the enlarged detail. This corrects an empty mobile detail export; native-size mobile and live panel captures were already correct. The capture-only focused rerun passed both cases in 14.5 seconds. The final football-results.json and detail PNGs reflect this last run.

## Review all object SVG shapes against visual references — 2026-10-19 (KST)

- Audited all 27 glyphs individually using images extracted from the real explorer. Refined 20: DNA, H1N1, red blood cell, hair, pencil lead, AA battery, 100-won coin, table-tennis table, blue whale, ISS, Lotte World Tower, Phobos, Vesta, Moon, Mercury, Mars, Venus, Earth, Neptune and Jupiter. Retained the adequate atom, E. coli, table-tennis ball, CC0 football, Uranus, Saturn and Sun artwork.
- Inspected 23 downloaded reference images in four large boards, including CDC/JEOL microscopy, NOAA whale artwork, NASA planetary/station images, product/building photos and the OpenClipart CC0 table study. New paths are original local vector studies; reference photos are not embedded in the application. Earth uses a public-domain Natural Earth coastline projected orthographically, preserving the original GeoJSON and its SHA-256. D3 7.9.0 is used only by the generation script; no runtime dependency was added.
- Split the glyph artwork into focused local components, with per-instance clip/gradient IDs. Improved continuous silhouettes, cylinders/end caps, biconcave red-cell shading, cuticle texture, table net/support structure, whale proportions and fins, station truss/modules, tower crown, irregular small-body contours, lunar maria and planetary bands/Great Red Spot. Scientific measurements, normalization axes, SI conversions, scale/camera and playback behavior are unchanged. The illustrations remain simplified studies, not precise molecular, engineering or topographic models.
- Validation: type check 0 errors / 0 warnings; ESLint/Prettier passed; 28 unit tests passed; static build passed. Full Playwright suite: 64 passed in 3.7 minutes across desktop and mobile. New checks cover all 27 subjects' hydration and paint references, seven complete circular silhouettes and real Earth land/ocean checkpoints. Existing checks cover physical tenfold shrink, all catalogue sizes, Saturn rings, Sun endpoint, autoplay, stable home layout, routing, no-JS, WCAG and 200% text.
- Visually inspected all five final glyph boards, the three-subject before/after board, and actual mobile whale/table/Earth explorer captures. Evidence and per-object decisions: docs/SVG_SHAPE_REVIEW.md and artifacts/glyph-review/ (before/, after/, references/, before-after.png, desktop/mobile panels and final playwright-results.json). No deployment or DNS changes.

## Rework pencil lead, table undercarriage and solar surface — 2026-10-19 (KST)

- Replaced the three subjects with LeadGlyph.svelte, TableGlyph.svelte and SunGlyph.svelte. Lead now has a solid matte graphite cut face, a narrower end ellipse and subtle longitudinal grain, removing the hollow tube appearance. The table uses one affine projection for its top, net, four inset vertical legs, lower rails and feet; remove dangling diagonals and separate front/back drawing order. The Sun has HMI-inspired warm colour treatment, radial limb darkening, subdued surface texture and small sunspot groups, clipped to the same exact 100-unit disc.
- Inspected the existing Pentel lead photo, Butterfly's official Centrefold product photo and NASA SDO/HMI's solar-disc photo. Record direct image/page URLs in artifacts/lead-table-sun/references.json and updated docs/SVG_SHAPE_REVIEW.md. The new SVG paths are original studies; photos are not embedded. Solar texture is illustrative and not an exact granule-size or current sunspot map. Scientific measurements, guide axes, fragment dimensions, camera, autoplay and endpoint remain unchanged.
- Removed the superseded lead/table branches from EverydayGlyph.svelte, preserving battery/coin artwork. Added the Sun to the existing circular-boundary pixel regression check. Validation: check 0 errors / 0 warnings, lint passed, 28 unit tests passed, static build passed. Targeted Playwright suite: 16 passed in 1.7 minutes across desktop/mobile, covering all 27 subjects, eight refined circular silhouettes, tenfold shrink, home stability, autoplay and the Sun endpoint. This is a targeted run; the previous 64-case full-suite result is preserved separately.
- Inspected the equal-size before/after artboard and actual 390px lead/table/Sun explorer captures. Evidence: artifacts/lead-table-sun/ (comparison.png, six desktop/mobile panel PNGs, reference photos/manifest and playwright-results.json). No new dependencies, public deployment or DNS changes.

## Add a background-only solar glow — 2026-10-19 (KST)

- Added SunGlow.svelte with two static warm radial gradients around the Sun. Following the owner's refinement, the glow is a separate preceding sibling layer behind the measured body; both gradients are completely transparent inside the photosphere. Add a restrained inner rim to SunGlyph.svelte for a crisp boundary. No blur filter, flashing or animated effect. The decorative light is not a measured coronal extent; normalized diameter, source values, camera, playback and endpoint stay unchanged.
- The glow tracks the Sun's translation, scale and visibility opacity and has pointer-events disabled. The foreground remains an opaque local SVG with the existing surface detail and sunspots. All other body artwork is unchanged.
- Validation: check 0 errors / 0 warnings, lint passed, 28 unit tests passed, static build passed. Targeted desktop/mobile Playwright: 8 passed in 53.1 seconds, including all 27 subjects' SVG references, eight complete measured discs, Sun endpoints and the new glow test. Pixel inspection of the glow alone finds zero painted interior pixels and visible exterior light; also verify background DOM order, fixed measured width and Home/End keyboard controls.
- Inspected desktop and 390px scene captures. Evidence: artifacts/sun-glow/ (desktop/mobile scene and full-panel PNGs, playwright-results.json). Updated docs/SVG_SHAPE_REVIEW.md to record the requested decorative halo and exclude it from physical diameter. No deployment or DNS changes.

## Unify explorer naming and remove forced atom-title wrapping — 2026-10-19 (KST)

- Changed the shared header navigation label from 스케일 탐험 to 크기 탐험, covering desktop and the mobile menu. Routes and active-state behavior are unchanged.
- Removed the 230px title width cap only in the full explorer. Use a 23–27px fluid heading size on narrow full-explorer screens so the complete 원자 규모의 기준 길이 title fits one line at normal text size, without clipping, truncation or nowrap. The homepage compact title reservations remain unchanged; natural wrapping remains available for enlarged text.
- Verified single-line title height, no horizontal page overflow and both menu labels at 320, 360, 390, 768, 1024 and 1440px. Inspected 768px/320px atom panels and the open mobile menu. Evidence: artifacts/explorer-labels/ (six panel PNGs, mobile-menu.png and results.json).
- Validation: check 0 errors / 0 warnings, lint passed, 28 unit tests passed, static build passed. Existing targeted desktop/mobile browser tests: 6 passed in 31.0 seconds, covering homepage height stability across all objects, navigation/focus and 200% text enlargement. Saved the result to artifacts/explorer-labels/playwright-results.json. No deployment or DNS changes.

## Make the table-tennis ball matte off-white — 2026-10-19 (KST)

- Removed the high-contrast specular arc from the ball glyph. Replaced its cyan base with warm off-white #EDEDE6, using a broad low-contrast #F7F6EF / #EFEFE7 / #DDE0D8 diffuse gradient. No bright reflection point, reflective stripe or glow. Updated the shared base colour used for very large simplified surfaces as well. The 100-unit circle and 40mm measurement are unchanged.
- Followed the owner's clarification to use near-white rather than pure white. Inspected the actual 390px and 1440px explorer scenes; screenshots and full panels are in artifacts/matte-table-tennis-ball/. Updated the illustration review document's current count and follow-up note.
- Validation: check 0 errors / 0 warnings, lint passed, 28 unit tests passed, static build passed. Used an ad hoc browser capture for this reversible visual change; no new formal tests or full-suite run. No deployment or DNS changes.

## Shade the table-tennis ball toward the lower-right — 2026-10-19 (KST)

- Added a broad diffuse background-colour shading layer inside the existing 100-unit ball circle. Light comes from the upper-left; the #102832 tint starts transparent across the lit region and gradually reaches 34% at the opposite edge. Preserve the matte warm off-white base, without specular highlights or an external cast shadow. Measurements, scale, animation and other glyphs are unchanged.
- Inspected actual 390px and 1440px explorer scenes; the lower-right now reads as the shaded side of a sphere. Evidence: artifacts/table-tennis-shading/ (two scene and two full-panel PNGs). Updated docs/SVG_SHAPE_REVIEW.md with the requested lighting direction.
- Validation: check 0 errors / 0 warnings, lint passed, 28 unit tests passed and static build passed. Used ad hoc browser capture for the reversible appearance adjustment; no new formal tests or full-suite run. No deployment or DNS changes.

## Keep all homepage explorer names on one line — 2026-10-19 (KST)

- Removed the compact explorer's 185px title cap for every subject, covering both 원자 규모의 기준 길이 and 화성의 위성 포보스 on the mobile homepage. Keep the existing common font sizes and full catalogue reservations. No per-object exception, truncation or forced nowrap; enlarged text can reflow accessibly.
- Extended the existing homepage stability test to check that each of all 27 visible subject headings occupies exactly one line at normal text size, while retaining its panel height, top position and slider-position checks. Verified desktop widths 1440/1024/768/649/390/320 and mobile widths 390/320. Separate live captures confirm both long names at 320/360/390/649/768/1024/1440 with no horizontal overflow.
- Validation: final type check 0 errors / 0 warnings, lint passed, 28 unit tests passed during this turn, static build passed. Targeted desktop/mobile browser tests: 4 passed in 34.8 seconds, covering all-subject single-line titles/layout stability and 200% text enlargement. Inspected 320px/390px atom and 1024px Phobos panels. Evidence: artifacts/home-single-line/ (14 PNGs, measurements JSON and playwright-results.json). No deployment or DNS changes.







