# IP 기반 언어 감지 구현 계획

## 개요
현재 `localeDetection: false` 설정으로 인해 해외 사용자가 접속 시 자동 언어 감지가 되지 않는 문제를 해결하기 위한 구현 계획입니다.

## 현재 미들웨어 분석

### 기존 구조
```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  // 1. 정적 자산 제외
  // 2. 로케일 별칭 처리 (jp → ja)
  // 3. i18n 미들웨어 실행
  // 4. Supabase 인증 미들웨어 실행
}
```

### 문제점
- IP 기반 지역 감지 로직 없음
- 브라우저 언어 감지 비활성화
- 고정된 기본 언어 (ko)

## 구현 방안

### 1. 미들웨어 수정 전략

#### A. 단계별 언어 감지 로직
```typescript
async function detectLocale(request: NextRequest): Promise<string> {
  // 1순위: URL 경로의 언어 코드
  const pathLocale = extractLocaleFromPath(request.nextUrl.pathname);
  if (pathLocale) return pathLocale;
  
  // 2순위: 저장된 사용자 선택 (쿠키)
  const savedLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (savedLocale && isValidLocale(savedLocale)) return savedLocale;
  
  // 3순위: IP 기반 지역 감지
  const geoLocale = await detectLocaleFromIP(request);
  if (geoLocale) return geoLocale;
  
  // 4순위: 브라우저 언어 감지
  const browserLocale = detectLocaleFromHeaders(request);
  if (browserLocale) return browserLocale;
  
  // 5순위: 기본 언어
  return 'ko';
}
```

#### B. IP 기반 지역 감지 구현
```typescript
async function detectLocaleFromIP(request: NextRequest): Promise<string | null> {
  try {
    // Vercel 배포 환경에서는 request.geo 사용
    const country = request.geo?.country;
    
    if (country) {
      return mapCountryToLocale(country);
    }
    
    // 로컬 환경에서는 IP 조회 API 사용 (선택사항)
    const ip = getClientIP(request);
    if (ip && !isLocalIP(ip)) {
      const geoData = await fetchGeoLocation(ip);
      return mapCountryToLocale(geoData.country);
    }
    
    return null;
  } catch (error) {
    console.error('IP 기반 지역 감지 실패:', error);
    return null;
  }
}
```

#### C. 국가-언어 매핑 테이블
```typescript
const COUNTRY_LOCALE_MAP: Record<string, string> = {
  // 한국어
  'KR': 'ko',
  
  // 일본어
  'JP': 'ja',
  
  // 영어권
  'US': 'en',
  'GB': 'en',
  'CA': 'en',
  'AU': 'en',
  'NZ': 'en',
  'IE': 'en',
  
  // 기타 아시아 (영어 기본)
  'CN': 'en',
  'TW': 'en',
  'HK': 'en',
  'SG': 'en',
  'MY': 'en',
  'TH': 'en',
  'VN': 'en',
  'PH': 'en',
  'IN': 'en',
  
  // 유럽 (영어 기본)
  'DE': 'en',
  'FR': 'en',
  'IT': 'en',
  'ES': 'en',
  'NL': 'en',
  'SE': 'en',
  'NO': 'en',
  'DK': 'en',
  'FI': 'en',
};

function mapCountryToLocale(country: string): string {
  return COUNTRY_LOCALE_MAP[country?.toUpperCase()] || 'en';
}
```

### 2. 브라우저 언어 감지 활성화

#### Accept-Language 헤더 파싱
```typescript
function detectLocaleFromHeaders(request: NextRequest): string | null {
  const acceptLanguage = request.headers.get('accept-language');
  if (!acceptLanguage) return null;
  
  // "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7" 형태 파싱
  const languages = acceptLanguage
    .split(',')
    .map(lang => ({
      code: lang.split(';')[0].split('-')[0].trim(),
      quality: parseFloat(lang.split('q=')[1] || '1')
    }))
    .sort((a, b) => b.quality - a.quality);
  
  for (const { code } of languages) {
    if (isValidLocale(code)) {
      return code;
    }
  }
  
  return null;
}
```

### 3. 수정된 미들웨어 구조

```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  // 정적 자산 제외
  if (shouldSkipMiddleware(request)) {
    return NextResponse.next();
  }
  
  // 로케일 별칭 처리
  const aliasResponse = handleLocaleAliases(request);
  if (aliasResponse) return aliasResponse;
  
  // 언어 감지
  const detectedLocale = await detectLocale(request);
  
  // 동적 라우팅 설정으로 i18n 미들웨어 생성
  const dynamicRouting = {
    ...routing,
    defaultLocale: detectedLocale,
    localeDetection: true // 활성화
  };
  
  const intlMiddleware = createIntlMiddleware(dynamicRouting);
  const intlResponse = intlMiddleware(request);
  
  // 언어 선택 쿠키 저장
  if (intlResponse && detectedLocale) {
    intlResponse.cookies.set('NEXT_LOCALE', detectedLocale, {
      maxAge: 60 * 60 * 24 * 365, // 1년
      sameSite: 'lax',
      path: '/'
    });
  }
  
  if (intlResponse && intlResponse.status !== 200) {
    return intlResponse;
  }
  
  // Supabase 인증 미들웨어 실행
  return await updateSession(request);
}
```

