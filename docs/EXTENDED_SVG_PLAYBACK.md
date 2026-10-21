# Extended SVG canvas and larger playback control — 2026-10-19 (KST)

The owner requested a more visible playback control and explicitly clarified that the SVG itself must extend upward, with the control overlaid inside it. The final implementation removes the interim separate control row.

## Geometry and presentation

- The rendered SVG and its viewBox gain 64px of actual top headroom when controls are supplied. Height is `referencePixels + SCENE_PADDING + SCENE_HEADROOM`; the object baseline gains the same 64px. Objects keep their source dimensions, horizontal positions, physical pixel ratios and reference size. Increasing canvas height does not stretch the drawing.
- The SVG starts at the viewport wrapper's top. Large incoming objects can paint behind the control in the newly exposed area. There is no HTML spacer or control row above the SVG.
- The control is absolutely positioned 8px inside the SVG's upper-left corner, retaining the owner's +2px optical alignment relative to SCALE. Font increases from 13px to 17px at weight 650, the triangle from 9×10px to 12×14px, and the minimum hit height from 44px to 48px. The pause bars grow with the triangle.
- Text uses the lighter foreground. A small foreground shadow helps it remain legible over object graphics. Border and background stay transparent, with a keyboard focus ring and invisible padding still clickable.
- CSS reserves the expanded SVG height before JavaScript runs: 340px on the configured desktop and 280px at the configured 390px mobile viewport. The same height is maintained while changing subjects. Without controls the reusable scene keeps its prior height.
- Scientific data, sources, zoom timing, object holds, play/pause and manual input logic are unchanged. No dependency or deployment was introduced.

## Evidence

Current captures are under `artifacts/extended-svg-playback/`. The 979px and 594px home captures show the larger control and expanded canvas. The 594px battery captures explicitly show object artwork painting behind the overlaid control, matching the owner's clarification. Those battery captures include the existing pointer-hover color feedback.

The layout test checks that the SVG begins at the viewport top and contains the control, along with the 64px headroom, larger type/icon/hit target, optical alignment, no overflow, keyboard operation and invisible-padding clicks. It also doubles the control text at 320px to verify that it stays within the canvas without horizontal overflow. Existing no-JavaScript height assertions now include the real SVG headroom.

## Validation

Type check: 0 errors / 0 warnings. ESLint/Prettier, 28 unit tests and the static build passed. The full 50-case Playwright run passed 48 cases; the two Sun tests still expected the previous 276/216px canvas heights. Updating those test expectations to the intentionally extended heights and top margins resolved them: both desktop/mobile Sun tests passed on the targeted rerun in 17.7 seconds, including pointer/keyboard endpoints, URL reload, physical Sun size and the 1280×800 CTA position. All application cases were validated across these runs; the original full-run report is retained as `initial-full-results.json`, and the successful targeted rerun is `sun-endpoint-results.json`.

The first 48 passing cases include both overlay tests, all 27 SVG size/shrink comparisons, constant panel height, continuous playback under both motion preferences, source/internal links, desktop/mobile screenshots, 200% text, automated accessibility and no-JavaScript rendering. Inspected 979px Earth, 594px battery and 390px Earth captures. No deployment, DNS changes, remote push or new performance benchmark claim.
