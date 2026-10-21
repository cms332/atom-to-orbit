# 움직임 기사 제작 및 검증

작업일: 2026-10-21 KST. 기사 경로: `/articles/why-earth-feels-still/`.

## 원고와 편집

소유자가 제공한 ZIP의 세 Markdown 원문은 `reference/`에 바이트 그대로 보관했다. 원문의 작업 지시를 자동 실행하지 않고, 현재 소유자의 콘텐츠 추가 요청과 저장소 명세에 맞춰 기존 Svelte 기사 구조를 확장했다. 새 원고는 `src/lib/content/motion-article.ts`에, 출처와 SI 속도는 `src/lib/data/motion.ts`에 있다.

기존 A2O 편집 기사를 일반 독자용 과학 설명으로 확장하는 보존 작업이다. 종이색·잉크·청록·구리색, SUIT 파생 폰트, 본문 폭 720px와 기존 출처 목록을 유지했다. Taste 적용값은 `DESIGN_VARIANCE: 5`, `MOTION_INTENSITY: 2`, `VISUAL_DENSITY: 4`다. 사진·장식 애니메이션 대신 원본 과학 SVG를 쓰는 저장소 지침을 우선했다. 기존 기사 두 편과 URL·주 탐색을 보존하고 홈 최신 글·이야기 필터·사이트맵에 새 글을 연결했다.

원고의 ‘태양의 공전 운동’은 ‘지구의 태양 공전’으로 명확히 했다. 일정한 속력이라도 방향이 변하면 가속 운동이라는 점, 지구와 사람이 태양 중력 아래 거의 함께 자유낙하한다는 점, 지표면의 지지력과 자전의 관측 가능성을 구분했다. 태양 중력이 사라진다고 설명하지 않으며 조석 효과에도 출처를 연결했다. ‘이 글을 읽는 약 10초’는 전체 읽기 시간으로 오해되지 않도록 ‘잠시 10초를 떠올려 보세요’로 바꿨다. 약 3분은 원고의 독서 시간 추정치다.

## 과학 자료 확인

모든 자료 확인일은 2026-10-21이다.

