# A2O v0.1.1 — UI/UX Pro Max 적용 기록

작업일: 2026-10-19 (KST). 기존 `A2O_MASTER_GUIDE.md`와 Editorial Observatory 디자인을 유지하며, 실제 화면의 사용성을 개선했습니다. 공개 배포와 DNS 변경은 수행하지 않았습니다.

## 공식 출처와 적용 방법

- 공식 GitHub: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- 확인한 커밋: `56ea9cf174ed86786187daa9de0e6247cb0747e4`
- 읽은 스킬: `.claude/skills/ui-ux-pro-max/SKILL.md`
- 추가 확인: `references/quick-reference.md`의 접근성·상호작용·성능 규칙, MIT 라이선스, 로컬 검색 스크립트.
- GitHub 소스는 `.tmp/ui-ux-pro-max/`에 받아 검토했습니다. 사이트의 런타임이나 빌드 의존성으로 추가하지 않았습니다. 외부 코드가 A2O의 배포 산출물에 들어가지 않습니다.

기존 제품의 특정 문제를 고치는 작업이므로 스킬의 Query Contract에 따라 새 색상·폰트·디자인 시스템을 생성하지 않고 **문제별 UX 검색과 확인된 Svelte 스택 검색**을 실행했습니다. 추천은 저장소 명세보다 우선하지 않습니다.

| 실제 검색                                   | 확인한 관련 결과                     | A2O에 적용한 판단                                                                                      |
| ------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `font size readability --domain ux`         | Readable Font Size / Font Size Scale | 탐험기 본문, 주제 설명, 기사 요약을 읽기 좋은 크기로 조정. 데이터 수치·측정 기준·보조 정보의 위계 분리 |
| `label readability chart --domain ux`       | Input Labels / Number Formatting     | 숨김 상태였던 슬라이더 레이블을 화면에 표시. 단위와 과학 표기, 환산값을 함께 유지                      |
| `dragging movements --domain ux`            | Dragging Movements                   | 네이티브 슬라이더의 키보드 조작을 유지하고 단일 탭 이전·다음 대상 버튼 추가                            |
| `responsive data table --domain ux`         | Table Handling                       | 모바일에서 표 행을 세로 배열로 재구성. 측정 기준·수치·환산·출처를 가로 밀기 없이 읽게 함               |
| `press feedback selected state --domain ux` | Active States                        | 선택 체크·강조점·배경·색을 함께 사용. hover/pressed 피드백 추가. 진동은 도입하지 않음                  |
| `keyboard reactive state --stack svelte`    | `$app/state`, 현재 runes 사용        | Svelte 5 상태 구조를 유지. 이 작업에 필요 없는 공유 store와 이전 세대 패턴은 추가하지 않음             |

추천 중 제품에 맞지 않는 bulk editing, autoplay, native haptics 등은 적용하지 않았습니다. 이 표는 검색 결과 전체를 그대로 채택한 목록이 아니라 적합성을 검토한 구현 근거입니다.

## 화면에서 확인한 문제와 개선

### 1. 홈에서 탐험 시작 — 개선 완료

개선 전 홈 미리보기에는 슬라이더의 시각적 레이블이 없고 보조 텍스트·수치가 작았습니다. 글자 크기를 정리하고 레이블과 축 범례를 보이게 했습니다. 숫자는 명시적인 시스템 monospace 스택과 tabular numerals로 표시합니다. 주요 설명의 가독성과 짧은 상호작용 피드백도 개선했습니다.

증거: `artifacts/uiux-before/desktop-home.png` → `artifacts/uiux-after/desktop-home.png`, 동일한 1440px 화면.

### 2. 대상을 고르고 수치를 이해 — 개선 완료

개선 전 탐험기는 상징적 지구 그림의 비중이 크고 실제 로그 축은 작았습니다. 설명은 별도 목록 아래에 있어 수치와 함께 읽기 어려웠습니다. 전체 탐험기는 **수치 → 기준과 설명 → 실제 로그 축 → 조작 → 원자료/기사** 순서로 바꿨습니다. 상징적 계측 그림은 홈 미리보기에 유지했습니다.

선택 대상은 목록의 체크·배경·`aria-pressed`, 축의 강조점으로 일치시켰습니다. 이전·다음 버튼은 실제 데이터 항목으로 이동하며 양 끝에서 비활성화됩니다. 모바일에서는 탐험기 위에 16px 네이티브 선택 메뉴를 배치하여 목록을 지나 내려가지 않아도 대상을 바꿀 수 있습니다.

축의 수학식과 데이터는 변경하지 않았습니다. 원의 크기는 실제 지름 비례를 뜻하지 않고, 세로 위치는 점을 구분하기 위한 배치임을 SVG 설명에 명시합니다. 네이티브 range의 thumb 중심과 로그 축 가로 영역도 맞췄습니다.

