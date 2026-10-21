# A2O v0.1.2 — Vercel Agent Skills 적용 기록

작업일: 2026-10-19 (KST). 기존 마스터 가이드와 Editorial Observatory 시각 체계 안에서 실제 탐색 문제를 개선했습니다.

## 가져온 공식 자료

- 공식 저장소: https://github.com/vercel-labs/agent-skills
- 확인한 커밋: `063bee94c3f4df8453406c830b0a7df0f2860278`
- 작업용 사본: `.tmp/vercel-agent-skills/`. 사이트 런타임 의존성이나 전역 스킬로 설치하지 않았습니다.
- 적용 스킬: [web-design-guidelines](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines)
- 스킬의 지시에 따라 검토 직전 최신 [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md)를 가져와 확인했습니다. 스냅샷은 `.tmp/vercel-web-interface-guidelines.md`, SHA-256은 `d246b026f4f29b5823a9cc857f9edf3d2507002e055e32040cadeaf3b38e0234`입니다.

접근성, 포커스, 폼, 애니메이션, 글자, 콘텐츠, 이미지, 성능, 탐색 상태, 터치, 다크 모드, 한국어·숫자 표기 규칙을 기존 공통 스타일·헤더·탐험기·이야기 목록과 대조했습니다. 실제 입력 폼, 긴 가상화 목록, 결제 흐름 등 없는 기능은 새로 만들지 않았습니다. React/Next.js 전용 최적화와 배포 스킬은 SvelteKit 정적 사이트에 적용하지 않았습니다.

## 검토 결과와 수정

아래 위치는 **개선 후 파일 기준**입니다. 문제는 작업 시작 시 확인한 동작이며 모두 수정했습니다.

### src/routes/scale/+page.svelte

- `src/routes/scale/+page.svelte:14` — 초기 URL만 읽던 선택 상태를 URL 변경과 브라우저 이동에도 동기화. 대상을 고르면 `object`, 연속 눈금은 `at` 쿼리로 복원합니다.
- `src/routes/scale/+page.svelte:20` — 직접 대상 선택은 탐색 이력 추가, 슬라이더는 현재 이력 대체. 조작 중 포커스·스크롤 위치를 유지합니다.

작업 전에는 `?object=earth`에서 탁구공을 골라도 주소가 지구로 남았습니다. 실제 표시가 `4 × 10⁻² m`로 바뀐 것을 기다린 뒤에도 주소 불일치를 재현했습니다. 현재는 선택한 대상·눈금으로 새로고침하고 뒤로·앞으로 이동할 수 있습니다. 잘못된 URL 값은 알려진 대상 또는 기본 지구로 복귀하며 과학 데이터에 새 측정값을 만들지 않습니다.

설치된 SvelteKit **2.70.3**의 구현도 확인했습니다. `pushState`/`replaceState`는 페이지 URL을 곧바로 반응형 갱신하지 않아, 쿼리 상태에는 `goto`와 `replaceState`, `keepFocus`, `noScroll` 옵션을 사용합니다. 이 동작을 브라우저 회귀 테스트로 검증했습니다.

### src/routes/articles/+page.svelte

- `src/routes/articles/+page.svelte:36` — 주제 선택을 실제 주소가 있는 링크와 `aria-current`로 표현. 새 탭 열기·링크 복사·뒤로가기 등 기본 링크 동작을 보존합니다.
- `src/routes/articles/+page.svelte:37` — 필터 이동 중 키보드 포커스와 스크롤 유지.
- `src/routes/articles/+page.svelte:41` — 선택 주제와 **실제 배열에서 계산한** 글 수를 보이는 상태 문구와 polite live region으로 전달.
- `src/routes/articles/+page.svelte:75` — 선택 상태의 글자·배경색 동시 보간 중 발생한 낮은 대비를 제거. 테두리에만 짧은 전환을 적용합니다.

주제 목록은 원고의 안정된 `categoryId`와 표시 이름에서 생성합니다. 두 편의 실제 원고만 집계하며 존재하지 않는 주제를 추가하지 않았습니다. 잘못된 `topic`은 전체 목록으로 복귀합니다.

