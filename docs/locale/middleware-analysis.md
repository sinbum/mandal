# 미들웨어 구조 분석 보고서

## 현재 미들웨어 구조 (middleware.ts)

### 전체 흐름
```typescript
export async function middleware(request: NextRequest) {
  // 1. 정적 자산 및 API 경로 제외
  // 2. 로케일 별칭 처리 (jp → ja)
  // 3. next-intl 미들웨어 실행 (로케일 감지 및 리다이렉트)
  // 4. 공개 경로 확인 (인증 불필요 페이지)
  // 5. Supabase 인증 미들웨어 실행
}
```

### 각 단계별 세부 분석

#### 1. 정적 자산 및 API 경로 제외 (라인 11-20)
```typescript
if (request.nextUrl.pathname.startsWith('/_next') || 
    request.nextUrl.pathname.startsWith('/static') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/favicon.ico') ||
    request.nextUrl.pathname.startsWith('/logo') ||
    request.nextUrl.pathname.startsWith('/manifest.json')
  ) {
  return NextResponse.next()
}
```
- **목적**: 정적 자산과 API 경로는 다국어 처리 제외
- **동작**: 해당 경로들은 미들웨어 처리 건너뛰고 바로 다음 단계로 진행

#### 2. 로케일 별칭 처리 (라인 22-28)
```typescript
const pathname = request.nextUrl.pathname
if (pathname === '/jp' || pathname.startsWith('/jp/')) {
  const newUrl = request.nextUrl.clone()
  newUrl.pathname = pathname.replace(/^\/jp/, '/ja')
  return NextResponse.redirect(newUrl)
}
```
- **목적**: `/jp` 경로를 `/ja`로 리다이렉트
- **동작**: 일본어 별칭 처리 후 리다이렉트

#### 3. next-intl 미들웨어 실행 (라인 30-38)
```typescript
const intlResponse = intlMiddleware(request);

if (intlResponse && intlResponse.status !== 200) {
  console.log('[Middleware] Intl redirect:', intlResponse.headers.get('location'));
  return intlResponse;
}
```
- **목적**: 다국어 라우팅 처리
- **현재 설정**: `localeDetection: false`로 자동 언어 감지 비활성화
- **동작**: 리다이렉트 응답이 있으면 즉시 반환

#### 4. 공개 경로 확인 (라인 40-61)
```typescript
const updatedPathname = request.nextUrl.pathname;
const locale = updatedPathname.split('/')[1]; // /ko/auth/login -> ko
const pathWithoutLocale = updatedPathname.replace(`/${locale}`, '') || '/';

const publicPaths = [
  '/', '/auth/login', '/auth/signup', '/auth/confirm', '/auth/logout', '/error'
];

if (publicPaths.includes(pathWithoutLocale)) {
  return intlResponse || NextResponse.next();
}
```
- **목적**: 인증이 필요없는 페이지 식별
- **동작**: 공개 페이지는 인증 체크 건너뛰고 응답 반환

#### 5. Supabase 인증 미들웨어 실행 (라인 63-64)
```typescript
return await updateSession(request);
```
- **목적**: 인증이 필요한 페이지의 세션 확인
- **동작**: Supabase 인증 미들웨어로 최종 처리

## 현재 i18n 설정 분석 (routing.ts)

### 주요 설정값
```typescript
export const routing = defineRouting({
  locales: ['ko', 'en', 'ja'],
  defaultLocale: 'ko',
  localeDetection: false,    // 🚨 자동 언어 감지 비활성화
  localePrefix: 'always',    // 모든 경로에 언어 코드 표시
  pathnames: { ... }
});
```

### 문제점
- **localeDetection: false**: Accept-Language 헤더 및 IP 기반 감지 비활성화
- **고정된 defaultLocale**: 모든 사용자가 `/ko/`로 리다이렉트
- **사용자 경험 저하**: 해외 사용자 수동 언어 변경 필요

## 언어 감지 로직 추가 위치 결정

