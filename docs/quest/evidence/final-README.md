# 제출용 평가 증거 — 대화 내용 제외

제출 지침은 **서비스 코드와 REPORT.md를 같은 GitHub 저장소에 포함하고, 대화 내용이 담긴 파일과 키는 올리지 않는 것**이다. 이에 맞춰 질문·입력 근거 본문·모델 답변 본문 파일을 제외하고, 평가 사례 구성표와 실제 실행 메타데이터·판정·집계만 제공한다. 서비스 구현은 `service/src/`에 있다.

| 자료 | 공개 범위 |
| --- | --- |
| [q610-case-manifest.json](q610-case-manifest.json) | 최초 개발20·hold-out10의 사례 ID·분류·기준 시각. 질문/근거 본문 없음 |
| [final-consumed-q604-case-manifest.json](final-consumed-q604-case-manifest.json) | v5에서 소비한 별도10사례의 구성 |
| [final-q606-case-manifest.json](final-q606-case-manifest.json) | 최종 독립10사례, 정상5·문제5의 구성 |
| [final-q606-rubrics.json](final-q606-rubrics.json), [protocol](final-q606-protocol.json) | 실행 전 정한 통과 기준·출시 gate |
| [final-v6-metrics.json](final-v6-metrics.json) | 10사례×v2/v6 = 20개 실제 실행의 trace·버전·판정·usage·지연. generatedResult 제거 |
| [final-blind-review.json](final-blind-review.json) | 독립 AI 분석자의 판정과 해설; 사용자 대화 기록 아님 |
| [final-gate.json](final-gate.json) | v2 8/10 → v6 10/10, 중대0·정상회귀0의 최종 판정 |
| [deployed-comparison.json](deployed-comparison.json), [reviewed-smoke.json](reviewed-smoke.json) | 배포 버전별 trace·횟수·지연·비용·상태. 질문 본문 제외 |
| [screenshots/](screenshots/) | 평가기준이 요구한 UI 화면 증빙; 개인 자산·계정 정보 없음 |

정상/문제 데이터셋의 항목 수와 통과 조건 예시는 [REPORT 4절](../../../REPORT.md#requirement-4)에 있다. 분석자는 합성 입력에 대한 실제 모델 응답으로 평가했으며 새 수치를 만들어 대체하지 않았다. 이 제출본에서는 대화 본문을 재채점하거나 같은 입력을 재실행할 수 없다는 한계가 있다. 원시 자료는 로컬 비공개 보관 대상이다. 제출용 검증은 기존 관측치의 연결과 파일 무결성을 확인하며, 의미 재평가를 대체하지 않는다.

```bash
node tools/submission/verify.mjs
```

저장소 루트에서 Node.js 20 이상으로 실행한다. 키·네트워크·모델 호출이 필요 없다. `final-export-manifest.json`은 **현재 제출본**의 해시 목록이며, 이전 공개본의 해시와 구분한다. 변경 전 파일 해시는 `docs/submission/SUBMISSION_PROVENANCE.json`에 기록했다. 기존 검토 문서와 `final-validation.json`의 이전 41파일 검증 기록은 역사적 결과로 보존하며 현재 공개 범위를 뜻하지 않는다.

v1/v2 동결 코드는 각14개 파일을 원본 그대로 유지했다. 최종 v6 서비스의 파일 해시는 `2215a3872265b4770aa4f3a3812d687643b30b0edaae674d07487af19506a970`이다. 실행 방법과 환경변수 이름은 [SERVICE.md](../../service/README.md)를 참고한다. 테스트 코드의 수동 작성 mock은 실제 사용자/모델 대화 로그가 아니다.