### src/lib/styles.css / src/app.html / Header.svelte

- `src/lib/styles.css:54` — 네이티브 select에도 다른 조작 요소와 같은 명시적 키보드 포커스 표시.
- `src/lib/styles.css:62` — 링크·버튼·선택 메뉴의 터치 피드백. 확대를 막지 않고 `touch-action: manipulation` 사용.
- `src/lib/styles.css:83` — 한국어 단어 보존을 유지하며 제목 줄바꿈 균형 조정.
- `src/lib/styles.css:230` — 데이터 표의 숫자 폭을 tabular numerals로 고정.
- `src/app.html:7` — 브라우저 테마 색을 실제 종이색 배경과 일치.
- `src/app.html:9` — 공통 첫 화면 글꼴을 preload. 기존 `font-display: swap`과 자체 호스팅 유지. 새 문구에 맞춘 OFL 웹폰트 서브셋은 **99,612바이트**입니다.
- `src/lib/components/Header.svelte:25` — 브랜드 워드마크의 자동 번역 방지.

## 실제 검증

| 검사               | 최종 결과                |
| ------------------ | ------------------------ |
| `bun run check`    | 오류 0, 경고 0           |
| `bun run lint`     | ESLint·Prettier 통과     |
| `bun run test`     | 13개 통과                |
| `bun run build`    | adapter-static 빌드 성공 |
| `bun run test:e2e` | 28개 통과, 52.5초        |

Playwright: Chromium, 데스크톱 1440×1000 / 모바일 390×844. URL 선택·재로딩·이력 이동·포커스 유지, 연속 슬라이더 조작의 이력 대체, 잘못된 쿼리의 안전한 복귀, 주제 결과 수를 검사합니다. 기존 로그 좌표·과학 데이터·출처·내부 링크·404·목차·메뉴·JavaScript 없는 읽기·200% 글자 확대·reduced-motion 검사도 통과했습니다. 추가 너비 360/768/1280/1920px에서 가로 넘침을 검사했습니다.

axe: 홈, 탐험, 주제 필터 적용 목록, 기사, 방법 페이지에서 WCAG A/AA 관련 자동 위반 0건. 수동 스크린리더와 Safari/Firefox, 실제 모바일 기기 검증을 대신하지 않습니다.

정적 프리렌더 구조에서 쿼리 상태는 브라우저 초기화 후 복원합니다. JavaScript가 꺼져 있으면 전체 글과 출처 표를 읽을 수 있지만 쿼리 필터와 탐험 조작은 실행하지 않습니다.

Lighthouse 모바일 홈: **Performance 96 / Accessibility 100 / Best Practices 100 / SEO 100**. LCP 2.4초, CLS 0, TBT 30ms. Lighthouse 13.5.0, Windows HeadlessChrome 155, 기본 simulated mobile 설정으로 로컬 production preview를 2026-10-19 12:44 KST에 측정했습니다. 실사용자 성능 수치는 아닙니다.

## 화면 증거

- 작업 전: `artifacts/vercel-before/desktop-scale.png`, `mobile-scale.png`, `desktop-articles.png`, `mobile-articles.png`.
- 작업 후: `artifacts/vercel-after/desktop-home.png`, `mobile-home.png`, `desktop-scale.png`, `mobile-scale.png`, `desktop-articles.png`, `mobile-articles.png`.
- 각 화면의 첫 뷰포트는 같은 디렉터리의 `*-viewport.png`입니다. 탐험은 `?object=ball`, 목록은 `?topic=micro`의 실제 복원 상태를 캡처했습니다.
- `artifacts/vercel-after/screen-evidence.json`: 캡처한 실제 URL, 가로 넘침 없음, 브라우저 오류 없음.
- `artifacts/vercel-after/lighthouse-home.report.html`, `.json`: 성능 진단 원본.

작업 전후 주요 화면을 직접 열어 확인했습니다. 기존 브랜드·팔레트·측정 수치·정의·출처·로그 좌표식은 유지했습니다. `/updates`에는 실제 수행한 로컬 수정만 기록했습니다. 공개 배포, 도메인/DNS 변경, 원격 push는 수행하지 않았습니다.
