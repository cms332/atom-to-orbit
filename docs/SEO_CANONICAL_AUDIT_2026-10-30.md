# A2O canonical 진단 — 2026-10-30

현재 공개 소스: `61fe130158466d7b5e8431977b804d3f1c9a496b`, 릴리스 `20261028T134933Z`.
이번 결과는 **운영 수정 전 관측 + 수정 후보 검증**이다. 공개 배포·DNS·HGI·다른 서비스 설정은 변경하지 않았다. 기존 홈 재배치 작업은 Git stash에 그대로 보관되어 있다.

## A. 정상적인 제외라서 그대로 둔 URL

Search Console의 로그인된 기존 탭에서 직접 확인했다. 아래 다섯 URL은 사용자 선언 표준과 Google 선택 표준이 모두 일치한다. 별도 원고가 아닌 탐험기 선택 상태와 기사 목록 필터이므로 해당 상태 URL의 색인을 강제하지 않는다.

| 실제 영향 URL             | 마지막 크롤링 (검사 화면 표시값) | 사용자 선언 = Google 선택 표준 |
| ------------------------- | -------------------------------- | ------------------------------ |
| `/scale/?object=dna`      | 2026-10-24 14:05:52              | `https://a2o.kr/scale/`        |
| `/scale/?object=earth`    | 2026-10-24 05:00:34              | `https://a2o.kr/scale/`        |
| `/scale/?object=ball`     | 2026-10-23 13:25:05              | `https://a2o.kr/scale/`        |
| `/articles/?topic=micro`  | 2026-10-24 10:20:48              | `https://a2o.kr/articles/`     |
| `/articles/?topic=cosmos` | 2026-10-26 10:00:14              | `https://a2o.kr/articles/`     |

시간은 한국어 브라우저의 표시값을 기록했으며, 화면에 별도 시간대 표시는 없었다. 보고서 목록과 개별 검사 결과의 갱신 날짜가 다르므로 합쳐 추정하지 않았다. ball 검사 화면에는 사이트맵 ‘일시적인 처리 오류’도 표시되었지만, 이를 현재 사이트맵 결함이라고 단정하지 않는다.

두 번째 알림의 유일한 예시는 `/licenses/three-MIT.txt`다. 공개 라이선스 고지용 정적 텍스트이며 기사나 독립 검색 대상이 아니다. 200 제공과 라이선스 링크를 유지하고 canonical·noindex·robots 차단을 새로 넣지 않는다. Google의 구체적인 선택 대상은 C의 한계에 해당한다.

### 변경 불필요로 확인한 구성

- SvelteKit `adapter-static`, `prerender = true`, `trailingSlash = 'always'`. 홈 재배치 후보는 적용되어 있지 않다.
- 공통 `+layout.svelte` 한 곳에서만 절대 canonical을 만든다. 대표 10개 페이지는 원본 HTML head에 정확히 1개이며 각자 자기 주소를 가리킨다. 실행 후도 동일하다.
- query/hash는 canonical에서 제외한다. 실제 요청의 object/at, topic, utm, 알 수 없는 query는 유지한다.
- `/articles/?topic=…`는 같은 기사 데이터의 클라이언트 필터다. 별도 원고·별도 제목·정적 필터 페이지가 없고 기존 표준 정책 및 Google 선택과 일치하므로 목록 표준을 유지한다.
- 사이트맵은 실제 200 대표 URL 10개만 포함한다. 쿼리·오류·별칭이 없고 lastmod를 생성하지 않으므로 허위 날짜를 추가하지 않는다.
- 내부 페이지 링크 239개에서 대표 URL 형식 불일치가 없었다. 기능용 선택·필터 링크는 보존한다.
- 운영 NPM은 실제 `a2o-20261028T134933Z:8080`에 연결되어 있다. www는 DNS 신설 없이 이미 HTTPS 308로 운영 중인 별칭임을 응답으로 확인했다.
- 운영 대표 HTML에 robots/noindex 및 X-Robots-Tag 제한이 없다. HTTP Link canonical도 없다. 폰트의 `rel=license`는 canonical과 무관하다.
- 존재하지 않는 일반 경로·기사 index 별칭·API 경로는 HTTP 404다. 홈페이지를 200으로 반환하지 않는다.

## B. 실제 문제를 확인하고 수정한 URL

