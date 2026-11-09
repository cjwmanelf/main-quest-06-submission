# 서비스 코드 실행 안내

이 저장소의 `service/src/`는 원본 프로젝트 커밋 `594ad5a64bc6b88a24e6a0c3228ab870bdae9e06`의 전체 앱 코드다. 서비스 실행에 필요한 `public/`, `supabase/schema.sql`, `package.json`, `package-lock.json`, Next.js/TypeScript/Tailwind 설정, Dockerfile도 포함한다. 대화 파일·실제 키·사용자 DB는 포함하지 않는다.

## 주요 코드

| 경로 | 역할 |
| --- | --- |
| [src/app/briefing/page.tsx](../../service/src/app/briefing/page.tsx) | AI 브리핑 화면 |
| [src/app/api/briefing/route.ts](../../service/src/app/api/briefing/route.ts) | 인증·자료 수집·생성 API |
| [src/lib/briefing/service.ts](../../service/src/lib/briefing/service.ts) | 최종 v6 생성·검증 로직 |
| [src/lib/briefing/anthropic-provider.ts](../../service/src/lib/briefing/anthropic-provider.ts) | Anthropic 응답 추출과 검증 |
| [src/components/BriefingCitations.tsx](../../service/src/components/BriefingCitations.tsx) | 짧은 근거 버튼·상세 모달 |
| [src/app/api/briefing/feedback/route.ts](../../service/src/app/api/briefing/feedback/route.ts) | 피드백 저장 API |
| [src/lib/briefing/telemetry/](../../service/src/lib/briefing/telemetry/) | 트레이스·피드백 기록 |
| [supabase/schema.sql](../../service/supabase/schema.sql) | DB 스키마·RLS 정책 |

## 설치와 실행

Node.js 20.9 이상을 사용한다. 저장소 루트에서 먼저 `service/`로 이동한 뒤 의존성을 설치한다. 아래 npm·기능 검사 명령과 상대 경로는 `service/` 기준이다.

```bash
cd service
npm ci
npm run dev -- --hostname 127.0.0.1
```

Supabase 프로젝트를 준비해 스키마를 적용하고 이메일 인증과 localhost 리다이렉트 URL을 설정한다. 실제 비밀값은 로컬 `.env.local` 또는 배포 환경의 Secret Manager에만 설정한다. 파일은 Git에서 제외된다. 로그인 후 `http://localhost:3000/briefing`에 접속한다. 별도의 서비스와 API 자격증명이 없으면 실제 생성·로그인이 동작하지 않으며 가짜 결과를 반환하지 않는다.

| 환경변수 이름 | 용도 |
| --- | --- |
| NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY | 본인이 준비한 Supabase 인증 설정 |
| SUPABASE_SERVICE_ROLE_KEY | 서버 배치 기능에 사용하는 별도 권한 |
| STOCK_API_KEY | Finnhub 시세·뉴스 |
| SEC_USER_AGENT | SEC 공시 요청용 식별 정보 |
| MARKETAUX_API_KEY | 선택 뉴스 데이터 제공자 |
| BRIEFING_LLM_PROVIDER | Anthropic 사용 시 `anthropic` |
| BRIEFING_LLM_MODEL | 평가에 사용한 값은 `claude-haiku-5-5` |
| ANTHROPIC_API_KEY | 서버에만 설정하는 본인 제공자 키 |
| BRIEFING_FEEDBACK_SECRET | 피드백 서명에 사용하는 비밀값 |
| CRON_SECRET | 배치 API 인증 |

실제 사용 가능한 모델과 제공자 과금은 본인 계정 설정을 따른다. 평가 당시 모델·비용 기록은 REPORT에 있고, 이 문서는 신규 호출을 실행하지 않는다. 트레이스 본문 수집은 기본 비활성화 상태를 유지한다. 세부 옵션은 `src/lib/briefing/provider-config.ts`와 `src/lib/briefing/telemetry/`에서 확인한다.

```bash
npm run build
npm run start
npm run lint
node --test tools/quest-evaluation/test/*.test.mjs
node scripts/briefing-anthropic-check.cjs
node scripts/briefing-v6-check.cjs
node scripts/review-ui-check.cjs
node ../tools/submission/verify.mjs
```

검사 스크립트와 fixtures는 개발자가 작성한 mock·테스트 조건이다. 실제 모델 응답이나 사용자 대화 로그가 아니다. 실제 LLM 호출에는 별도 자격증명과 비용이 필요하다. 배포 경로와 과거 검증은 [Cloud Run 안내](../quest/cloud-run.md), [최종 배포 검증](../quest/reviewed-live-verification.md)에 있다. 이 저장소 생성만으로 새 배포나 자동 배포 연결이 생기지는 않는다.