### 최적 위치: 라인 30 이전 (next-intl 미들웨어 실행 전)
```typescript
export async function middleware(request: NextRequest) {
  // 1. 정적 자산 제외
  // 2. 로케일 별칭 처리
  
  // 🆕 3. IP 기반 언어 감지 로직 추가 위치
  const detectedLocale = await detectLocale(request);
  
  // 4. 동적 라우팅 설정으로 next-intl 미들웨어 실행
  const dynamicRouting = {
    ...routing,
    defaultLocale: detectedLocale,
    localeDetection: true  // 활성화
  };
  const intlMiddleware = createIntlMiddleware(dynamicRouting);
  
  // 5. 나머지 로직 (공개 경로, 인증)
}
```

### 추가 위치 선택 이유
1. **정적 자산 제외 이후**: 불필요한 언어 감지 방지
2. **별칭 처리 이후**: 정규화된 경로에서 언어 감지
3. **next-intl 미들웨어 이전**: 감지된 언어로 동적 라우팅 설정
4. **공개 경로 확인 이전**: 언어 설정 후 인증 체크

## 필요한 새로운 구조

### 1. 유틸리티 함수들
```typescript
// 언어 감지 관련
async function detectLocale(request: NextRequest): Promise<string>
function detectLocaleFromIP(request: NextRequest): Promise<string | null>
function detectLocaleFromHeaders(request: NextRequest): string | null

// IP 처리 관련
function getClientIP(request: NextRequest): string | null
function isLocalIP(ip: string): boolean

// 매핑 관련
function mapCountryToLocale(country: string): string
function isValidLocale(locale: string): boolean
```

### 2. 타입 정의
```typescript
interface GeoLocation {
  country: string;
  region?: string;
  city?: string;
}

interface LocaleDetectionResult {
  locale: string;
  source: 'url' | 'cookie' | 'ip' | 'header' | 'default';
  confidence: number;
}

// 기존 타입 확장
type Locale = 'ko' | 'en' | 'ja';
```

### 3. 상수 정의
```typescript
const COUNTRY_LOCALE_MAP: Record<string, Locale> = {
  'KR': 'ko',
  'JP': 'ja',
  'US': 'en',
  'GB': 'en',
  // ...
};

const SUPPORTED_LOCALES: Locale[] = ['ko', 'en', 'ja'];
const DEFAULT_LOCALE: Locale = 'ko';
```

## 성능 고려사항

### 1. 캐싱 전략
- IP 기반 지역 조회 결과 메모리 캐싱
- 캐시 만료 시간: 1시간
- 최대 캐시 크기 제한

### 2. 타임아웃 설정
- 외부 IP 조회 API 호출 시 1초 타임아웃
- 타임아웃 시 다음 감지 방법으로 폴백

### 3. 에러 처리
- 각 감지 방법별 try-catch 처리
- 로그 기록 및 기본값 폴백

## 변경 계획

### 1단계: 기본 구조 준비
- [ ] 유틸리티 함수 파일 생성
- [ ] 타입 정의 추가
- [ ] 상수 정의

### 2단계: 언어 감지 로직 구현
- [ ] IP 기반 감지 함수
- [ ] 브라우저 언어 감지 함수
- [ ] 통합 감지 함수

### 3단계: 미들웨어 통합
- [ ] 기존 미들웨어 수정
- [ ] 동적 라우팅 설정
- [ ] 캐싱 시스템 추가

### 4단계: 테스트 및 최적화
- [ ] 로컬 환경 테스트
- [ ] VPN 환경 테스트
- [ ] 성능 최적화

## 위험 요소 및 대응책

### 1. 기존 기능 영향
- **위험**: 미들웨어 수정으로 인한 기존 기능 오류
- **대응**: 단계별 테스트, 롤백 계획 수립

### 2. 성능 영향
- **위험**: 언어 감지 로직으로 인한 응답 지연
- **대응**: 캐싱, 타임아웃, 비동기 최적화

### 3. 호환성 문제
- **위험**: next-intl 버전 호환성 문제
- **대응**: 현재 버전 고정, 테스트 환경 구축

## 다음 단계
1. 유틸리티 함수 및 타입 정의 파일 생성
2. IP 기반 지역 감지 로직 구현
3. 미들웨어 통합 및 테스트
4. 성능 최적화 및 배포