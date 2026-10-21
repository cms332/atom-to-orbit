# A2O (Atom to Orbit) — Persistent Codex Repository Instructions

This repository builds the independent Korean science atlas `a2o.kr`.
**Primary governing specification:** `docs/A2O_MASTER_GUIDE.md` (also read `docs/A2O_DECISIONS_AND_PROGRESS.md` for accepted decisions and current progress) (read before any substantive design or implementation). Follow the owner's latest direct instruction if it overrides the specification; do not silently change the brand, premise, visual system or content policy.

## Identity
- Canonical name: `A2O — Atom to Orbit`.
- Mission: make scientific sizes, distances and physical scales understandable with trustworthy, source-linked visual explanations.
- Korean-first editorial science site, not an AI platform, fan site, store or generic space wallpaper site.
- Preferred design: **Editorial Observatory** (warm paper, dark ink, midnight-teal measuring instrument; precise and restrained).

## Engineering
- Svelte 5, SvelteKit 2, TypeScript, Vite, Bun, `adapter-static` (unless user authorizes a change).
- Prefer fast SSR/prerendered content, semantic HTML, minimal JS, accessible SVG; no backend or DB for MVP.
- Separate real scientific measurements into typed SI-meter source-backed objects. Label dimensions and approximations. Never mix diameter/distance silently.
- No fabricated science facts, article counts, quotes, sources, staff, logos, metrics, publication dates or fake user/operating history.
- Do not publish placeholder articles or dead nav links. Only real local functional pages.
- Respect Korean readability; avoid forced letter-spacing and perf-heavy animations.

## Workflow
1. Read `docs/A2O_MASTER_GUIDE.md` and inspect the actual repository; do not overwrite unrelated existing files.
2. Implement in coherent phases, check responsive fidelity and accessibility.
3. Validate with `bun run check`, `bun run lint`, `bun run test`, `bun run build` where configured; add Playwright smoke/visual tests when appropriate.
4. Show local previews and actual test/screenshot results and unresolved issues.
5. **Never deploy publicly or change DNS/domains without explicit owner approval.**
6. Keep commits truthful; do not forge past timestamps. Record actual changes in `docs/A2O_DECISIONS_AND_PROGRESS.md`. The owner removed the public `/method`, `/updates` and `/about` pages, their navigation entries and homepage method teaser on 2026-10-19; do not restore them without a new request. Keep source-backed measurements and per-object/article citations.

If in doubt, favor **correct and genuinely useful** over decorative and impressive-looking.

## Design skill workflow
- Apply the available `design-taste-frontend` (Taste Skill) to homepage/editorial visual refinements. Use `docs/A2O_TASTE_DESIGN_WORKFLOW.md` for the project-specific design read and review scope.
- Treat this as a preservation redesign: keep the master guide's brand, palette, Svelte stack, accurate science diagrams and accessible interactions. Generic skill defaults for React, photography, dark-mode changes or heavy motion do not override this specification.
- Scope Taste to editorial presentation; scientific data tables and logarithmic calculations follow the master guide and their tests.
