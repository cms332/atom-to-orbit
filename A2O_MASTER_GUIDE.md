# A2O — Atom to Orbit | Product & Visual Design Master Guide

- **Version:** 1.0 — 2026-10-19
- **Domain:** `a2o.kr`
- **Canonical brand:** `A2O` / `ATOM TO ORBIT`
- **Primary language:** Korean (`ko-KR`)
- **Document status:** Project's principal product, design and content specification. Change it only after the owner explicitly approves the change.
- **Work boundary of this iteration:** Build a fully functioning, visually polished *website* locally in Codex Desktop. Do not deploy to production or change DNS without owner approval. Detailed scientific article publishing and external operating evidence come in later iterations.

---

## 0. One-sentence product definition

> **A2O is an independent, source-backed, interactive science atlas that makes the sizes, distances and physical scales of the universe understandable through precise visual comparison and concise Korean explanations.**

Korean editorial positioning:

> **원자에서 궤도까지. 눈금으로 이해하는 세상의 크기.**

Signature headline:

> **모든 크기에는 이야기가 있다.**

Secondary line:

> **눈에 보이지 않는 원자부터 거대한 천체까지, 숫자와 시각적 비교로 이해하는 과학 아카이브.**

Principles: independently useful; scientifically scrupulous; beautiful without gimmicks; small and maintainable; transparent about sources and changes.

Not: an entertainment fan site, AI workflow platform, store, commercial landing page, astronomy image gallery, celebrity portal or content farm. Do not mention other brands or domain disputes in public-facing site copy.

## 1. Actual visitor and outcomes

Visitor: curious Korean adult/teen who asks 'How big is this?' and wants a trustworthy visual answer in 30–120 seconds, then can pursue a deeper article.

Site succeeds if:
1. Within 5 seconds visitor understands **what A2O is** and where to start.
2. Within 15 seconds they can explore one meaningful size comparison.
3. Every visual states **what is being measured, units, approximation and source**.
4. Reader can move from an interactive chart to an article, then to source information.
5. Mobile and keyboard experiences are not reduced to decorative screenshots.

## 2. Design decision: 'Editorial Observatory'

### 2.1 Reference synthesis (principles to learn, not appearances to copy)

| Reference | Takeaway | Do NOT reproduce |
| --- | --- | --- |
| Our World in Data, https://ourworldindata.org/ | Strong information hierarchy, topic browsing, trustworthy source-linked visualizations | Exact charts, colors, brand identity |
| The Pudding, https://pudding.cool/ | Explanatory story and interaction form one continuous experience | Distinctive essay layouts or artwork |
| The Size of Space, https://neal.fun/size-of-space/ | Exploration feels immediate; controls are intuitive, the size contrast is experiential | Black starfield, imagery, existing interaction/design |
| NASA Eyes, https://eyes.nasa.gov/ | Clear subjects and interactive exploration grounded in meaningful data | Large 3D engine, NASA marks, borrowed assets |

**Choose:** calm, high-quality science editorial design with instrument-grade measurement graphics.

Visual metaphor: a well-designed contemporary science journal meets a precision measuring instrument. 'Astronomy' lives in the editorial content, not in clichéd stars or galaxies. Contrast an airy paper-colored content surface with one dramatic midnight-teal interactive panel.

Adjectives: **precise / curious / calm / credible / spacious / tactile**.
Avoid: neon purple, AI-startup gradients, glowing astronauts, excessive blur/glassmorphism, generic SaaS dashboard grids, fake animated constellations, infinite parallax, photorealistic hero-planets, giant stock-image tiles, endless microcards.

### 2.2 Color tokens — authoritative base palette

