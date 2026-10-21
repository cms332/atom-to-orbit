# GitHub 공개 예정 파일 전체 목록

작성일: 2026-10-21. `cms332/atom-to-orbit` 최초 공개 검토용 현재 작업 트리 목록.
총 **202개 파일**. 승인 전 최종 재검사하며, 이후 바뀌면 목록을 갱신한다.

기존 이력의 경로 190개도 공개된다. 이 목록에서 현재 파일을 제외해도 과거 내용이
자동으로 제거되지 않는다. 운영 접속 메타데이터·작성자 이메일과 권리 검토는
[공개 전 검토](GITHUB_PUBLICATION_REVIEW.md)를 함께 확인한다.

빌드 산출물, node_modules, .env, .ssh, .tmp, artifacts, Git 내부 복구 ref,
개인 키·DB·토큰·로그·로컬 감사 보고서·도구 바이너리는 전송하지 않는다.

## root — 18개

```text
.gitattributes
.gitignore
.prettierignore
.prettierrc
A2O_DECISIONS_AND_PROGRESS.md
A2O_HOMEPAGE_REFERENCE.html
A2O_MASTER_GUIDE.md
AGENTS.md
CODEX_START_PROMPT.md
README.md
THIRD_PARTY_NOTICES.md
bun.lock
eslint.config.js
package.json
playwright.config.ts
svelte.config.js
tsconfig.json
vite.config.ts
```

## .github — 2개

```text
.github/main-protection.json
.github/workflows/ci.yml
```

## deploy — 5개

```text
deploy/Dockerfile
deploy/bootstrap.py
deploy/nginx.conf
deploy/npm-a2o.mjs
deploy/release.sh
```

## docs — 45개

```text
docs/A2O_ARTICLE_FORMAT.md
docs/A2O_DECISIONS_AND_PROGRESS.md
docs/A2O_MASTER_GUIDE.md
docs/A2O_TASTE_DESIGN_WORKFLOW.md
docs/ANTHROPIC_FRONTEND_DESIGN.md
docs/AUTOPLAY_AND_ENTRY_POINTS.md
docs/CONTINUOUS_PLAYBACK.md
docs/CONTINUOUS_SCALE_ZOOM.md
docs/DEPLOYMENT.md
docs/EMIL_SKILLS_IMPROVEMENTS.md
docs/EXTENDED_SVG_PLAYBACK.md
docs/FOOTBALL_SVG.md
docs/GITHUB_PUBLICATION_FILES.md
docs/GITHUB_PUBLICATION_REVIEW.md
docs/GITHUB_WORKFLOW.md
docs/HALLMARK_IMPROVEMENTS.md
docs/IMPECCABLE_IMPROVEMENTS.md
docs/IMPLEMENTATION_REPORT.md
docs/LARGER_SCALE_SCENE.md
docs/ORBITAL_LOGO.md
docs/ORBIT_CONTINUOUS_MOTION.md
docs/ORBIT_EXPLORER_DESIGN.md
docs/ORBIT_EXPLORER_REFINEMENT.md
docs/ORBIT_EXPLORER_VERIFICATION.md
docs/RULER_ONLY_REFINEMENT.md
docs/SCALE_CATALOGUE_EXPANSION.md
docs/SOLAR_SYSTEM_EXPANSION.md
docs/STABLE_EXPLORER_HEIGHT.md
docs/SUN_ENDPOINT.md
docs/SVG_SHAPE_REVIEW.md
docs/UIUX_PRO_MAX_IMPROVEMENTS.md
docs/VERCEL_AGENT_SKILLS_IMPROVEMENTS.md
docs/VERIFICATION_2026-10-19.md
docs/content/why-earth-feels-still/FEEDBACK_REVIEW.md
docs/content/why-earth-feels-still/IMPLEMENTATION.md
docs/content/why-earth-feels-still/PLAYBACK.md
docs/content/why-earth-feels-still/reference/01_ARTICLE_PUBLISH_READY.md
docs/content/why-earth-feels-still/reference/02_EDITORIAL_DESIGN_AND_SCIENCE_GUIDE.md
docs/content/why-earth-feels-still/reference/03_CODEX_DESKTOP_PROMPT.md
docs/reference-assets/erfa-icrs2g.c
docs/reference-assets/football-flomar-cc0.svg
docs/reference-assets/ne_110m_land.geojson
docs/reference-assets/types-three-MIT.txt
docs/releases/deployed-20261021T050517Z.md
docs/scale-illustration-references.json
```

## scripts — 21개

```text
scripts/audit-preview.mjs
scripts/audit-publication.py
scripts/audit-scale-glyphs.mjs
scripts/audit-science-links.ts
scripts/capture-scale-gallery.mjs
scripts/capture-scale-references.mjs
scripts/check-deployment.mjs
scripts/collect-glyph-references.mjs
scripts/compare-glyph-studies.mjs
scripts/deploy.ps1
scripts/fetch-orbit-textures.py
scripts/fonts/OFL.txt
scripts/fonts/SUIT-Variable.woff2
scripts/generate-earth-outline.mjs
scripts/package-deploy.mjs
scripts/prepare-release.mjs
scripts/render-social.mjs
scripts/review-three-glyphs.mjs
scripts/subset-font.py
scripts/verify-autoplay-live.mjs
scripts/verify-continuous-playback.mjs
```

