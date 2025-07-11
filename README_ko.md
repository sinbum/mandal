# 만다라트 플래너

*다른 언어로 읽기: [English](README.md)*

목표 설정과 달성 추적을 위한 만다라트 계획 방법론을 구현한 종합적인 웹 애플리케이션입니다. 만다라트 기법은 구조화된 9칸 프레임워크를 사용하여 목표를 실행 가능한 하위 목표와 작업으로 세분화합니다.

## 🎯 만다라트란?

만다라트는 일본에서 시작된 목표 설정 프레임워크로, 야구선수 오타니 쇼헤이가 사용하면서 널리 알려졌습니다. 3x3 그리드 구조를 사용하며:
- 중앙 셀에는 주요 목표가 들어갑니다
- 주변 8개 셀에는 하위 목표나 지원 요소가 들어갑니다
- 각 하위 목표는 자체적인 3x3 그리드로 확장하여 세부 실행 계획을 세울 수 있습니다

## ✨ 주요 기능

### 📊 계층형 목표 관리
- **3단계 계층구조**: 메인 목표 → 하위 목표 → 실행 항목
- **인터랙티브 그리드**: 직관적인 3x3 그리드 구조 탐색
- **시각적 진행률 추적**: 모든 단계에서 실시간 완료 비율 확인
- **색상 코딩 조직**: 미리 정의된 색상 체계로 셀 사용자화

### 🎨 현대적인 사용자 경험
- **모바일 우선 디자인**: 모바일과 데스크톱 모두에 최적화
- **터치 인터랙션**: 모바일 기기를 위한 길게 누르기 컨텍스트 메뉴
- **부드러운 애니메이션**: Framer Motion 기반 전환 및 인터랙션
- **다크/라이트 모드**: 시스템 설정 감지 지원 테마

### 🔐 사용자 관리
- **보안 인증**: Supabase 기반 사용자 인증
- **개인 데이터**: 각 사용자가 자신만의 비공개 만다라트 관리
- **세션 관리**: 브라우저 세션 간 지속적인 로그인

### 📱 크로스 플랫폼 지원
- **반응형 디자인**: 다양한 화면 크기에 완벽 적응
- **PWA 준비**: 프로그레시브 웹 앱 기능
- **iOS 안전 영역**: 기기 노치 및 홈 인디케이터 적절한 처리

## 🛠️ 기술 스택