```css
:root {
  --a2o-bg: #F7F8F4;           /* Warm paper background */
  --a2o-surface: #FFFFFF;
  --a2o-ink: #162A33;          /* Principal text */
  --a2o-muted: #586B74;        /* Descriptions and captions */
  --a2o-line: #D9E2E0;
  --a2o-teal: #286875;         /* Links & interactive focus */
  --a2o-soft-teal: #E8F0EF;
  --a2o-copper: #D6A16A;       /* Highlight strokes, NOT small text on white */
  --a2o-deep: #102832;         /* Observatory panel */
  --a2o-deep2: #183944;
  --a2o-grid: #385461;
  --a2o-on-deep: #F4F6F2;
  --a2o-on-deep-muted: #C2D2D5;
}
```

Color proportion: 70–75% paper and white; 15–20% near-navy; 5–10% teal/copper. Small text must pass WCAG AA contrast; copper is primarily for diagrams, legends and accent lines. Avoid making paragraphs copper-colored.

### 2.3 Fonts and numerical labels

- Korean editorial/UI: **SUIT Variable**, subset/self-hosted WOFF2 (SIL OFL; https://github.com/sun-typeface/SUIT).
- English uppercase titles / brand: **Space Grotesk**, or comparable licensed clean geometric font, with font fallback.
- Units, scale ticks, source references: **IBM Plex Mono** or system monospace, not everywhere.
- Fonts must have verified redistribution/web-embedding licenses and include notices where required. Prefer local loading, `font-display: swap`, measured transfer weight. If Space Grotesk/IBM Plex Mono cause noticeable delays, prioritize SUIT + system monospace.

Typography (desktop guideline, fluid/responsive):

| Element | Size / weight / leading | Rule |
| --- | --- | --- |
| Wordmark A2O | 26–32px / 700 / compact | Distinguish letter `O` from numeral 0 |
| Hero H1 | `clamp(3rem, 5.5vw, 5rem)` / 700 / 1.06–1.13 | Maximum 2–3 lines |
| Section H2 | `clamp(2rem, 3vw, 3rem)` / 700 / 1.2 | Editorial, not dashboard headers |
| Article H1 | 44–64px desktop, 34–42px mobile | Max text width |
| Body | 17–18px / 400 / 1.65–1.8 | Readable scientific explanation |
| Nav / button | 14–15px / 600 | Understated but clickable |
| Data numerals | 24–44px / 500–600 / tabular | Exponents and units are visually aligned |
| Overline / captions | 11–13px / 500 / 1.45 | Accessible contrast, Korean tracking normal |

**Korean letter-spacing normal/default**, unless tiny Latin uppercase metadata, for which 0.08–0.12em tracking is acceptable. Avoid unnaturally tight or widely letterspaced Korean.

### 2.4 Spatial system

- Layout max-width **1240px**, width min(100%-gutter, 1240px).
- Desktop outer gutters **48px**, tablet **32px**, mobile **20px**.
- 12-column desktop grid, 8px spacing rhythm; max editorial article body width **720px**.
- Sticky/normal header height 74–80px desktop, 64px mobile.
- Major section spacing desktop 100–128px, mobile 64–80px.
- Card radius 14–20px for instrument/tiles; editorial articles mostly squared and ruled, so the site does not look like a SaaS dashboard.
- One restrained 1px border system, not repeated heavy shadows.
- Button minimum 44px touch target, visible keyboard focus ring.

### 2.5 Motion

- On-load opacity/translation for page elements at most ~200–350ms; never hide core content while awaiting animation.
- Interactive charts follow direct user input, with smooth but short interpolation and no lag.
- Hover transitions 100–180ms; no scroll-jacking, auto-moving carousels, distracting persistent motion.
- `prefers-reduced-motion: reduce` must disable nonessential motion; all charts usable without animation.

## 3. Site architecture and navigation

Primary navigation: **스케일 탐험 / 과학 이야기 / 방법과 출처 / A2O 소개**.

```
/
/scale
/articles
/articles/[slug]
/method
/about
/updates
/sources       (optional alias or curated source index; method article can link here)
/404
/robots.txt
/sitemap.xml
```

Global chrome:

- Header left `A2O` typographic mark, second small line `ATOM TO ORBIT`; right four navigational entries; strongest CTA `스케일 탐험` is optional, do not overcrowd.
- Current section state visible (underline/marker) and keyboard accessible.
- Footer brand definition, one-sentence mission, content links, source policy, operating contact (an appropriate dedicated project email only if provided), factual year and update links. Do not invent staff/team names or addresses.
- Korean-first site; no nonfunctional EN language toggle. Later add English only if actual translation is provided.

## 4. Homepage — information architecture and composition

### Above the fold (desktop ~1440x900)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ A2O / ATOM TO ORBIT       스케일 탐험    과학 이야기    방법과 출처   소개 │
├──────────────────────────────────────────────────────────────────────────┤
│  INDEPENDENT SCIENCE ATLAS                      001 / SCALE EXPLORER     │
│                                                                          │
│  모든 크기에는           ┌────────────────────────────────────────────┐ │
│  이야기가 있다.          │ DARK INSTRUMENT PANEL                      │ │
│                          │                                            │ │
│  원자에서 궤도까지.      │       LOGARITHMIC SCALE GRID               │ │
│  숫자와 시각적 비교로    │         object geometry / markers          │ │
│  이해하는 세상의 규모.   │                                            │ │
│                          │  대상 [          ]   1.27 × 10⁷ m          │ │
│  [크기 탐험하기 ↗]      │  <---- LOG SCALE / SELECTION ---->          │ │
│  과학 이야기 읽기 →      │  source / metric / approximate label       │ │
│                          └────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

Hero:
- On the left, restrained uppercase small overline `INDEPENDENT SCIENCE ATLAS`, large Korean headline, 2-line supporting sentence and **one clear primary CTA**.
- On the right, original abstract measuring-instrument style scale sample (deep-teal panel). The visual is the differentiating brand asset, not a generic hero image.
- Panel starts with a real object (e.g. Earth diameter) and clear numerical value. Show `약`, actual unit, measurement type. It may function as a miniature navigator that opens `/scale`; no gratuitous complex 3D.
- At 1440px, aim hero occupies 600–720px total before main grid, not oversized empty wasteland.

### Remaining homepage order

1. **'보이는 것과 실제 크기는 다르다'** — short introduction strip and 3 figures clarifying the log scale (not fake statistics).
2. **Browse by scale / field** — three editorial entries: 미시 세계 / 지구와 생명 / 태양계와 우주; each has a genuine small original SVG diagram and a featured article. Do not show empty categories as if populated.
3. **One featured visual story** — large editorial split-layout with a visual comparison, real explanatory caption and article link; no auto-rotating carousel.
4. **Latest articles** — 3–6 real article cards with distinct purpose, title, description, reading time based on actual length or omit, actual publication date.
5. **'숫자를 믿을 수 있도록'** — source/method transparency: what we measure, why logarithms, meaning of average/approximation, source links.
6. **Footer** — no conversion funnels, fictitious subscribers, fake partners.

### Article-card rule

Each card = **one claim/question + one original explanatory diagram**, not a generic stock photo. Examples: '원자는 얼마나 작을까?' with ratio diagram; '지구와 달은 얼마나 떨어져 있을까?' with proportional distance strip. 3-column desktop; 1-column mobile. Avoid every card having identical design or empty image slots.

## 5. `/scale` — core interactive feature

The scale explorer must be useful, correct, keyboard operable and concise. First production version focuses on **representative physical sizes**, not mixing arbitrary units without explanation.

### UI composition

- Page header `크기 탐험` / `10의 거듭제곱으로 이해하는 크기의 세계`.
- `대상의 대표 길이/지름` explanation above chart; state each object's **measurement basis** individually.
- Large precision graph with logarithmic axis and decade ticks (`10⁻¹⁰ m ... 10¹⁰ m`), direct position-to-decade mapping, and selection markers.
- Currently selected object: name, value + converted value, type `지름/높이/길이`, `약/평균` qualification, 2–3 sentence explanation, source link, article deep-link when available.
- Track with native accessible range input or equivalently accessible control (keyboard and focus), and **adjacent clickable object list** for precision. Each object selection is a real control, not decoration.
- Accessible static data table (`대상 / 측정 대상 / 수치 / 단위 / 출처`) beneath or within a meaningful `<details>` section. Readable without relying on hover.
- SVG first, no mandatory WebGL/Three.js/GSAP/large physics engine. Use Svelte 5 reactivity for selections.

### Mathematical correctness

```ts
// Positions along a logarithmic meter scale:
const minExponent = -10;
const maxExponent = 10;
function toPosition(meters: number): number {
  if (!Number.isFinite(meters) || meters <= 0) throw new Error('meters must be positive');
  return (Math.log10(meters) - minExponent) / (maxExponent - minExponent);
}
```

Spacing represents **orders of magnitude**, not linear physical size. A diagram element's drawn radius is **not** physical-size proportional unless explicitly marked and mathematically calculated. Distinguish `diameter`, `height`, `length`, and `separation` in the dataset. Earth–Moon separation, for example, is a **distance**, not Earth's diameter; put detailed distances in an article and future `거리` view, not mislabel them as diameters.

### Example schema (adapt in implementation)

```ts
type DimensionKind = 'diameter' | 'length' | 'height' | 'distance';
type ApproximationKind = 'approximate' | 'mean' | 'measured';
interface ScienceSource {
  label: string;
  url: string;
  accessedAt: string;
}
interface ScaleObject {
  id: string;
  nameKo: string;
  nameEn?: string;
  meters: number; // base SI meters, positive and finite
  dimensionKind: DimensionKind;
  approximation: ApproximationKind;
  briefKo: string;
  sources: ScienceSource[]; // mandatory for public items
  articleSlug?: string;     // only if the actual page exists
}
```

For MVP prepare **at least 5–7 objects backed by checked primary sources**, not 20 attractive arbitrary measurements. Include data tests (valid meter values, expected axis positions, source URLs, monotonic log order, valid related article URL). If source for a measurement is unresolved, omit that object until verified.

### Edge cases and fidelity

- Format values elegantly (`1.27 × 10⁷ m` plus `약 12,742 km`) without mixing decimals arbitrarily; units must be converted correctly.
- Never compare radius against diameter without marking that clearly.
- No exact-looking pseudo-precision for estimated nanoscales.
- Communicate `logarithmic scale` plainly and offer '왜 로그 눈금인가?' help text.
- On mobile avoid a 2000px-wide slider requiring horizontal panning; maintain touch-friendly input and single object detail card.

## 6. `/articles`, `/articles/[slug]` — science editorial

Index:
- Page title and 1–2 sentence mission.
- Filter by `전체 / 미시 세계 / 지구와 생명 / 우주` only if articles actually exist in categories. No inert search field or fake filter.
- Real index sorted by publication date; no placeholder cards with dead links.

Article:
- Eyebrow category, clear title as a question, 100–160 character intro, actual author attribution (owner-approved) or simply `A2O 편집`, actual date, update history.
- Key takeaway block **as typographic paragraph**, not garish color card.
- Main scientific diagram + caption with measurement basis and source.
- Subheadings with plain-language explanation; math in accessible text; '왜 그런가?' section.
- '자료 및 출처' section with outbound links and date accessed where appropriate.
- Related actual articles; next reading; clear back-to-index link.
- Long text line length 65–75 characters approximate; body max 720px.

MVP content policy:
- We will co-author substantive articles in later chat iterations. For this site-build phase, a fully polished **one or two real, sourced sample articles** is preferable to 12 filler articles.
- Recommended first sample: `지구와 달은 얼마나 떨어져 있을까?` NASA baseline average 384,400 km (distance, not diameter), source https://science.nasa.gov/earth/facts/ . Label **average**; actual orbital distance varies.
- Further articles on atoms/cells must use checked primary sources before publishing numbers.
- No dummy article pages, fictional writers, fake dates, made-up citation lists, or filler text in a live build.

## 7. `/method`, `/about`, `/updates`

`/method`:
- Measurement conventions: SI meters, conversion examples, exponent notation, approximate vs mean, radius vs diameter vs height vs distance, how sources are selected/corrected.
- Note that pictograms may be illustrative while **axis coordinates are mathematically positioned**.
- Explain that source links lead to independently verifiable references, and changes to figures are documented.

`/about`:
- Clear declaration: `A2O(Atom to Orbit)는 사물의 크기와 공간의 규모를 시각적으로 설명하는 독립 과학 아카이브입니다.`
- Description of an independently operated educational project, owner/editor details **only if supplied**, no false organizations.
- Editorial commitments and scope; contact only if actual working address exists.

`/updates`:
- Real changelog produced from actual changes (no retroactive dates, no fake history).
- YYYY-MM-DD UTC/KST consistent format, version, short descriptive change, link to published relevant pages. Write only after implementation.

## 8. Responsive specifications

**Desktop >=1200px:** max 1240px main; split hero ~45% text + 55% observatory demo; 3-column article grid. Main heading generous white space. Article body max 720px.

**Tablet 768–1199px:** hero 50/50 or stacked if constrained; 2-column article grid; header may collapse at meaningful breakpoint based on measured overflow.

**Mobile <=767px:** 20px gutters, 64px header, hero headline 36–46px, observatory demo **below** copy and primary CTA; charts fit 320px viewport; article cards stack; focus states and touch target >=44px; ensure no sideways overflow.

Test 360, 390, 768, 1280, 1440 and 1920 widths. Do not implement mobile as a shrunk desktop screenshot. View at 100% zoom and 200% text zoom.

## 9. Stack and file organization

Use user's existing preferences, with a **static first** architecture:

- **Svelte 5 + SvelteKit 2 + TypeScript + Vite + Bun** for install/development/build tasks.
- **`@sveltejs/adapter-static`** with full prerender; no DB, login, payments or Node.js server required for first phase.
- When deployed later, choose **Cloudflare Pages** (DNS already at Cloudflare), but **do not deploy/change domain settings in this task**.
- CSS variables + small component styles, not Tailwind-by-default; SVG/Canvas for meaningful visualizations, not 3D framework by default.
- Article content under `src/lib/content` or markdown folder with verified SvelteKit-compatible markdown integration; choose simplest maintainable solution and record the choice.

Suggested directories (adapt to current repo instead of damaging existing code):

```
src/
  routes/
    +layout.svelte
    +layout.ts
    +page.svelte
    scale/+page.svelte
    articles/+page.svelte
    articles/[slug]/+page.svelte
    method/+page.svelte
    about/+page.svelte
    updates/+page.svelte
  lib/
    components/
      site/Header.svelte
      site/Footer.svelte
      ui/Button.svelte
      science/ScaleExplorer.svelte
      science/LogScaleAxis.svelte
      science/ScaleObjectDetails.svelte
      content/ArticleCard.svelte
    data/scale-objects.ts
    content/...
    styles/tokens.css
    styles/global.css
    utils/units.ts
    utils/scales.ts
static/
  favicon.svg
  og-default.png
  robots.txt
  ...
docs/
  A2O_MASTER_GUIDE.md
AGENTS.md
```

SvelteKit source: https://svelte.dev/docs/kit/adapter-static . Keep SSR-generated HTML for articles and SEO; interactive part hydrates progressively.

## 10. Functional and visual quality bar

- `bun run check` (svelte-check), `bun run lint`, `bun run test`, `bun run build` all pass (scripts may be implemented if not existing).
- Playwright smoke tests: navigation, homepage CTA to `/scale`, object selection updates values, keyboard slider, real article route and valid source link, mobile overflow, 404.
- Visual screenshots for homepage, scale, article at 390px and 1440px; review visible content including below fold.
- Accessibility: semantic heading order, anchor vs button use, focus ring, descriptive SVG labels, `aria` for interactive range and current value, no color-only labels, reduced motion support.
- Core Web Vitals targets: good real-user thresholds **LCP <=2.5s, INP <=200ms, CLS <=0.1** at p75; use Lighthouse locally as diagnostics, do not claim synthetic lab pass equals real-user pass. https://web.dev/articles/vitals
- Aim Lighthouse Performance and Accessibility >=90 on representative pages **as an internal goal**, and document actual results and environment rather than inventing numbers.
- Avoid any empty CTA, fake feature, ads, tracking pixels, fake awards, irrelevant testimonials, heavy external dependencies.
- Ensure all content accessible if JS is disabled except genuine interactive detail; SSR/static fallback provides readable explanation/table.
- No unlicensed images, fonts, data scraping or copied charts; custom SVG drawings are preferred.

## 11. Build phases and handoff contract for Codex Desktop

**Phase 1 — Foundations**: scaffold/inspect SvelteKit, tokens, layout, navigation, footer, typography, favicon, 404, meta tags; no deployment.

**Phase 2 — Editorial homepage**: polished hero, meaningful observable scale demo, article/category sections; full mobile responsive; avoid random placeholder UI.

**Phase 3 — Real explorer**: data schema, SI formatting, logarithmic axis, selection UI, accessible control and object details, fallback data table; unit tests.

**Phase 4 — Editorial pages**: article list/template, one or two sourced samples, method, about, changelog mechanism; SEO and sitemap.

**Phase 5 — Test and review**: `check/lint/test/build`; Playwright tests and screenshot reviews at 390px/1440px; fix layout and usability defects.

At each completion, Codex should provide:
1. Implemented pages and components, design choices and gaps.
2. Local run/test commands and test results (actual executed output).
3. Paths to representative homepage/scale/article screenshots.
4. Preview path/port if local server is running.
5. Explicit list of decisions needing owner approval (if any).
6. Do not claim publicly deployed; ask for approval before DNS or production access.

## 12. Objective operational evidence — later phase, keep in architecture

Prepare for later deployment evidence without adding fake public claims:

- Keep real Git history (ideally signed commits); push to GitHub repo and tag initial live release when actually public.
- Preserve provider deployment IDs, timestamp and linked commit SHA.
- At future launch, include a version/commit metadata endpoint/file (`/build-info.json`) generated automatically and containing **real** commit SHA and UTC build timestamp.
- Preserve actual external Wayback snapshots of real launched pages and true publication/change history; do not manipulate past dates.
- Production deployment is not authorized by this brief.

## 13. Explicit non-goals for first version

No accounts, comments, user-generated content, AI assistant, AI content generator, monetization, shop, ads, newsletter capture, app API, 3D orbital physics, full NASA data mirror, multilang toggle, news feed, or premature CMS. No "coming soon" links masquerading as active features.

## 14. Current references and official technical docs

- OWID design practice: https://ourworldindata.org/homepage-redesign
- OWID chart design: https://ourworldindata.org/redesigning-our-interactive-data-visualizations
- The Pudding examples and process: https://pudding.cool/resources/
- Neal.fun size visualization: https://neal.fun/size-of-space/
- NASA Eyes (conceptual): https://www.nasa.gov/interactives/
- NASA Earth facts (Moon distance): https://science.nasa.gov/earth/facts/
- SvelteKit static adapter: https://svelte.dev/docs/kit/adapter-static
- W3C WAI slider keyboard/accessibility: https://www.w3.org/WAI/ARIA/apg/patterns/slider/
- Google Core Web Vitals: https://web.dev/articles/vitals
- Codex AGENTS.md project guidance: https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide
- SUIT font and OFL license: https://github.com/sun-typeface/SUIT

---

## 15. Project north star / single test

> **If visitors learn a scientifically defensible relationship by looking, selecting and reading, A2O is working. If they only see a pretty space-themed landing page, it has failed.**