## src — 77개

```text
src/app.html
src/lib/components/ArticleCard.svelte
src/lib/components/ArticleDisclosure.svelte
src/lib/components/Diagram.svelte
src/lib/components/EverydayGlyph.svelte
src/lib/components/FootballGlyph.svelte
src/lib/components/Footer.svelte
src/lib/components/Header.svelte
src/lib/components/LeadGlyph.svelte
src/lib/components/LogAxis.svelte
src/lib/components/MicroGlyph.svelte
src/lib/components/MoonDistance.svelte
src/lib/components/MotionFrames.svelte
src/lib/components/MotionSpeeds.svelte
src/lib/components/MotionThumbnail.svelte
src/lib/components/OrbitExperience.svelte
src/lib/components/OrbitFallback.svelte
src/lib/components/PageMeta.svelte
src/lib/components/PlanetSurface.svelte
src/lib/components/ScaleExplorer.svelte
src/lib/components/ScaleGlyph.svelte
src/lib/components/ScaleScene.svelte
src/lib/components/SmallBodyGlyph.svelte
src/lib/components/StructureGlyph.svelte
src/lib/components/SunGlow.svelte
src/lib/components/SunGlyph.svelte
src/lib/components/TableGlyph.svelte
src/lib/components/TrainInertia.svelte
src/lib/components/WhaleGlyph.svelte
src/lib/content/articles.ts
src/lib/content/motion-article.ts
src/lib/data/earth-outline.ts
src/lib/data/motion.ts
src/lib/data/orbit-body-sizes.ts
src/lib/data/orbit-story.ts
src/lib/data/orbits.ts
src/lib/data/scale-art.test.ts
src/lib/data/scale-art.ts
src/lib/data/science-expansion.ts
src/lib/data/science-planets.ts
src/lib/data/science.ts
src/lib/orbit/earth-journey-camera.ts
src/lib/orbit/gesture-lifecycle.ts
src/lib/orbit/refine-trail.test.ts
src/lib/orbit/refine-trail.ts
src/lib/orbit/renderer.ts
src/lib/orbit/surfaces.ts
src/lib/orbit/timing.ts
src/lib/orbit/tracking-trail.test.ts
src/lib/orbit/tracking-trail.ts
src/lib/orbit/trail-visibility.test.ts
src/lib/orbit/trail-visibility.ts
src/lib/styles.css
src/lib/utils/motion-scene.test.ts
src/lib/utils/motion-scene.ts
src/lib/utils/navigation-state.test.ts
src/lib/utils/navigation-state.ts
src/lib/utils/orbit-model.test.ts
src/lib/utils/orbit-model.ts
src/lib/utils/planet-geometry.ts
src/lib/utils/scale-playback.test.ts
src/lib/utils/scale-playback.ts
src/lib/utils/scale-scene.test.ts
src/lib/utils/scale-scene.ts
src/lib/utils/scales.test.ts
src/lib/utils/scales.ts
src/routes/+error.svelte
src/routes/+layout.svelte
src/routes/+layout.ts
src/routes/+page.svelte
src/routes/404/+page.svelte
src/routes/articles/+page.svelte
src/routes/articles/[slug]/+page.svelte
src/routes/articles/[slug]/+page.ts
src/routes/orbit/+page.svelte
src/routes/scale/+page.svelte
src/routes/sitemap.xml/+server.ts
```

## static — 20개

```text
static/brand/a2o-orbital.png
static/favicon.svg
static/fonts/A2OSans-Subset.woff2
static/fonts/OFL.txt
static/fonts/README.md
static/licenses/erfa-icrs2g.txt
static/licenses/orbit-textures.txt
static/licenses/three-MIT.txt
static/og-default.png
static/orbit/textures/earth-clouds.webp
static/orbit/textures/earth.webp
static/orbit/textures/jupiter.webp
static/orbit/textures/mars.webp
static/orbit/textures/mercury.webp
static/orbit/textures/neptune.webp
static/orbit/textures/saturn.webp
static/orbit/textures/sun.webp
static/orbit/textures/uranus.webp
static/orbit/textures/venus.webp
static/robots.txt
```

## tests — 14개

```text
tests/article-format.spec.ts
tests/autoplay.spec.ts
tests/brand.spec.ts
tests/football.spec.ts
tests/footer.spec.ts
tests/glyph-review.spec.ts
tests/motion-article.spec.ts
tests/orbit.spec.ts
tests/playback-overlay.spec.ts
tests/scale-expansion.spec.ts
tests/site.spec.ts
tests/solar-system.spec.ts
tests/sun-endpoint.spec.ts
tests/sun-glow.spec.ts
```
