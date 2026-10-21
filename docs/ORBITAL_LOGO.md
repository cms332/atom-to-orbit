# Owner-provided orbital wordmark — 2026-10-19 (KST)

The owner requested replacing the header's typographic A2O mark with the attached `미니멀 블랙 A2O 오비탈 로고 (1).png`. This directly authorizes the header asset change relative to the master guide's typographic mark. The adjacent ATOM TO ORBIT text, editorial palette, navigation and footer remain as before. Applied Taste's preservation approach.

## Asset and framing

- Original transparent RGBA PNG: 1448 × 1086, 324,444 bytes; copied unchanged to `static/brand/a2o-orbital.png`.
- Source, static asset and built asset SHA-256: `E629C4FCCD5F61350D2A0AAA60314234E55ED0A52BFAE3B2291CB7F0D278305F`.
- Inspection of alpha values showed the meaningful artwork within approximately x126–1371 and y375–777. Very faint alpha=1 pixels extend further into the blank margins.
- The inline SVG is only a viewport for the original raster: viewBox `124 373 1250 406`. It removes visible blank margin through layout while preserving the original artwork, transparency and proportions. No generated replacement, raster modification, recoloring or dependency was introduced.
- Desktop width 112px, mobile width 92px, automatic proportional height; the existing divider and small text are centered beside it. The home link has a minimum 44px height and retains its accessible Korean home-link label and keyboard focus behavior. Explicit dimensions reserve space before the PNG loads.

## Visual evidence

Playwright captures in `artifacts/orbital-logo/` cover widths 320, 390, 768, 1014 and 1440px. Each has `WIDTH-header.png` and `WIDTH-home.png`. Desktop and mobile keyboard return-home captures are also included.

Manually inspected `1014-header.png`, `1440-home.png`, `320-header.png` and `390-home.png`: no stretched or clipped orbital ring, no overlap with navigation or mobile menu, balanced alignment with the adjacent text, and no horizontal overflow. Local dev preview: `http://127.0.0.1:5173/`.

## Validation

- `bun run check`: 0 errors, 0 warnings.
- `bun run lint`: ESLint and Prettier passed.
- `bun run test`: 27 unit tests passed.
- `bun run build`: static build passed; original asset hash preserved in build output.
- `bun run test:e2e`: all 46 desktop/mobile Playwright tests passed, including the two new logo layout/load/keyboard checks and existing accessibility, 200% text, no-JS content, internal links and explorer regression coverage. Full JSON: `artifacts/orbital-logo/playwright-results.json`.
- Live localhost:5173 returned HTTP 200 with the orbital logo in its server-rendered HTML.

No deployment, DNS change, remote push, dependency addition or new performance benchmark claim.
