# Mandalart 프로젝트 문서

이 디렉토리는 Mandalart 프로젝트의 설계, 구현, 아키텍처 문서를 포함합니다.

## 📁 문서 구조

### 최신 분석 문서 (2025년)
- `2025-01-12-코드리뷰-안정성분석.md` - 전체 코드베이스 보안 및 안정성 분석
- `2025-01-12-프로젝트구조-리팩토링분석.md` - 아키텍처 개선 및 리팩토링 권장사항

### 개발 기록 (2024년)
- `2024-07-13-수정-history.md` - 주요 개발 변경 내역
- `2024-07-12-Database-Optimization-Analysis.md` - 데이터베이스 최적화 분석
- `2024-06-29-Supabase-DB-Schema.md` - 데이터베이스 스키마 및 테이블 구조
- `2024-06-29-TypeScript-정의.md` - 프로젝트의 주요 타입 정의
- `2024-06-29-Services-Hooks-구현.md` - 서비스 레이어와 커스텀 훅 구현
- `2024-06-29-Cell-Page-구조.md` - 셀 페이지 컴포넌트 구조

### 구현 기록
- `구현_기록/2024-06-29-기능요구사항-상담.md` - 초기 기능 요구사항 정의
- `구현_기록/2024-06-29-와이어프레임-흐름도.md` - UI/UX 와이어프레임
- `구현_기록/2024-06-29-화면-흐름도.md` - 화면 전환 흐름도
- `구현_기록/2024-06-29-Supabase-RPC-서버리스-설계.md` - 서버리스 함수 설계

### 아카이브
- `archive/legacy/` - 레거시 문서 및 더 이상 사용하지 않는 문서들

## 📝 문서 작성 가이드

1. **명명 규칙**: `YYYY-MM-DD-기능명-설명.md` 형식 사용
2. **구조**: 각 문서는 개요, 상세 내용, 코드 예제 순서로 작성
3. **업데이트**: 주요 변경사항 발생 시 새 문서 생성 또는 기존 문서 업데이트
4. **아카이브**: 더 이상 사용하지 않는 문서는 `archive/` 디렉토리로 이동

## 🔄 최신 업데이트 (2025-01-12)

- 전체 코드베이스 보안 및 안정성 분석 완료
- 프로젝트 구조 개선 및 리팩토링 로드맵 작성
- 문서 구조 정리 및 날짜별 정렬 완료
- 레거시 문서들을 아카이브로 이동

## 📊 현재 프로젝트 상태

**전체 평가: GOOD** - 보안 개선이 필요하지만 탄탄한 아키텍처 기반

**주요 강점:**
- 깔끔한 서비스 레이어 아키텍처
- 정교한 캐싱 시스템
- 우수한 TypeScript 활용
- 모바일 퍼스트 디자인

**개선 필요 영역:**
- 입력 검증 및 보안 강화
- 대형 컴포넌트 분해
- 에러 처리 일관성
- 성능 최적화

## 🧩 주요 컴포넌트 및 훅

### 컴포넌트
- `MandalartGrid` - 3x3 그리드로 셀 표시
- `MandalartCell` - 개별 셀 컴포넌트
- `CellEditor` - 셀 편집 폼
- `MandalartNavigation` - 셀 간 이동 네비게이션

### 훅
- `useMandalart` - 만다라트 데이터 관리 및 조작 (핵심 훅)
  - 셀 생성, 편집, 완료 상태 토글, 자식 셀 로드 등 기능 제공
  - 페이지 간 상태 관리 및 데이터 캐싱
- `useMandalartNavigation` - 만다라트 내 경로 및 네비게이션 관리
  - 경로 구성, 상위/하위 셀 이동, 빈 셀 채우기 등 기능

## 🔄 데이터 흐름 구조

```
1. 사용자 액션 → 컴포넌트 이벤트 핸들러 → 훅 함수 호출
2. 훅 내부 처리 → mandalartAPI 서비스 호출 → Supabase 데이터베이스 처리
3. API 응답 → 훅 상태 업데이트 → React 컴포넌트 리렌더링
4. 사용자에게 변경 사항 표시
```

## 🛠️ 주요 기술 스택 및 라이브러리

- **Next.js 15 App Router** - 페이지 및 라우팅
- **React 19 & TypeScript** - 컴포넌트 및 타입 시스템
- **Supabase** - 백엔드 서비스 (인증, 데이터베이스)
- **Tailwind CSS 4.0** - 스타일링
- **ShadcnUI** - UI 컴포넌트 라이브러리
- **Framer Motion** - 애니메이션

자세한 내용은 최신 분석 문서들을 참고하세요.