증거: `artifacts/uiux-before/desktop-scale.png`, `mobile-scale.png` → `artifacts/uiux-after/desktop-scale.png`, `mobile-scale.png`.

### 3. 모바일에서 수치와 출처 확인 — 개선 완료

개선 전 표는 가로 스크롤 영역 안에 출처 열이 숨겨졌습니다. 모바일에서는 동일한 HTML 표의 행을 세로 배열로 표현하고 각 값에 보이는 레이블을 붙였습니다. 원래 표 헤더와 행·셀 관계는 보조기술을 위해 유지했습니다. 이제 각 대상의 이름·측정 기준·SI 값·환산값·출처·환산식을 화면 너비 안에서 읽습니다.

증거: 위 모바일 탐험기 전체 스크린샷의 데이터 영역. 표 너비와 각 행의 너비 및 실제 출처 링크 노출도 Playwright에서 검사합니다.

### 4. 기사에서 질문별로 이동 — 개선 완료

실제 본문 소제목에서 목차를 생성하고 고정 앵커로 이동하게 했습니다. 별도 플러그인이나 스크롤 추적 JS는 추가하지 않았습니다. 모바일 메뉴에서 Escape를 누르면 닫힌 메뉴 안에 포커스가 남지 않고 메뉴 버튼으로 돌아갑니다.

증거: `artifacts/uiux-after/desktop-article.png`, `mobile-article.png`. 목차 이동과 메뉴 포커스는 브라우저 테스트로 확인합니다.

## 유지한 기준

원본 마스터 가이드, 팔레트, 브랜드, SvelteKit 정적 구조, 과학 데이터·단위·출처는 유지했습니다. 새 과학 수치를 만들거나 기사 수를 부풀리지 않았습니다. 라이브러리나 애니메이션 엔진을 추가하지 않았고 reduced-motion을 유지합니다. 추가 문구에 맞춰 기존 OFL 웹폰트 서브셋을 재생성했습니다.

검증 결과, 실제 수치와 검증 범위는 이 문서의 최종 검사 항목에 기록합니다. 자동 접근성 결과만으로 수동 스크린리더나 실제 기기 사용성을 모두 검증했다고 주장하지 않습니다.

## 최종 검사와 미리보기

| 검사               | 실제 결과                       |
| ------------------ | ------------------------------- |
| `bun run check`    | 오류 0, 경고 0                  |
| `bun run lint`     | ESLint·Prettier 통과            |
| `bun run test`     | 8개 통과                        |
| `bun run build`    | adapter-static 정적 빌드 성공   |
| `bun run test:e2e` | **22개 통과**, 최종 실행 58.2초 |

Playwright는 데스크톱 1440×1000, 모바일 390×844에서 실행했습니다. 360/768/1280/1920px 너비의 홈·탐험기·기사, 200% 글자 확대, reduced-motion, JavaScript 비활성 콘텐츠, 모든 내부 링크, 실제 404도 확인했습니다. axe의 대표 페이지 자동 접근성 검사는 위반 0건입니다.

새 검사는 대상 선택과 이전·다음·강조점의 상태 일치, 처음/마지막 대상의 disabled 상태, 모바일에서 모든 행의 출처 노출과 가로 넘침 없음, 목차의 실제 본문 이동, Escape 이후 메뉴 버튼 포커스 복귀를 검증합니다.

개선 후 홈 Lighthouse 모바일 진단은 **Performance 95 / Accessibility 100 / Best Practices 100 / SEO 100**입니다. LCP 2.4초, CLS 0.02, TBT 0ms입니다. Lighthouse 13.5.0, Windows HeadlessChrome 155, 기본 simulated mobile throttling을 사용하여 2026-10-19 12:26 KST에 로컬 production preview에서 측정했습니다. 실사용자 Core Web Vitals 측정은 아닙니다. 보고서는 `artifacts/uiux-after/lighthouse-home.report.html` 및 `.json`에 있습니다.

최종 전체 화면과 첫 화면은 `artifacts/uiux-after/`에 저장했습니다. `uiux-before/`는 이번 작업을 시작할 때 캡처한 실제 기준 화면입니다. 홈·탐험기·기사 전후 화면을 확인했으며, 검증용 preview 서버는 정리하고 사용자가 보던 개발 서버는 `http://127.0.0.1:5173/`에서 다시 실행했습니다.

웹폰트 서브셋은 새 문구를 포함해 **96,892바이트**입니다. 참조 저장소 캐시는 ESLint와 Vite 파일 감시에서 제외해 외부 코드의 검사 오류나 무관한 전체 새로고침을 방지했습니다.

확인된 기능 오류는 남아 있지 않습니다. 실제 기기, Safari/Firefox와 수동 스크린리더 검증은 이번 작업 범위에 포함하지 않았습니다. 과학 데이터와 출처를 수정하지 않았고, 공개 배포·DNS 변경·원격 push도 수행하지 않았습니다.
