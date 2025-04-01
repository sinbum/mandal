# 만다라트 플래너

만다라트 계획 방법론을 사용하여 목표를 세우고 관리하는 웹 애플리케이션입니다.

## 🚀 주요 기능

- 계층형 만다라트 작성 및 관리
- 목표 달성 상태 추적
- 사용자 계정 관리
- 모바일 및 데스크톱 환경 지원

## 🛠️ 기술 스택

- **프론트엔드**: Next.js, React, TypeScript, Tailwind CSS
- **백엔드**: Supabase (인증, 데이터베이스)
- **상태 관리**: React Hooks
- **배포**: Vercel

## 🏗️ 프로젝트 구조

```
src/
├── app/              # Next.js App Router 페이지
├── components/       # UI 컴포넌트
├── hooks/            # 커스텀 훅
├── services/         # API 서비스
├── types/            # TypeScript 타입 정의
├── utils/            # 유틸리티 함수
└── lib/              # 라이브러리
```

## 🚀 시작하기

1. 저장소 복제
```bash
git clone https://github.com/your-username/mandal-art-planner.git
cd mandal-art-planner
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
`.env.local` 파일을 생성하고 필요한 환경 변수 설정:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. 개발 서버 실행
```bash
npm run dev
```

## 📝 데이터 구조

### 만다라트 (Mandalart)
- 만다라트는 계층형 구조로 설계
- 루트 셀을 중심으로 최대 3단계 깊이까지 확장
- 각 셀은 최대 9개의 하위 셀 보유 가능

### 셀 (Cell)
- 만다라트의 기본 구성 요소
- 주제, 메모, 배경색, 이미지 등의 속성
- 완료 상태 추적 기능

## 🔗 관련 문서

자세한 내용은 `docs/` 디렉토리의 문서를 참조하세요:
- [타입스크립트 타입 정의](docs/types%20mandalart%20ts%201be0672e9334805c923dc8a270f4005b.md)
- [서비스 및 훅 구현](docs/services%20and%20hooks.md)
- [Supabase DB 테이블 설계](docs/Supabase%20DB%20테이블%20설계%201be0672e93348017aabefe4b02f30378.md)

## 🧩 주요 컴포넌트

- `MandalartGrid`: 3x3 그리드 셀 표시
- `MandalartCell`: 개별 셀 컴포넌트
- `CellEditor`: 셀 편집 폼
- `MandalartNavigation`: 셀 간 이동 네비게이션

## 🔑 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.
