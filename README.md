# Main Quest 06 — 로그와 피드백으로 AI 브리핑 개선하기

**제출 본문: [REPORT.md](REPORT.md)** · [공개 평가 증거](docs/quest/evidence/final-README.md) · [최종 검토 및 보완 내역](docs/quest/review-reconciliation.md)

**서비스 코드: [service/src/](service/src/)** · [설치·실행 방법](docs/service/README.md) · [제출 규정 반영 및 검증 결과](docs/quest/submission-packaging-check.md)

미국 주식 대시보드의 LLM 브리핑에서 실제 실행 로그로 문제를 찾고, 실패한 실험을 포함해 개선 전후를 비교한 과제입니다. 이 저장소에는 **서비스 전체 코드와 REPORT.md**를 함께 넣고, 대화 내용과 키를 제외한 평가 메타데이터·트레이스, 배포 검증, 화면 캡처, 독립 검토를 모았습니다. README는 안내와 요약이고 과정·결과의 본문은 REPORT.md입니다.

| 연결 | 위치 |
| --- | --- |
| 원본 서비스 구현 | [us-stock-dashboard 고정 커밋](https://github.com/cjwmanelf/us-stock-dashboard/tree/594ad5a64bc6b88a24e6a0c3228ab870bdae9e06) |
| 실제 코드 변경 PR | [PR #7](https://github.com/cjwmanelf/us-stock-dashboard/pull/7) |
| 배포 서비스 | [AI 브리핑](https://modu-rich-quest06-fyzai5fn7a-du.a.run.app/briefing) — 로그인 필요 |
| 최종 배포 확인 | [검토 반영 배포](docs/quest/review-deployment.md), [새 대화 3건 검증](docs/quest/reviewed-live-verification.md) |
| 독립 검토 | [Fable 검토 원문](docs/quest/final-review.md), [후속 코드 검토](docs/quest/review-code-followup.md), [보완 반영표](docs/quest/review-reconciliation.md) |

서비스 코드는 이 저장소의 [service/src/](service/src/)에 있으며 [실행 방법](docs/service/README.md), `service/package.json`·잠금 파일·빌드 설정·DB 스키마를 함께 포함했습니다. 원본 변경 이력은 위 커밋과 PR에서 확인할 수 있습니다. 제출 자료를 읽는 데는 원본 앱 실행이나 로그인이 필요하지 않습니다. 이 저장소의 `service/tools/quest-evaluation/versions/`는 평가 당시 v1/v2 코드의 동결 사본이며 현재 배포 코드가 아닙니다.

## REPORT.md 필수 내용 7가지

| 항목 | 보고서에 정리한 내용 | 본문 및 증거 |
| --- | --- | --- |
| 1. 로그 | 분석한 트레이스·피드백 수, 직접 만든 대화의 제작 방법과 실제 모델 호출 구분 | [1절](REPORT.md#requirement-1), [사례 구성과 실행 메타데이터](docs/quest/evidence/final-README.md) |
| 2. 문제 후보 | 현상, 근거 trace ID, 반복 횟수·분모, 처음 어긋난 단계, 사용자 노출 여부 | [2절](REPORT.md#requirement-2), [baseline 분석](docs/quest/live-baseline-analysis.md) |
| 3. 고른 문제와 이유 | 빈도·영향·수정 비용 비교표와 native text 추출 문제의 우선 선정 이유 | [3절](REPORT.md#requirement-3) |
| 4. 데이터셋과 기준 | 정상/문제 항목 수, 사례별 통과 조건, 실행 전 고정한 출시 기준 | [4절](REPORT.md#requirement-4), [사전 protocol](docs/quest/evidence/final-q606-protocol.json), [rubric](docs/quest/evidence/final-q606-rubrics.json) |
| 5. 바꾼 것과 전후 비교 | v2~v5 실패 실험, v6 결과, 변경 내용, PR 링크 | [5절](REPORT.md#requirement-5), [최종 판정](docs/quest/evidence/final-gate.json), [PR #7](https://github.com/cjwmanelf/us-stock-dashboard/pull/7) |
| 6. 배포 뒤 확인 | 버전별 새 대화의 동일 현상 횟수, 지연 시간·비용, 화면 캡처 | [6절](REPORT.md#requirement-6), [배포 전후 비교](docs/quest/deployed-live-verification.md), [최종 배포 확인](docs/quest/reviewed-live-verification.md) |
| 7. 회고 | 어려웠던 점, 평가의 한계, 실제 사용자에게 수집할 로그·피드백 계획 | [7절](REPORT.md#requirement-7) |

## 평가기준 5가지 대응표

| 평가기준 | 제출 근거 |
| --- | --- |
| 1. 문제 후보 3개 이상, 근거 트레이스와 반복 횟수 | [REPORT 2절](REPORT.md#requirement-2)에 추출 실패·코드펜스·빈 인용 계약·날짜 의미 등 4개 후보와 배포 후 출처 가독성 후보를 기록했습니다. 실제 노출 오류와 추출 실패에 가려진 잠재 오류를 구분했습니다. |
| 2. 빈도·영향·수정 비용으로 우선순위 선정 | [REPORT 3절](REPORT.md#requirement-3)의 비교표로 19/19 모델 응답에서 반복된 추출 실패를 먼저 선택한 이유를 설명했습니다. |
| 3. 문제/정상 데이터셋으로 개선 전후 비교 | [REPORT 4~5절](REPORT.md#requirement-4), 정상5·문제5인 최종 hold-out의 [실행 메타데이터 20개](docs/quest/evidence/final-v6-metrics.json)와 [판정](docs/quest/evidence/final-blind-review.json): v2 8/10 → v6 10/10. |
| 4. 배포 뒤 새 대화 트레이스를 버전별로 비교 | [REPORT 6절](REPORT.md#requirement-6): v1·v6 각각 새 대화 3건, 생성 불가 3/3 → 0/3. 이후 검토 반영 최종 revision에서도 새 대화 3건을 별도 확인했습니다. |
| 5. 과정과 결과를 REPORT.md에 정리 | [REPORT.md](REPORT.md)에 7개 본문 절, 실패 실험, PR, 평가·배포 증거, 회고를 연결했습니다. |

## 주요 관찰 결과와 해석 범위

- 로컬 서비스 실행 183건 중 실제 모델 호출은 171건입니다. 배포 후 트레이스 10건은 별도로 집계했습니다.
- 기존 사용자 로그가 없어 직접 만든 합성 입력으로 실제 모델을 호출했습니다. 서로 다른 입력은 개발20 + hold-out10씩 3세트 = 50개입니다. 제출 지침에 따라 질문·모델 답변 본문은 제외하고 사례 구성·평가 기준·실행 메타데이터를 공개했습니다.
- 최종 미사용 hold-out에서 v2 8/10 → v6 10/10, 중대 오류0·정상 회귀0으로 사전 gate를 통과했습니다. 해당 hold-out은 이제 사용 완료됐습니다.
- 배포 비교는 v1·v6 각각 3건의 작은 운영 표본입니다. 두 시점의 수집 근거가 완전히 같지 않으므로 고정 데이터셋 실험과 구분합니다.
- 실제 사용자 정성 피드백1건, AI 운영자의 피드백 저장 기능 시험1건, 사람의 숫자 만족도 평가는0건입니다. AI 평가를 실제 사용자 만족도로 주장하지 않습니다.
- 최종 수정 배포는 `modu-rich-quest06-reviewed-20261109`이며, 확인 시점은 2026-11-09입니다. 이후 서비스 상태와 과금은 달라질 수 있습니다.

## 자료 구성과 검증

```text
README.md                  제출 안내·필수 7개 항목·평가기준 5개
REPORT.md                  제출 본문
service/                   전체 서비스 코드·의존성·빌드/배포 설정
  src/                     앱 화면·API·브리핑 로직
  scripts/                 기능 검사·배포 도구
  tools/quest-evaluation/  평가 도구·동결 v1/v2 코드
docs/
  service/                 실행 안내·제품 정의
  quest/                   실험·평가·배포·검토·스크린샷
  submission/              제출 파일 해시·출처 기록
tools/submission/          제출본 검증 도구
```

서비스를 실행하려면 먼저 `service/`로 이동합니다. 환경설정은 [실행 안내](docs/service/README.md)를 따릅니다.

```bash
cd service
npm ci
npm run dev -- --hostname 127.0.0.1
```

제출 파일 검증은 Node.js 20 이상에서 **저장소 루트**에서 실행합니다. 패키지 설치, API 키, 모델 호출은 필요하지 않습니다.

```bash
node tools/submission/verify.mjs
```

현재 제출 파일 해시, 평가 증거의 해시, Markdown/HTML의 내부 파일 링크와 앵커, 최종 사례10개·실행 메타데이터20개의 판정 연결을 확인합니다. 이 검증은 기존 증거의 무결성 검사이며 새로운 모델 평가가 아닙니다. 대화 본문을 제외한 공개 범위와 검증의 한계는 [평가 증거 안내](docs/quest/evidence/final-README.md)를 참고하세요.

웹 보고서를 보려면 저장소를 내려받아 루트에서 `python -m http.server 8767 --bind 127.0.0.1`을 실행하고 `http://127.0.0.1:8767/docs/quest/review/index.html`을 엽니다. GitHub는 HTML 파일을 웹페이지 대신 소스로 표시하므로, GitHub에서 읽을 때는 [Markdown 검토 보고서](docs/quest/final-review.md)를 이용하면 됩니다.

## 공개 범위

제출 규정에 맞춰 서비스 코드와 분석·검증 자료를 모았습니다. 질문·모델 답변 본문을 담은 파일은 제외했습니다. 개인 자산현황·보유 수량·계좌 정보·환경변수 파일·API 키·비공개 원시 로그는 포함하지 않았습니다. 화면 캡처는 브리핑과 평가 증빙 화면입니다. 실제 시장정보를 사용하는 배포 기록과 합성 평가 입력은 문서에서 구분했습니다.

출처는 원본 커밋 `594ad5a64bc6b88a24e6a0c3228ab870bdae9e06`입니다. 이번 변경은 제출 구성 수정이며 새 모델 호출이나 재배포는 하지 않았습니다. 서비스·동결 소스와 화면 증빙의 바이트를 보존했습니다. JSON·CSV에서는 질문·답변 본문을 제외했으며, 문서의 링크·공개 범위 안내와 해시 목록을 갱신했습니다. 파일별 원본/제출 해시와 변환 종류는 [출처 기록](docs/submission/SUBMISSION_PROVENANCE.json)에 있습니다. 원본 보고서의 과거 검토 결과는 당시 상태에 대한 기록입니다.
