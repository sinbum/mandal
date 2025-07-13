# Claude Code용 Task Master 명령어

Claude Code의 슬래시 명령어를 통해 Task Master를 사용하는 완전한 가이드입니다.

## 개요

모든 Task Master 기능은 `/project:tm/` 네임스페이스를 통해 자연어 지원과 지능형 기능으로 이용할 수 있습니다.

## 빠른 시작

```bash
# Task Master 설치
/project:tm/setup/quick-install

# 프로젝트 초기화
/project:tm/init/quick

# 요구사항 파싱
/project:tm/parse-prd requirements.md

# 작업 시작
/project:tm/next
```

## 명령어 구조

명령어는 Task Master CLI와 일치하도록 계층적으로 구성됩니다:
- `/project:tm/[command]`의 메인 명령어
- 특정 작업을 위한 서브명령어 `/project:tm/[command]/[subcommand]`
- 전체적으로 자연어 인수 지원

## 완전한 명령어 참조

### 설정 및 구성
- `/project:tm/setup/install` - 전체 설치 가이드
- `/project:tm/setup/quick-install` - 한 줄 설치
- `/project:tm/init` - 프로젝트 초기화
- `/project:tm/init/quick` - -y 옵션으로 빠른 초기화
- `/project:tm/models` - AI 설정 보기
- `/project:tm/models/setup` - AI 구성

### 태스크 생성
- `/project:tm/parse-prd` - PRD에서 생성
- `/project:tm/parse-prd/with-research` - 향상된 파싱
- `/project:tm/generate` - 태스크 파일 생성

### 태스크 관리
- `/project:tm/list` - 자연어 필터로 목록 보기
- `/project:tm/list/with-subtasks` - 계층적 보기
- `/project:tm/list/by-status <status>` - 상태별 필터
- `/project:tm/show <id>` - 태스크 세부사항
- `/project:tm/add-task` - 태스크 생성
- `/project:tm/update` - 태스크 업데이트
- `/project:tm/remove-task` - 태스크 삭제

### 상태 관리
- `/project:tm/set-status/to-pending <id>`
- `/project:tm/set-status/to-in-progress <id>`
- `/project:tm/set-status/to-done <id>`
- `/project:tm/set-status/to-review <id>`
- `/project:tm/set-status/to-deferred <id>`
- `/project:tm/set-status/to-cancelled <id>`

### 태스크 분석
- `/project:tm/analyze-complexity` - AI 분석
- `/project:tm/complexity-report` - 리포트 보기
- `/project:tm/expand <id>` - 태스크 세분화
- `/project:tm/expand/all` - 복잡한 태스크 모두 확장

### 의존성
- `/project:tm/add-dependency` - 의존성 추가
- `/project:tm/remove-dependency` - 의존성 제거
- `/project:tm/validate-dependencies` - 문제 확인
- `/project:tm/fix-dependencies` - 자동 수정

### 워크플로우
- `/project:tm/workflows/smart-flow` - 적응형 워크플로우
- `/project:tm/workflows/pipeline` - 명령어 연결
- `/project:tm/workflows/auto-implement` - AI 구현

### 유틸리티
- `/project:tm/status` - 프로젝트 대시보드
- `/project:tm/next` - 다음 태스크 추천
- `/project:tm/utils/analyze` - 프로젝트 분석
- `/project:tm/learn` - 대화형 도움말

## 주요 기능

### 자연어 지원
모든 명령어가 자연어를 이해합니다:
```
/project:tm/list pending high priority
/project:tm/update mark 23 as done
/project:tm/add-task implement OAuth login
```

### 스마트 컨텍스트
명령어는 프로젝트 상태를 분석하고 다음을 기반으로 지능적인 제안을 제공합니다:
- 현재 태스크 상태
- 의존성
- 팀 패턴
- 프로젝트 단계

### 시각적 향상
- 진행률 표시줄 및 인디케이터
- 상태 배지
- 정리된 디스플레이
- 명확한 계층구조

## 일반적인 워크플로우

### 일일 개발
```
/project:tm/workflows/smart-flow morning
/project:tm/next
/project:tm/set-status/to-in-progress <id>
/project:tm/set-status/to-done <id>
```

### 태스크 세분화
```
/project:tm/show <id>
/project:tm/expand <id>
/project:tm/list/with-subtasks
```

### 스프린트 계획
```
/project:tm/analyze-complexity
/project:tm/workflows/pipeline init → expand/all → status
```

## 기존 명령어 마이그레이션

| 기존 | 새로운 |
|-----|-----|
| `/project:task-master:list` | `/project:tm/list` |
| `/project:task-master:complete` | `/project:tm/set-status/to-done` |
| `/project:workflows:auto-implement` | `/project:tm/workflows/auto-implement` |

## 팁

1. 명령어 발견을 위해 `/project:tm/` + Tab 사용
2. 모든 곳에서 자연어 지원
3. 명령어가 스마트 기본값 제공
4. 자동화를 위한 명령어 연결
5. 대화형 도움말은 `/project:tm/learn` 확인