| 주장                                               | 확인한 원문                                                                                                                                                                                                      |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 적도 자전 선속도 약 1,670 km/h                     | [NASA Webb Launch](https://science.nasa.gov/mission/webb/launch/), Location 절                                                                                                                                   |
| 태양 중심 평균 지구 공전 속도 29.78 km/s           | [NASA Earth Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html), orbital parameters                                                                                                      |
| 은하 중심 기준 약 230 km/s와 공전 주기 약 2.3억 년 | [NASA Solar System Facts](https://science.nasa.gov/solar-system/solar-system-facts/), 828,000 km/h를 환산                                                                                                        |
| 관성과 중력이 만드는 궤도                          | [ESA FAQ](https://www.esa.int/Science_Exploration/Space_Science/Frequently_asked_questions), 행성 공전 질문                                                                                                      |
| 궤도 운동과 자유낙하                               | [NASA Gravity & Mechanics](https://science.nasa.gov/learn/basics-of-space-flight/chapter3-4/)                                                                                                                    |
| 자전을 체감하기 어려운 이유                        | [NASA Cosmicopia](https://cosmicopia.gsfc.nasa.gov/qa_gp_ev.html), Earth Turning 질문                                                                                                                            |
| 자전의 관측                                        | [Smithsonian Foucault Pendulum](https://amhistory.si.edu/documentsgallery/exhibitions/50th/8.html), [NOAA Coriolis Effect](https://www.nesdis.noaa.gov/about/k-12-education/atmosphere/what-the-coriolis-effect) |
| 태양 중력의 조석 효과                              | [NOAA Tides](https://oceanservice.noaa.gov/education/tutorial_tides/tides02_cause.html)                                                                                                                          |
| 도식의 궤도 계산                                   | [NASA/JPL Approximate Positions](https://ssd.jpl.nasa.gov/planets/approx_pos.html), Table 1                                                                                                                      |

제공된 Smithsonian spotlight URL은 직접 열기에 404를 반환했고 대체 블로그도 응답이 불안정했다. 실제 읽기에 성공한 미국사박물관의 원문 기록으로 연결했다. 그 전시가 현재 운영 중이라고 쓰지 않았다. 10초 동안 약 2,300km는 대표 속도에 10초를 곱한 계산이며 관측 기록이나 실시간 계측이 아니다. 기준계가 다른 속도들을 스칼라로 단순 합산하지 않는다.

## 시각화

- 속도 표시는 세 병렬 항목의 평면적인 `dl`로 만들었다. 수치·단위·기준·근삿값·출처를 함께 제시하고 모바일에서는 한 열로 읽는다.
- 열차의 컵과 물은 일정한 직선 운동과 급제동을 비교하는 정성적 원본 SVG다. 본문과 캡션에서 지구 공전이 가속 운동이라는 차이를 명시했다.
- 기준계 비교는 새 3D 엔진 없이 `orbit-model.ts`의 케플러 위치, 황도–은하 축 변환 및 은하 이동 함수를 재사용한다. 원점은 해당 구간 시작 시 태양 위치로 고정하며, 두 도식의 정사영 방향과 길이 축척은 같다. 기준 전환으로 시각이나 지구–태양 상대 위치를 바꾸지 않는다.
- J2000 + 8년부터 약 1회 공전을 표현한다. 태양 이동 성분은 기존 `EMPHASIZED_SPEED = 1/20`을 공유하며 도식 바로 아래에 표시한다. 천체 기호 크기는 비례가 아니다. 장기간 은하 궤도나 현재 실측 위치라고 부르지 않는다. 탐험기 연결에도 J2000~40년 및 실제 속도 비율 설정을 안내한다. 동작이 없는 가상 쿼리 파라미터는 추가하지 않았다.
- 자동 재생·형태 보간 없이 버튼과 슬라이더를 직접 조작한다. 모션 줄이기에서도 정지 그림과 조작을 유지하고, JavaScript가 꺼지면 두 기준의 도식을 모두 제공한다. 키보드 포커스·선택 상태·그림 설명·캡션·변경 안내를 제공한다.

## 기술 및 검증

- 기존 기사 구조에 선택적 여러 문단·핵심 문장·출처·도해를 추가했다. canonical, OG 및 날짜가 있는 Article JSON-LD를 확인했다. 임의 발행 시각은 만들지 않았으며 `<`를 JSON 이스케이프하여 구조화데이터를 안전하게 삽입했다.
- 글리프를 추가한 SUIT 파생 서브셋은 OFL과 변경된 내부 이름을 유지한다. 이전 폰트 캐시에 없는 글자가 생기지 않도록 파일 SHA-256 앞 12자리로 CSS URL을 버전화하고, 재생성 스크립트에서 함께 갱신한다.
- 타입 검사 **0 errors / 0 warnings**, lint 통과, 단위 테스트 **49 passed**. 새 네 검사는 기준계·투영의 상대 위치 불변성, 고정 원점과 실제 표시 이동 성분, 도식 경계·부분 경로, SI 속도·환산·출처 참조를 검증한다.
- 정적 빌드 통과. 새 기사에 WebGL/Three.js 장면을 넣지 않았으며 브라우저에서도 canvas가 없음을 확인했다. 기존 탐험기의 큰 청크 안내는 이 콘텐츠의 신규 의존성이 아니다.
- PC 1440px / 모바일 390px Chromium 검사 **14 passed / 0 failed / 0 flaky** (36.4초). 새 기사·메타데이터·출처·홈/필터·키보드·기준계 불변성·모션 줄이기·320/768px·실제 계산 글자 크기 200%·JavaScript 비활성 두 도식과 기존 대표 페이지 접근성을 검증했다. 실제 물리 기기 성능을 검증했다는 뜻은 아니다.
- 실제 화면을 직접 확인했다. 보고서와 캡처는 `artifacts/motion-article/`에 있다: `local-results.json`, `desktop/mobile-opening.png`, `desktop/mobile-speeds.png`, `desktop/mobile-train.png`, `desktop/mobile-solar.png`, `desktop/mobile-galactic.png`, `desktop/mobile-home-stories.png` 및 전체 기사 캡처. 재현용 `capture.mjs`도 보관한다.

공개 게시 결과는 실제 배포 후 진행 문서에 별도로 기록한다. DNS와 다른 서비스 설정은 콘텐츠 작업 범위에 포함하지 않는다.
