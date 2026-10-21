# 공용 웹사이트 방문 분석

소유자는 2026-10-21에 Ubuntu 서버에 Umami와 전용 PostgreSQL을 직접 구성하고 A2O를 연결하도록 승인했다. 이 시스템은 여러 소유 사이트가 공유하며 기존 `pdb`와 독립적으로 운영한다. 다른 사이트의 추적 코드 삽입은 해당 사이트 작업에서 별도로 진행한다.

- 관리 주소: `https://stats.a2o.kr`. 사이트별 Website ID로 분리하고 필요하면 Teams/읽기 전용 계정을 사용한다. 공개 Share URL은 생성하지 않는다.
- 고정 버전: Umami 3.4.0, PostgreSQL 17 Alpine. 서버에서 공식 이미지를 받은 뒤 RepoDigest를 `.env`에 기록한다. 업데이트 시 백업·호환성 검증·새 승인 후 digest를 교체한다.
- 별도 Compose 프로젝트 `web-analytics`, `analytics-postgres-data` 영속 볼륨, DB 전용 브리지 네트워크, 프록시 전용 웹 네트워크. PostgreSQL은 호스트 포트를 열지 않는다. 서버에 Docker의 `DOCKER-INTERNAL` 방화벽 체인이 없어 `internal: true` 생성이 실패했다. 기존 방화벽을 변경하지 않고 일반 전용 브리지로 구성하며 DB 컨테이너의 외부 송신까지 차단하는 설정은 아니다. Umami의 호스트 포트는 SSH 검수용 loopback `127.0.0.1:4371`에만 연다.
- 자원 상한: Umami 1 CPU/1GiB, DB 1 CPU/512MiB. 같은 호스트의 디스크와 CPU를 공유하므로 부하·디스크 증가량을 확인한다. 기존 `pdb`, HGI, n8n은 재시작하지 않는다.
- 관리자 초기 암호는 무작위로 교체하고 서버의 `~/web-analytics/admin-login.json`(0600)에 보관한다. 최초 로그인 시 인증 앱의 2FA 등록을 요구한다. 2FA 암호화 키는 `.env`와 함께 비공개 백업한다. 키·암호·백업은 Git에 넣지 않는다.
- 추적 스크립트 및 `/api/send`는 방문자 브라우저가 접근할 수 있어야 한다. 전체 도메인에 Basic Auth를 걸지 않는다. 관리자 API의 인증과 추적 수집을 구분한다.
- 일일 `pg_dump` 백업(14일 보관), 매일 180일 초과 이벤트 정리. 같은 인스턴스의 별도 복구 검증 DB에 dump를 복원해 검증한다. 외부 백업 저장소는 아직 지정되지 않았으며 같은 서버의 백업만으로 서버 손실을 복구할 수 없다.

## A2O 수집 범위

페이지 경로, 외부 유입 경로, 브라우저·기기·국가와 다음 행동만 수집한다. URL 검색어/해시를 제거하며 이름·이메일·계정 식별자·입력 내용·세션 녹화·히트맵은 추가하지 않는다. 국가 판별에는 수신 IP를 사용하므로 프록시의 실제 IP 전달도 검증한다. 쿠키 사용 여부만으로 개인정보 처리의 적정성을 단정하지 않는다.

| 이벤트                  | 발생 시점                             |
| ----------------------- | ------------------------------------- |
| `orbit_story_start`     | 이야기 처음 시작/다시 시작            |
| `orbit_story_complete`  | 마지막 장 재생 완료, 완료 상태당 1회  |
| `orbit_mode_change`     | 사용자가 태양계/은하 궤적 버튼 선택   |
| `orbit_target_select`   | 사용자가 가까이 볼 천체 선택          |
| `scale_target_select`   | 사용자가 목록/이전·다음으로 대상 선택 |
| `article_explorer_open` | 기사에서 궤도/크기 탐험기 링크 클릭   |

카메라·공전·자전·슬라이더 애니메이션 프레임은 이벤트로 기록하지 않는다. 속성은 대상 ID·모드·기사 경로 등 정해진 값만 사용한다. 비동기 스크립트 및 전송 실패는 사이트 기능을 차단하지 않는다.

개발 모드, localhost·미리보기 도메인, 자동화 브라우저는 수집하지 않는다. 실제 PC/휴대폰의 검수 브라우저에서는 A2O 개발자 콘솔에서 `localStorage.setItem('umami.disabled', '1')`을 한 번 실행한다. 브라우저/기기마다 설정해야 하며, 제거하려면 `localStorage.removeItem('umami.disabled')`를 실행한다. 관리자 로그인 자체는 검수 방문을 제외하지 않는다.

## 설치·운영

`deploy/analytics/install.py`, `compose.yml`, `maintenance.py`, `npm-analytics.mjs`를 서버 `~/web-analytics/`에 복사한다. 먼저 해당 소스를 GitHub에 Push하고 정확한 커밋의 CI 성공을 확인한다. 설치기는 비공개 환경값을 생성하고 별도 DB·앱만 올린다. DNS는 소유자가 설정한다. DNS 확인 후 NPM에서 새 호스트/인증서만 구성한다. 기존 프록시 파일과 컨테이너 시작 상태를 전후 비교한다.

수동 백업/정리: `python3 ~/web-analytics/maintenance.py`. 수동 복구 시험: `python3 ~/web-analytics/maintenance.py --restore-test`. 이 시험은 고정 이름의 임시 검증 DB만 만들고 삭제하며 실제 통계 DB는 유지한다.

다른 사이트 연결 시 관리자에서 별도 Website를 등록해 발급된 스크립트를 해당 사이트에 넣는다. 사이트별 접근 권한·검수 제외·개인정보 안내를 점검한다. 기존 사이트들의 코드는 이 설치에서 일괄 수정하지 않는다.

참고: [Umami 설치](https://docs.umami.is/docs/install), [추적 API](https://docs.umami.is/docs/tracker-functions), [자체 방문 제외](https://docs.umami.is/docs/exclude-my-own-visits), [2FA](https://docs.umami.is/docs/two-factor-authentication).