**알림의 원인으로 단정하지 않은 별도 결함**: 모든 실제 페이지의 명시적 `index.html` 주소가 200으로 중복 제공되었다. 특히 기사 6개에서는 JS 실행 후 오류 처리로 canonical이 2개가 되고 noindex가 추가되었다. 정상 기사 URL에는 이 문제가 없다.

| 별칭 (https://a2o.kr 기준)                     | 운영 수정 전                   | 수정 후보의 대표 도착 주소           |
| ---------------------------------------------- | ------------------------------ | ------------------------------------ |
| `/index.html`                                  | 200, canonical 1               | `/`                                  |
| `/scale/index.html`                            | 200, canonical 1               | `/scale/`                            |
| `/orbit/index.html`                            | 200, canonical 1               | `/orbit/`                            |
| `/articles/index.html`                         | 200, canonical 1               | `/articles/`                         |
| `/articles/why-sky-blue-sunset-red/index.html` | 200 → JS canonical 2 / noindex | `/articles/why-sky-blue-sunset-red/` |
| `/articles/how-old-is-starlight/index.html`    | 200 → JS canonical 2 / noindex | `/articles/how-old-is-starlight/`    |
| `/articles/empty-space-in-atoms/index.html`    | 200 → JS canonical 2 / noindex | `/articles/empty-space-in-atoms/`    |
| `/articles/why-earth-feels-still/index.html`   | 200 → JS canonical 2 / noindex | `/articles/why-earth-feels-still/`   |
| `/articles/earth-moon/index.html`              | 200 → JS canonical 2 / noindex | `/articles/earth-moon/`              |
| `/articles/atomic-scale/index.html`            | 200 → JS canonical 2 / noindex | `/articles/atomic-scale/`            |

수정 후보는 각 별칭에서 동일한 내용의 위 대표 URL로 308 이동한다. 기사 본문과 기존 canonical은 변경하지 않는다.

운영의 `http://www.a2o.kr/scale?object=earth`는 HTTP→HTTPS, www 제거, slash 추가의 3단계였다. 수정 후보는 페이지 목록에 있는 별칭만 먼저 판별하고 공개 원점까지 한 번에 308로 이동한다. 필요한 query는 `$is_args$args` 또는 `$request_uri` 그대로 보존한다. robots.txt·sitemap.xml·라이선스·폰트·API에는 페이지 slash 규칙을 적용하지 않는다.

### 변경 파일과 이유

| 파일                                                  | 변경 이유                                                                                                        |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `deploy/canonical-redirects.mjs`                      | 후보 릴리스 사이트맵에 있는 페이지에 한정해 index/slash 규칙 생성. foreign URL·중복·누락·임의 설정 덮어쓰기 거부 |
| `deploy/npm-a2o.mjs`                                  | 배포 시 A2O 프록시 하나의 주소 정리 규칙 갱신. 기존 다른 프록시 구성 해시 검사 유지                              |
| `deploy/nginx.conf`                                   | 웹 컨테이너 자체도 실제 존재하는 페이지 index 별칭을 308 처리. 원래 요청 검사로 내부 index 처리 루프 방지        |
| `deploy/release.sh`, `scripts/deploy.ps1`             | 배포 도우미를 명시적으로 전달. 운영에 아직 설치하지 않음                                                         |
| `deploy/canonical-redirects.test.mjs`                 | 쿼리 보존과 잘못된 입력·설정에 대한 거부 검사                                                                    |
| `tests/canonical.spec.ts`, `.github/workflows/ci.yml` | 사이트맵/SSR/실행 후/클라이언트 이동 표준 일치 및 선택·필터 회귀 검사                                            |

NPM 기본 Force SSL 규칙은 사용자 규칙보다 먼저 실행되어 다단계 이동을 만든다. 후보는 이 자동 규칙 대신 **A2O 전용 HTTPS 강제 규칙**을 같은 설정 갱신에 포함한다. 인증서와 TLS 리스너는 유지하며 HTTP를 콘텐츠 200으로 제공하지 않는다. 기존 ACME challenge 예외를 보존한다. 일반 NPM 전역 템플릿이나 다른 호스트는 수정하지 않는다.

## C. Search Console 자료가 없어 판단을 보류한 URL

- `/licenses/three-MIT.txt`: 목록에서 중복 분류 및 최종 크롤링 날짜 2026-10-24까지 확인. 상세 URL 검사 요청 후 기존 브라우저 탭이 교체/중단되고 재접속이 두 차례 시간 초과되어 사용자 선언 및 Google 선택 표준의 구체적인 값은 미확인.
- `index.html` 별칭 10개: 운영 재현 문제는 확인했으나, 두 알림의 예시 목록에는 나타나지 않았다. Google이 실제로 이 주소를 크롤링했거나 중복 판정했다는 주장은 하지 않는다.
- 다섯 선택·필터 URL 외의 대표 페이지/추적값별 Google 선택과 크롤링 시각은 미확인이다. HTTP 200 및 정상 canonical은 Google 색인 완료를 뜻하지 않는다.
- 배포 후 재크롤링 및 Google 판단 변화는 미래의 별도 관측이다. 수정 결과 확인·색인 요청·URL 삭제는 실행하지 않았다.

## 검증 및 증거

- 운영 HTTP 85개 요청, JS 실행 후 80개 HTML 응답, 대표 페이지의 정적 빌드와 직접 대조했다.
- 타입 오류/경고 0, lint, 기존 단위 검사 72개, 리디렉션 생성 검사 2개, 정적 빌드 통과.
- PC/모바일 브라우저 회귀 10개 통과: 모든 대표 페이지의 SSR/head, 실행 후, 기사→탐험기 이동, object/at, topic, reload/back/forward.
- 전체 URL별 요청/상태/리디렉션/최종 URL/canonical/robots/Link/사이트맵/Google 관측 자료: `artifacts/seo-canonical/url-before.csv`. 원본 JSON은 같은 폴더에 있다. 계정 이름·세션 토큰·쿠키는 보고서에 저장하지 않는다.
- Nginx 수정 후보 검증은 기존 운영 이미지의 **네트워크 없음·공개 포트 없음** 임시 컨테이너에서 완료했다. 프록시 경유 126개와 웹 컨테이너 직접 30개 검사가 통과했다. HTTP/HTTPS 조건은 테스트 서버 포트로 구분해 로직을 검증하므로 실제 TLS 인증서 통합 검증을 대신하지 않는다. 테스트 종료 후 임시 컨테이너만 제거했으며 기존 서비스 컨테이너 목록이 유지됨을 확인했다.
- 배포는 저장소 AGENTS.md의 로컬 결과 검토 → 해당 변경의 명시적 배포 승인 → GitHub Push/정확한 SHA의 CI 성공 → 배포 → 실제 도메인 재검증 순서로 진행한다. 이번 공개 운영 상태는 변경 전 그대로다.

참고: [Google의 표준 URL 통합 지침](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [Nginx rewrite 처리 순서](https://nginx.org/en/docs/http/ngx_http_rewrite_module.html).

### 수정 후보의 실제 응답 표

- `artifacts/seo-canonical/index-alias-before-after.csv`: 중복 제공된 10개 index 별칭의 운영 수정 전과 수정 후보를 나란히 비교했다.
- `artifacts/seo-canonical/url-candidate-after.csv`: 후보 프록시의 126개 요청별 상태와 Location, 도착 페이지의 별도 HTML/JS 검증 결과다. 공개 배포 후 결과가 아니며 HTTP/HTTPS는 격리 환경에서 포트로 모사했다.
- 원본 검증 결과: `nginx-candidate-results.json` (126개), `nginx-direct-results.json` (30개). 정상 페이지·쿼리 보존·한 번의 이동·404·정적 파일·ACME 예외를 확인했다. 웹 컨테이너 자체의 slash 없는 주소는 기존 301이며, 공개 앞단 후보 규칙이 이를 한 번의 308로 처리한다.
- 검사 도구의 stdin 종료 대기로 첫 실행이 지연되어 수정·재실행했다. 웹 컨테이너 직접 검사에서 기존 slash 301을 308로 기대한 검사 조건도 바로잡았다. 애플리케이션을 실패한 검사에 맞춰 변경하지 않았다.
- 컨테이너 정리 안전 검사 9개와 배포 셸 문법 검사도 통과했다. 증거 자료는 로컬에 보관하며 서버 원본 설정이나 계정 정보는 GitHub에 올리지 않는다.
