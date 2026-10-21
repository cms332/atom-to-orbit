# GitHub 관리와 배포 기록

작성일: 2026-10-21. 대상: [cms332/atom-to-orbit](https://github.com/cms332/atom-to-orbit).
소유자가 검토 기록·파일 목록과 기존 이력 포함 공개를 승인했으며 빈 Public 저장소를
생성했다. 기존 커밋과 배포 태그를 보존한다. CI·보호·배포의 실제 결과는 후속 기록으로
구분하며 아래의 준비 명령만으로 완료를 주장하지 않는다.

## 개발 → 검증 → GitHub → 별도 배포

2026-10-21 소유자가 확인한 기본 순서: **로컬 개발·검증 → 로컬 결과 확인 → 커밋·GitHub Push → CI 통과 → 명시적으로 승인된 배포 → 운영 확인**. 배포할 정확한 커밋이 GitHub에 있고 해당 커밋의 CI가 통과했는지 확인한 뒤 배포한다. 최초 공개 이력 승인과 개별 배포 승인은 각각 유지한다.

1. 기존 변경과 겹치지 않는 `codex/<작업명>` 브랜치에서 개발한다.
2. `bun run check`, `bun run lint`, `bun run test`, `bun run build`를 통과시키고
   변경에 맞는 브라우저 검사를 수행한다. 로컬 결과를 소유자에게 보여준다.
3. 실제 시각의 커밋으로 기록하고 변경 이유·검증 결과를 남긴다. GitHub Push와
   PR은 승인된 저장소에 수행한다. 계정 비밀번호·토큰은 파일이나 원격 URL에 넣지 않는다.
4. CI가 통과한 변경을 main에 합친다. 운영 배포는 해당 변경에 대한 소유자의
   별도 배포 지시를 받은 뒤 기존 A2O 배포 절차로 진행한다. 합친 뒤 새 커밋 SHA가
   만들어지면 배포 대상 SHA의 CI도 확인한다. 작업 트리의 미커밋 변경을 섞지 않는다.
5. 배포 결과의 `/build-info.json`에 기록된 commit·release·sourceSha256·builtAt을
   확인하고 사실대로 남긴다. 문서만 추가한 후속 커밋을 배포 소스로 표기하지 않는다.

`.github/workflows/ci.yml`은 타입·린트·단위·정적 빌드·PC/모바일 기사/이동 검사를
수행한다. 권한은 `contents: read`, 공식 액션은 실제 SHA에 고정한다. 서버 키,
배포 Secret, SSH 작업이나 운영 자동 배포는 포함하지 않는다. 로컬 실행 통과와
GitHub Actions에서 실제 실행·통과한 상태는 구분한다.

## 최초 연결

로그인된 계정을 확인하고 README·라이선스·초기 커밋을 자동 생성하지 않은 빈 저장소를
사용한다. 기존 저장소와 충돌하면 중단하고 확인한다. 기존 master를 main으로 이름만
바꾸면 커밋 SHA와 태그는 유지된다. 최초 Push 직전 승인을 다시 확인한다.

```sh
gh api user --jq .login
git status
git branch -m master main
git remote add origin https://github.com/cms332/atom-to-orbit.git
git push -u origin main
git push origin refs/tags/baseline-2026-10-21
# 검토한 deployed-* 태그도 명시적으로 하나씩 전송한다.
```

`git push --mirror`는 사용하지 않는다. Codex의 로컬 작업 복구 ref나 다른
원격 참조를 공개하지 않는다. `--force`, reset, rebase, filter-repo로 기존 이력을
임의로 바꾸지 않는다. `.gitignore`는 과거 커밋의 내용을 제거하지 않는다.

## 앞으로의 SSH 서명 커밋

기존 15개 커밋은 서명되지 않았다. 재작성하거나 과거 시각으로 다시 만들지 않는다.
서명은 설정 이후 새로 작성하는 커밋에 적용한다. 서버 접속 키와 별개의 전용
Ed25519 서명 키를 만들고, 소유자가 로컬에서 암호를 직접 정해 입력한다.
개인 키·암호는 채팅, 저장소, CI에 전달하지 않는다. 다음은 준비 명령이며 아직
실행·설정 완료를 의미하지 않는다.

```powershell
ssh-keygen -t ed25519 -C "A2O Git signing" -f "$env:USERPROFILE\.ssh\a2o_git_signing"
# .pub 파일만 GitHub Settings → SSH and GPG keys → New SSH key → Signing Key로 등록
git config --local user.name cms332
git config --local user.email "136940912+cms332@users.noreply.github.com"
git config --local gpg.format ssh
git config --local user.signingkey "$env:USERPROFILE\.ssh\a2o_git_signing.pub"
git config --local commit.gpgsign true
```

GitHub 계정의 실제 noreply 주소/검증된 이메일을 확인하고 설정한다. 기존 작성자
이메일은 이력에 남는다. SSH agent 또는 안전한 암호 입력 수단을 준비한 후 실제
서명 커밋을 생성하고 GitHub에서 `Verified`를 확인한다. 로컬 `git verify-commit`은
별도 `gpg.ssh.allowedSignersFile` 등록이 필요하다. 전역 Git 설정은 바꾸지 않는다.
[GitHub SSH 서명 안내](https://docs.github.com/en/authentication/managing-commit-signature-verification/telling-git-about-your-signing-key).

## main 보호

최초 이력 업로드와 CI 성공 후 main을 기본 브랜치로 설정한다. 공개 저장소는
GitHub Free에서도 브랜치 보호를 사용할 수 있다. 다음을 적용하고 실제 결과를 확인한다.

- force push·브랜치 삭제 금지, 변경 대화 해결, CI `verify` 통과 요구.
- PR을 통해 변경한다. 단독 운영자가 자기 PR을 합칠 수 있도록 타인의 승인 1개를
  필수로 강제하지 않는다. 관리자 우회 허용 여부는 소유자와 확인한다.
- 향후 서명 등록과 실제 검증을 완료한 뒤 새 커밋의 서명을 요구한다. unsigned
  과거 이력을 다시 만들게 하는 설정을 초기 업로드보다 먼저 적용하지 않는다.

검토 가능한 API 본문은 `.github/main-protection.json`에 있다. CI의 실제 검사명이
`verify`인지 확인한 뒤 `gh api --method PUT repos/cms332/atom-to-orbit/branches/main/protection --input .github/main-protection.json`으로 적용할 수 있다. 현재는 실행하지 않았다.

GitHub에 설정하기 전에는 위 보호가 활성화됐다고 보고하지 않는다.
[공식 브랜치 보호 문서](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches).

## 릴리스

현재 패키지 버전은 `0.1.9`다. 제안된 `v0.1.0`을 자동으로 새 태그로 만들지 않는다.
운영 소스는 기존 `deployed-20261021T050517Z` 태그의
`0cc218289eb856587898db2bdd712f75c5368c75`이며, 미배포 로컬 수정과 구분한다.
첫 GitHub Release는 이 기존 배포 태그를 사용하는 방안을 권장한다. 이름·태그·본문을
소유자가 검토한 뒤 게시한다. GitHub 게시 시각과 실제 서버 배포 시각은 다르다.

Immutable Releases는 저장소 Settings → General → Releases에서 활성화할 수 있다.
활성화 이후 게시된 릴리스의 태그·첨부 파일 변경이 제한되므로 초안을 먼저 준비하고
자산·해시·태그를 검증한 후 게시한다. 설정이 과거 커밋 시각을 증명하거나 과거
커밋을 서명한 것으로 바꾸지는 않는다.
[불변 릴리스 설정](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/establish-provenance-and-integrity/prevent-release-changes).

릴리스 본문에는 실제 사이트 주소, 대상 커밋, 배포 release ID·해시·실제 시각,
당시 검증 결과와 모형의 제한을 기록한다. Wayback은 실제 저장·응답된 보존 URL을
확인했을 때만 기록한다. 아직 보존 요청이나 GitHub Release 게시를 하지 않았다.
검토용 초안: [기존 운영 태그의 릴리스](releases/deployed-20261021T050517Z.md).
