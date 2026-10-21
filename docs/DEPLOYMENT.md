# A2O 우분투 배포

사용자가 2026-10-21 `a2o.kr` 공개 배포를 승인했다. DNS는 사용자가 관리한다.
기존 HGI·API·업무 서비스는 그대로 두고 A2O만 별도로 배포한다.

```text
https://a2o.kr → 기존 Nginx Proxy Manager → a2o-web 전용 네트워크
                                         → a2o-<UTC 릴리스 ID>:8080
```

- SvelteKit `adapter-static` 유지. 서버에서 Bun 잠금 파일로 설치하고 타입 검사·단위 테스트·정적 빌드 후 비루트 Nginx로 제공한다.
- `/home/b2670/a2o`에 소스 패키지·릴리스·현재/직전 상태를 보관한다. SSH 접속은 기존 로컬 SSH agent와 키를 사용한다. 비밀 키·암호는 복사하지 않는다.
- `/build-info.json`에 실제 소스 커밋·소스 SHA-256·UTC 빌드 시각·릴리스 ID를 제공한다.
- 새 컨테이너의 healthcheck와 NPM 내부에서의 버전 확인을 통과해야 A2O 호스트만 전환한다. 컨테이너 포트는 외부에 직접 열지 않는다.
- 기존 NPM Compose override에는 A2O 외부 네트워크만 병합한다. 병합 전후 전체 Compose 구성이 그 네트워크 외에는 같은지 검사하고, 기존 스택은 재시작하지 않는다. NPM 재생성 시 기존처럼 기본 파일과 override를 함께 사용해야 한다.
- 초기 NPM SQLite 백업과 기존 서비스/프록시 설정 감사 기록은 서버의 A2O `state/`에 비공개로 보관한다. 이 자료를 웹 루트나 소스 패키지로 복사하지 않는다.
- HTTPS는 A2O·www 전용 Let's Encrypt 인증서를 기존 NPM에서 발급·갱신한다. `www`는 `https://a2o.kr`로 정규화한다. HGI 인증서를 재사용하지 않는다.
- HTML은 재검증, 해시 자원은 1년 immutable, 기타 파일은 1시간 재검증, 오류와 버전/health 응답은 no-store로 제공한다. 텍스트는 gzip으로 제공하며 이전 릴리스의 해시 자원도 보존한다.
- 폰트 OFL과 궤도 텍스처·Three.js·ERFA 라이선스를 빌드에 유지한다. 폰트 응답은 OFL 파일 링크를 제공한다. 공개 사이트에는 검수용 noindex를 추가하지 않는다.

프로젝트 폴더에서:

```powershell
bun run check
bun run lint
bun run test
git status
# 검증한 변경을 실제 시각의 로컬 Git 커밋으로 기록한 뒤:
bun run deploy          # 포장 → 업로드 → Linux 검사·빌드 → 정상 확인 → A2O 전환 → HTTPS
bun run deploy:status   # 현재 A2O 연결
bun run deploy:verify   # 실제 공개 HTTP·캐시·라이선스·모바일/PC 화면 확인
bun run deploy:rollback # 직전 정상 버전으로 복귀. 다시 실행하면 두 버전을 교환
bun run deploy:tls      # DNS 준비 후 HTTPS 연결을 재시도할 때
```

배포는 깨끗한 Git 작업 트리에서만 허용한다. 소스·정적 자원·빌드 설정과 배포 파일만 포장하며,
`.git`, 의존성 캐시, 캡처, 검토 자료, 로컬 자격 증명은 업로드하지 않는다.
이미지·컨테이너·과거 릴리스 정리는 별도 검토 후 수행한다. 기존 HGI 명령은 A2O 배포에 사용하지 않는다.

NPM 내부 모듈 API는 현재 설치 버전에서 검증한다. NPM 업그레이드 후에는 A2O 상태·전환·TLS를 다시 확인한다.

## 공개 배포 검증 — 2026-10-21

- 현재 공개 주소: `https://a2o.kr`. HTTP는 HTTPS로, `https://www.a2o.kr`은 apex 주소로 이동한다.
- 현재 릴리스: `20261021T015940Z`. 직전 정상 릴리스: `20261021T015433Z`.
- 두 릴리스의 검증된 사이트 소스 커밋: `d17054fbfd2b34864e4b3083a280f7506b881920`. 배포 완료 기록은 이 커밋 이후 문서에 추가했다. 공개 `/build-info.json`에는 실제 빌드에 사용한 커밋이 남는다.
- 실제 DNS 확인: apex A `112.167.19.32`, www CNAME `a2o.kr`. DNS를 변경하지 않았다.
- 전용 인증서가 두 호스트에서 정상 검증되며, 현재 만료일은 2027-01-19 UTC다. 갱신은 기존 NPM 인증서 관리 작업에서 수행한다.
- Linux 타입 검사·단위 테스트 45개·정적 빌드와 로컬 린트가 통과했다. 기존 Three.js 청크 크기 안내는 남아 있다.
- 공개 사이트의 PC 1440×1000 / 모바일 360×800 Chromium 검증이 통과했다. 홈·크기·이야기 목록, 궤도 로딩과 시간 진행, 스토리 조작 및 4·5장 화면에서 페이지 오류와 자원 요청 실패가 없었다. 모바일은 터치 에뮬레이션이며 실제 기기 성능 검증은 아니다.
- 사이트맵의 6개 페이지 모두 200 응답, 정상 404, HTML 재검증·해시 자원 gzip/immutable·라이선스 제공을 확인했다. 이전 릴리스의 모듈 주소 30개도 재배포 후 정상 응답했다.
- 직전 릴리스 복구 후 공개 버전 정보를 확인하고 최신 릴리스로 다시 전환했다. 전환 후 기존 컨테이너 24개의 ID·시작 시각·재시작 횟수·실행 상태와 프록시 설정 6개의 해시가 유지됐다. 기본 Compose 파일도 동일하다.
- 로컬 증거: `artifacts/deployment/verification.json`, `rollback-result.json`, `server-audit.json`, `network-audit.json` 및 같은 폴더의 실제 PC·모바일 캡처. 감사용 서버 백업은 공개하지 않는다.