### 4. 유틸리티 함수

#### IP 주소 추출
```typescript
function getClientIP(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return request.ip || null;
}
```

#### 로컬 IP 확인
```typescript
function isLocalIP(ip: string): boolean {
  const localPatterns = [
    /^127\./,
    /^192\.168\./,
    /^10\./,
    /^172\.(1[6-9]|2\d|3[0-1])\./,
    /^::1$/,
    /^localhost$/i
  ];
  
  return localPatterns.some(pattern => pattern.test(ip));
}
```

### 5. 지역 조회 API 통합 (선택사항)

#### 무료 IP 지역 조회 서비스
```typescript
async function fetchGeoLocation(ip: string): Promise<{ country: string } | null> {
  try {
    // 무료 서비스 예시 (실제 사용 시 API 제한 확인 필요)
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    
    return {
      country: data.country_code
    };
  } catch (error) {
    console.error('지역 조회 API 호출 실패:', error);
    return null;
  }
}
```

#### 상용 서비스 (추천)
- **MaxMind GeoIP2**: 높은 정확도, 월 1,000회 무료
- **IP2Location**: 다양한 정확도 옵션
- **ipgeolocation.io**: 월 30,000회 무료

## 성능 최적화

### 1. 캐싱 전략
```typescript
// 메모리 캐시 (서버 재시작 시 초기화)
const geoCache = new Map<string, { country: string; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1시간

async function getCachedGeoLocation(ip: string): Promise<{ country: string } | null> {
  const cached = geoCache.get(ip);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return { country: cached.country };
  }
  
  const result = await fetchGeoLocation(ip);
  
  if (result) {
    geoCache.set(ip, {
      country: result.country,
      timestamp: Date.now()
    });
  }
  
  return result;
}
```

### 2. 에러 처리 및 폴백
```typescript
async function detectLocaleFromIP(request: NextRequest): Promise<string | null> {
  try {
    // 타임아웃 설정
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000); // 1초
    
    const country = await Promise.race([
      getGeoLocation(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 1000)
      )
    ]);
    
    clearTimeout(timeoutId);
    
    return mapCountryToLocale(country as string);
  } catch (error) {
    console.error('IP 기반 지역 감지 실패:', error);
    return null; // 폴백 전략으로 다음 감지 방법 사용
  }
}
```

## 테스트 방법

### 1. 로컬 개발 환경
```bash
# 개발 서버 실행
npm run dev

# 다양한 Accept-Language 헤더로 테스트
curl -H "Accept-Language: ja-JP,ja;q=0.9" http://localhost:3000
curl -H "Accept-Language: en-US,en;q=0.9" http://localhost:3000
```

### 2. 모의 지역 테스트
```typescript
// 테스트용 미들웨어 (development 환경에서만)
if (process.env.NODE_ENV === 'development') {
  const mockCountry = request.headers.get('x-mock-country');
  if (mockCountry) {
    request.geo = { country: mockCountry };
  }
}
```

```bash
# 모의 지역 테스트
curl -H "X-Mock-Country: JP" http://localhost:3000
curl -H "X-Mock-Country: US" http://localhost:3000
```

### 3. 배포 환경 테스트
- Vercel 배포 후 실제 지역에서 VPN 테스트
- Preview 환경에서 다양한 국가 IP 확인

## 위험 요소 및 대응책

### 1. 성능 영향
- **위험**: IP 조회 API 호출로 인한 지연
- **대응**: 캐싱, 타임아웃, 비동기 처리

### 2. 정확도 문제
- **위험**: IP 기반 지역 감지의 부정확성
- **대응**: 사용자 수동 선택 옵션, 쿠키 기반 기억

### 3. 프라이버시 이슈
- **위험**: IP 주소 처리 관련 개인정보 보호
- **대응**: IP 주소 로깅 방지, 최소 정보 수집

## 배포 계획

### 1단계: 기본 구현
- 미들웨어 수정
- 국가-언어 매핑
- 기본 폴백 전략

### 2단계: 최적화
- 캐싱 구현
- 성능 모니터링
- 에러 처리 강화

### 3단계: 고도화
- 사용자 언어 선택 UI
- 분석 및 모니터링
- A/B 테스트

## 다음 단계
1. 상세 구현 코드 작성
2. 테스트 코드 개발
3. 성능 벤치마크 수행
4. 단계별 배포 실행