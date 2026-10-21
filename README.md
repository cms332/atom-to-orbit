# A2O — Atom to Orbit

한국어 독립 과학 아카이브 [A2O — Atom to Orbit](https://a2o.kr). Svelte 5, SvelteKit 2, TypeScript, Vite, Bun 및 `adapter-static`을 사용합니다.

`/orbit/`에는 자동으로 열리고 항상 움직이는 Three.js 궤도 탐험기가 있습니다. 기본 도크는 스토리·태양계·은하 궤적 세 조작으로 구성하며, 태양계는 수성·금성·지구·화성 중심으로 시작합니다. 태양·8행성 표면, 좌표계·속도 비교와 자동 진행하는 한국어 이야기를 제공합니다. [초기 설계](docs/ORBIT_EXPLORER_DESIGN.md), [간소화 재설계](docs/ORBIT_EXPLORER_REFINEMENT.md), 현재 [상시 움직임·자동 이야기](docs/ORBIT_CONTINUOUS_MOTION.md)를 참고합니다. 홈과 헤더는 크기 탐험하기 → 궤도 탐험하기 → 과학 이야기 읽기 순서입니다.

## 실행

```sh
bun install --frozen-lockfile
bun run dev
```

개발 주소는 기본 `http://127.0.0.1:5173/`입니다. 정적 산출물과 브라우저 검증:

```sh
bun run check
bun run lint
bun run test
bun run build
bunx playwright install chromium
bun run test:e2e
bun run preview --port 4173
```

빌드 산출물은 `build/`입니다. 프리렌더된 HTML과 정적 자원으로 구성되어 애플리케이션 서버나 DB가 필요하지 않습니다. 빌드 후에는 기존 preview 프로세스를 재시작해야 새 파일명이 반영됩니다.

2026-10-21 소유자 승인으로 Ubuntu의 A2O 전용 컨테이너에 공개 배포했습니다. 기존 HGI와 다른 서비스는 유지하며, DNS는 소유자가 관리합니다. 배포·검증·복구 명령과 구조는 [배포 운영 문서](docs/DEPLOYMENT.md)를 참고합니다.

## 페이지

- `/`: Editorial Observatory 홈과 실제 로그 탐색 미리보기
- `/scale/`: 27개 대상, 네이티브 슬라이더, 직접 선택 목록, 정적 데이터 표
- `/orbit/`: 태양과 8행성의 3D 공전·은하 이동, 좌표계 비교와 한국어 이야기
- `/articles/`: 실제 원고 세 편과 동작하는 주제 필터
- `/articles/why-earth-feels-still/`: 움직임을 체감하지 못하는 이유, 속도·관성 도식과 기준계 비교
- `/articles/earth-moon/`, `/articles/atomic-scale/`: 출처가 연결된 첫 두 기사
- `/404/`: 오류 안내
- `/sitemap.xml`, `/robots.txt`: 정적 검색 메타데이터

## 유지보수

먼저 `AGENTS.md`, `docs/A2O_MASTER_GUIDE.md`, `docs/A2O_DECISIONS_AND_PROGRESS.md`를 읽습니다. 처음 제공된 루트 명세와 HTML 참고 파일도 보존했습니다. `docs/`의 마스터 가이드는 원문 사본이며 명세 내용은 수정하지 않았습니다.

- 과학 수치와 출처: `src/lib/data/science.ts`. 항상 SI 미터로 저장하고 측정 방식과 환산식을 명시합니다. 거리와 물체 지름을 혼합하지 않습니다.
- 로그 좌표·단위: `src/lib/utils/scales.ts`. 범위는 10⁻¹⁰ m부터 태양의 지름 1,391,400,000 m까지이며, 눈금의 수평 위치는 `(log10(m) + 10) / (log10(MAX_METERS) + 10)`입니다. 오른쪽 끝에서 태양의 원자료 치수에 정확히 도달합니다.
- 원고: `src/lib/content/articles.ts`와 `motion-article.ts`. 타입이 있는 콘텐츠 배열로 불필요한 Markdown 런타임을 피하고 출처 ID와 연결했습니다. 원고 추가 시 실제 날짜, 출처와 경로를 함께 등록합니다. 움직임 기사의 SI 속도와 원출처는 `src/lib/data/motion.ts`에 있습니다.
- 문구 변경 후 웹폰트 재생성: `python -m pip install fonttools brotli`, `python scripts/subset-font.py`. 원본은 `scripts/fonts/`, 현재 문구로 만든 웹 서브셋은 `static/fonts/`에 있습니다. OFL과 Reserved Font Name에 맞춰 파생 폰트의 내부 이름을 `A2O Sans Subset`으로 변경했습니다. 스크립트가 CSS 폰트 URL의 내용 해시도 갱신하므로 둘을 함께 커밋합니다.
- 공유 이미지 재생성: `node scripts/render-social.mjs`. 기존 HTML 참고 화면 캡처도 `artifacts/reference-desktop.png`에 저장합니다.
- CSS는 페이지별 작은 스타일을 프리렌더 HTML에 인라인합니다. 루트 도메인에서 서비스하는 구조이므로 ESLint의 base-path `resolve()` 강제 규칙만 제외했습니다.
- 정적 호스팅 시 알 수 없는 경로에 `404.html`을 **404 상태 코드로** 반환해야 합니다. 현재 Ubuntu Nginx 설정과 공개 응답에서 이를 검증했습니다.

실제 검사 결과와 스크린샷 목록은 `docs/IMPLEMENTATION_REPORT.md`에서 확인합니다. Lighthouse는 로컬 진단이며 실제 이용자의 Core Web Vitals를 입증하지 않습니다.

UI/UX Pro Max를 활용한 v0.1.1 개선 근거·검사 결과는 `docs/UIUX_PRO_MAX_IMPROVEMENTS.md`를 참고합니다.

Vercel Agent Skills를 활용한 v0.1.2 URL 상태·접근성 개선과 최종 검증은 `docs/VERCEL_AGENT_SKILLS_IMPROVEMENTS.md`에 기록했습니다. 탐험은 `?object=moon&at=6.5`, 이야기 목록은 `?topic=micro`처럼 주소로 상태를 복원합니다.

이후 홈·편집 화면에는 공용 `design-taste-frontend`를 적용합니다. A2O 명세와의 우선순위와 홈 개선 내용은 `docs/A2O_TASTE_DESIGN_WORKFLOW.md`를 참고합니다.

v0.1.3 누적 변경의 최종 타입·린트·단위/Playwright 테스트·빌드 결과, 자동 승인 오류 진단과 최신 스크린샷은 `docs/VERIFICATION_2026-10-19.md`에 기록했습니다. 이전 개선 문서의 검증 대기 상태는 이 후속 검증으로 갱신됩니다. GitHub 저장소 다운로드 미완료 기록과는 구분합니다.

v0.1.4는 홈·탐험에 같은 축척의 연속 SVG 줌을 적용했습니다. `scale-scene.ts`의 `92 × 10^(log10(미터) − 지수)`로 가로 기준 길이·지름을 계산하며, 슬라이더 한 눈금마다 10분의 1로 줄어듭니다. 설계 근거·17개 단위 테스트·32개 Playwright 결과와 단계별 화면은 `docs/CONTINUOUS_SCALE_ZOOM.md`에 기록했습니다.

v0.1.5는 참조 이미지를 관찰해 새로 그린 15개 SVG와 출처·측정 기준을 추가해 총 22개 대상을 제공합니다. 최종 check·lint·20개 단위 테스트·정적 빌드·36개 Playwright 검사와 30개 대상별 화면 검증 결과는 [크기 기준 확장 보고서](docs/SCALE_CATALOGUE_EXPANSION.md)에 있습니다. 새 도판 모음과 개별 데스크톱·모바일 화면은 `artifacts/scale-expansion/`에서 확인할 수 있습니다.

v0.1.6은 수성·금성·화성·토성·천왕성을 추가해 8행성을 모두 제공하며, 전체 27개 대상을 평균 지름 등 실제 비교 치수순으로 정렬합니다. 포보스·베스타 이름을 구체화했습니다. 최종 check·lint·22개 단위 테스트·정적 빌드·38개 Playwright 결과는 [8행성 확장 보고서](docs/SOLAR_SYSTEM_EXPANSION.md)에, 실제 데스크톱·모바일 화면은 `artifacts/solar-system/`에 있습니다.

v0.1.7은 홈과 크기 탐험의 끝을 태양의 지름에 맞췄습니다. 눈금 표기는 10의 거듭제곱으로 통일하며 마지막 레이블은 실제 10⁹ m 위치에 둡니다. 드래그·End 키·태양 선택 주소로 태양에서 멈춥니다. 구현과 검증 기록: [태양에서 끝나는 탐험](docs/SUN_ENDPOINT.md).

v0.1.8은 비교 SVG를 넓은 화면에서 276px, 390px 모바일에서 216px 높이로 키웠습니다. 기준 치수는 최대 180px이며 모바일에서는 토성 고리까지 담도록 폭에 맞춥니다. 모든 대상·기준자는 같은 물리 축척을 사용합니다. 현재 표시 크기와 검증: [더 넓어진 비교 화면](docs/LARGER_SCALE_SCENE.md).

v0.1.9는 원자부터 태양까지 대상마다 잠시 멈추는 자동 재생·일시 정지를 제공합니다. 반복 로그 설명 띠는 제거하고 DNA·탁구공·지구의 실제 치수로 연결되는 출발점을 정리했습니다. 동작과 검증: [자동 재생과 구체적인 출발점](docs/AUTOPLAY_AND_ENTRY_POINTS.md).