### 프론트엔드
- **[Next.js 15](https://nextjs.org/)** - App Router가 적용된 React 프레임워크
- **[React 19](https://react.dev/)** - 동시성 기능이 포함된 최신 React
- **[TypeScript](https://www.typescriptlang.org/)** - 타입 안전 개발
- **[Tailwind CSS 4.0](https://tailwindcss.com/)** - 현대적인 유틸리티 우선 스타일링
- **[Framer Motion](https://www.framer.com/motion/)** - 고급 애니메이션

### 백엔드 및 서비스
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service
  - PostgreSQL 데이터베이스
  - 인증 및 사용자 관리
  - 실시간 구독
  - 행 수준 보안(RLS)

### UI 컴포넌트 및 라이브러리
- **[Radix UI](https://www.radix-ui.com/)** - 접근 가능한 컴포넌트 프리미티브
- **[shadcn/ui](https://ui.shadcn.com/)** - 아름답게 디자인된 컴포넌트
- **[Lucide React](https://lucide.dev/)** - 현대적인 아이콘 라이브러리
- **[Sonner](https://sonner.emilkowal.ski/)** - 토스트 알림
- **[React Hook Form](https://react-hook-form.com/)** - 검증 기능이 있는 고성능 폼

### 개발 도구
- **[ESLint](https://eslint.org/)** - 코드 린팅 및 포맷팅
- **[Turbopack](https://turbo.build/pack)** - 개발용 초고속 번들러
- **Path Aliases** - `@/` 접두사로 깔끔한 임포트

## 🏗️ 프로젝트 아키텍처

### 디렉토리 구조
```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # 보호된 대시보드 라우트
│   │   └── app/           # 메인 애플리케이션 페이지
│   ├── auth/              # 인증 페이지
│   └── page.tsx           # 랜딩 페이지
├── components/            # React 컴포넌트
│   ├── animations/        # Framer Motion 컴포넌트
│   ├── auth/              # 인증 컴포넌트
│   ├── dashboard/         # 대시보드 전용 컴포넌트
│   ├── landing/           # 랜딩 페이지 컴포넌트
│   ├── layout/            # 레이아웃 컴포넌트
│   └── ui/                # 재사용 가능한 UI 컴포넌트
├── hooks/                 # 커스텀 React 훅
├── services/              # API 서비스 레이어
├── types/                 # TypeScript 타입 정의
├── utils/                 # 유틸리티 함수
└── lib/                   # 서드파티 라이브러리 설정
```

### 핵심 컴포넌트

#### MandalartGrid
전통적인 만다라트 레이아웃으로 셀을 표시하는 메인 3x3 그리드 컴포넌트입니다.
- 셀 위치 지정 및 네비게이션 처리
- 시각적 상태 관리(빈 칸, 완료, 활성)
- 터치 및 마우스 인터랙션 지원

#### MandalartCell
풍부한 기능을 가진 개별 셀 컴포넌트:
- 주제 및 메모 텍스트 표시
- 색상 사용자화
- 완료 상태 토글
- 액션을 위한 컨텍스트 메뉴(편집, 삭제, 완료 표시)

#### CellEditorForm
셀 생성 및 편집을 위한 모달 폼:
- 주제 및 메모 입력 필드
- 색상 팔레트 선택
- Zod를 사용한 폼 검증
- 자동 저장 기능

#### 네비게이션 시스템
계층 레벨 간 브레드크럼 기반 네비게이션:
- 상위 레벨로 돌아가기 네비게이션
- 시각적 경로 표시
- 딥 링킹 지원

### 데이터 아키텍처

#### 핵심 데이터 모델
```typescript
interface MandalartCell {
  id: string;                    // 고유 식별자
  topic: string;                 // 셀 제목/주제
  memo?: string;                 // 추가 메모
  color?: string;                // 배경색
  imageUrl?: string;             // 선택적 이미지
  isCompleted: boolean;          // 완료 상태
  parentId?: string | null;      // 부모 셀 참조
  depth: number;                 // 계층 레벨(0-2)
  position: number;              // 그리드 위치(1-9)
  mandalartId?: string;          // 루트 만다라트 참조
  children?: MandalartCell[];    // 자식 셀(UI 전용)
  progressInfo?: {               // 진행률 추적
    totalCells: number;
    completedCells: number;
    progressPercentage: number;
  };
}
```

#### 데이터베이스 스키마
- **mandalarts** - 루트 만다라트 레코드
- **mandalart_cells** - 개별 셀 데이터
- **user_profiles** - 확장된 사용자 정보
- RLS 정책으로 데이터 프라이버시 보장

### 서비스 레이어 아키텍처

#### MandalartService 클래스
모든 Supabase 작업을 처리하는 중앙집중식 API 서비스:
- 셀과 만다라트의 CRUD 작업
- 실시간 데이터 동기화
- 데이터베이스 함수를 통한 진행률 계산
- 오류 처리 및 재시도 로직

#### 커스텀 훅
- **useMandalart** - 메인 데이터 관리 및 상태
- **useMandalartNavigation** - 셀 간 네비게이션
- **useCellOperations** - 셀 CRUD 작업
- **useFormState** - 폼 상태 관리

## 🚀 시작하기

### 전제 조건
- Node.js 18+ 및 npm
- Supabase 계정 및 프로젝트
- 버전 관리를 위한 Git

### 설치

1. **저장소 복제**
   ```bash
   git clone https://github.com/your-username/mandalart-planner.git
   cd mandalart-planner
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **환경 설정**
   루트 디렉토리에 `.env.local` 파일 생성:
   ```env
   # Supabase 설정
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # 선택사항: 마이그레이션을 위한 데이터베이스 직접 연결
   DATABASE_URL=your_postgres_connection_string
   ```

4. **데이터베이스 설정**
   
   Supabase SQL 에디터에서 `docs/Supabase-DB-Schema.md`의 SQL 스키마를 실행하여 다음을 생성:
   - 테이블 (mandalarts, mandalart_cells, user_profiles)
   - 데이터 보안을 위한 RLS 정책
   - 진행률 계산을 위한 데이터베이스 함수

5. **개발 서버**
   ```bash
   npm run dev
   ```
   브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.

6. **샘플 데이터 (선택사항)**
   ```bash
   npm run sample-data
   ```

### 프로덕션 배포

#### Vercel (권장)
1. GitHub 저장소를 Vercel에 연결
2. Vercel 대시보드에 환경 변수 추가
3. main 브랜치에 푸시할 때 자동 배포

#### 프로덕션용 환경 변수
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
```

## 📚 개발 가이드

### 사용 가능한 스크립트

- `npm run dev` - Turbopack으로 개발 서버 시작
- `npm run build` - 프로덕션 빌드 생성
- `npm run start` - 프로덕션 서버 시작
- `npm run lint` - 코드 품질을 위한 ESLint 실행
- `npm run sample-data` - 개발용 샘플 데이터 삽입

### 주요 개발 개념

#### 가상 ID
데이터베이스에 저장되기 전 생성 중인 임시 셀은 `virtual-${timestamp}` ID를 사용합니다.

#### 진행률 계산
실시간 진행률 추적은 Supabase RPC 함수를 사용하여 계층 전체의 완료 비율을 효율적으로 계산합니다.

#### 모바일 최적화
- 터치 타겟 크기는 접근성 가이드라인 준수(최소 44px)
- 컨텍스트 메뉴를 위한 길게 누르기 인터랙션
- iOS 기기를 위한 안전 영역 처리
- 다양한 화면 크기에 맞는 반응형 브레이크포인트

#### 애니메이션 시스템
- 페이지 전환을 위한 Framer Motion
- 커스텀 Tailwind 애니메이션 유틸리티
- 접근성을 위한 모션 감소 지원

### 코드 스타일 가이드라인

#### TypeScript
- 타입 안전성을 위한 엄격 모드 활성화
- `src/types/`에 인터페이스 정의
- 깔끔한 임포트를 위한 경로 별칭 (`@/components/...`)

#### 컴포넌트 구조
- 훅을 사용한 함수형 컴포넌트
- 인라인 또는 타입 파일에 정의된 Props 인터페이스
- 일관된 명명 규칙 (컴포넌트는 PascalCase)

#### 스타일링
- Tailwind CSS 유틸리티 클래스
- `tailwind.config.js`의 커스텀 디자인 토큰
- 현대적인 색상 관리를 위한 OKLCH 색상 공간

## 🔧 API 참조

### 핵심 서비스 메서드

#### MandalartService
```typescript
// 전체 계층구조로 만다라트 가져오기
await mandalartAPI.fetchMandalartWithHierarchy(mandalartId)

// 새 셀 생성
await mandalartAPI.createCell(cellData)

// 기존 셀 업데이트
await mandalartAPI.updateCell(cellId, updates)

// 셀 및 자식 삭제
await mandalartAPI.deleteCell(cellId)

// 진행률 계산
await mandalartAPI.calculateProgress(rootCellId)
```

### 데이터베이스 함수

#### 진행률 계산
```sql
SELECT calculate_mandalart_progress(root_cell_id)
```

#### 셀 계층 쿼리
```sql
SELECT * FROM get_cell_hierarchy(parent_cell_id)
```

## 🎨 디자인 시스템

### 색상 팔레트
애플리케이션은 OKLCH 색상 공간 기반의 정교한 색상 시스템을 사용합니다:

#### 셀 색상
- **빨강**: `oklch(69% 0.18 22)` - 높은 우선순위/긴급 항목
- **주황**: `oklch(75% 0.15 65)` - 중간 우선순위 항목
- **노랑**: `oklch(80% 0.13 85)` - 낮은 우선순위/아이디어
- **초록**: `oklch(68% 0.15 152)` - 완료/성공 항목
- **파랑**: `oklch(69% 0.17 230)` - 정보/학습 목표
- **보라**: `oklch(69% 0.15 290)` - 창의적/개인적 목표
- **분홍**: `oklch(72% 0.15 340)` - 관계/사회적 목표
- **인디고**: `oklch(69% 0.17 264)` - 전문적/커리어 목표

### 타이포그래피
- **기본 폰트**: Pretendard (한국어 최적화)
- **모노스페이스 폰트**: JetBrains Mono
- **반응형 타이포그래피**: 브레이크포인트 간 유동적 크기 조정

### 간격 및 레이아웃
- **8px 기본 단위**: 일관된 간격 시스템
- **터치 타겟**: 접근성을 위한 최소 44px
- **안전 영역**: iOS 기기 호환성
- **반응형 브레이크포인트**: xs(360px), sm(640px), md(768px), lg(1024px), xl(1280px), 2xl(1536px)

## 🧪 테스트 전략

### 단위 테스트
- React Testing Library를 사용한 컴포넌트 테스트
- @testing-library/react-hooks를 사용한 훅 테스트
- Jest를 사용한 서비스 레이어 테스트

### 통합 테스트
- API 엔드포인트 테스트
- 데이터베이스 작업 테스트
- 인증 플로우 테스트

### E2E 테스트
- 중요한 사용자 여정
- 크로스 브라우저 호환성
- 모바일 기기 테스트

## 🚀 성능 최적화

### 프론트엔드 최적화
- **코드 스플리팅**: Next.js App Router로 자동
- **이미지 최적화**: Next.js Image 컴포넌트
- **번들 분석**: 내장 번들 분석기
- **캐싱**: 적극적인 캐싱 전략

### 데이터베이스 최적화
- **인덱싱**: 최적화된 데이터베이스 인덱스
- **RLS 정책**: 효율적인 행 수준 보안
- **쿼리 최적화**: 데이터베이스 라운드트립 최소화
- **실시간**: 선택적 실시간 구독

## 🔒 보안 고려사항

### 인증 및 권한 부여
- Supabase를 통한 JWT 기반 인증
- 행 수준 보안(RLS) 정책
- 미들웨어를 통한 보호된 라우트
- 세션 관리

### 데이터 보호
- 입력 검증 및 살균
- XSS 보호
- CSRF 보호
- SQL 인젝션 방지 (Supabase ORM을 통해)

### 프라이버시
- 사용자 데이터 격리
- 사용자 간 데이터 공유 없음
- 안전한 환경 변수 처리

## 📖 추가 문서

자세한 정보는 `docs/` 디렉토리를 참조하세요:

- **[TypeScript 타입 정의](docs/TypeScript-정의.md)** - 완전한 타입 시스템 문서
- **[서비스 및 훅 구현](docs/Services-Hooks-구현.md)** - 서비스 레이어 및 커스텀 훅
- **[Supabase 데이터베이스 스키마](docs/Supabase-DB-Schema.md)** - 데이터베이스 설계 및 설정
- **[셀 페이지 구조](docs/Cell-Page-구조.md)** - 컴포넌트 아키텍처 세부사항
- **[구현 기록](docs/구현_기록/)** - 개발 이력 및 결정사항

## 🤝 기여하기

1. 저장소 포크
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 열기

### 개발 가이드라인
- TypeScript 엄격 모드 준수
- 새 기능에 대한 테스트 작성
- API 변경사항에 대한 문서 업데이트
- 기존 코드 스타일 및 규칙 준수

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다 - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙏 감사의 글

- **만다라트 방법론** - 일본에서 개발된 원본 기법
- **오타니 쇼헤이** - 현대 목표 설정에서 이 기법을 대중화
- **오픈소스 커뮤니티** - 사용된 놀라운 도구와 라이브러리들

## 📞 지원

- **이슈**: [GitHub Issues](https://github.com/your-username/mandalart-planner/issues)
- **토론**: [GitHub Discussions](https://github.com/your-username/mandalart-planner/discussions)
- **문서**: 자세한 가이드는 `docs/` 디렉토리 참조

---

**Next.js와 Supabase로 ❤️를 담아 제작되었습니다**