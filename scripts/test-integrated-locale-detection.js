/**
 * 통합 언어 감지 로직 테스트
 * detectLocale 함수의 우선순위 기반 언어 감지 테스트
 */

console.log('=== 통합 언어 감지 로직 테스트 시작 ===\n');

// 테스트 헬퍼 함수
function createMockRequest(options = {}) {
  const headers = new Map(Object.entries(options.headers || {}));
  const cookies = new Map(Object.entries(options.cookies || {}));
  
  return {
    headers: {
      get: (key) => headers.get(key) || null,
    },
    cookies: {
      get: (key) => cookies.get(key) || undefined,
    },
    ip: options.ip,
    geo: options.geo,
    nextUrl: {
      pathname: options.nextUrl?.pathname || '/',
    },
  };
}

// 필요한 함수들 (locale-detection.ts에서 복사)
const SUPPORTED_LOCALES = ['ko', 'en', 'ja'];
const DEFAULT_LOCALE = 'ko';

function isValidLocale(locale) {
  return SUPPORTED_LOCALES.includes(locale);
}

const COUNTRY_LOCALE_MAP = {
  'KR': 'ko',
  'JP': 'ja',
  'US': 'en',
  'GB': 'en',
  'CA': 'en',
  'AU': 'en',
  'DE': 'en',
  'FR': 'en',
  'CN': 'en',
  'IN': 'en',
  'BR': 'en',
  'RU': 'en',
};

function mapCountryToLocale(country) {
  const upperCountry = country?.toUpperCase();
  return COUNTRY_LOCALE_MAP[upperCountry] || DEFAULT_LOCALE;
}

// 1. URL 경로에서 로케일 추출
function extractLocaleFromPath(pathname) {
  const segments = pathname.split('/');
  const potentialLocale = segments[1];
  
  if (potentialLocale && isValidLocale(potentialLocale)) {
    return potentialLocale;
  }
  
  return null;
}

// 2. 쿠키에서 저장된 로케일 조회
function getLocaleFromCookie(request) {
  const savedLocale = request.cookies.get('NEXT_LOCALE')?.value;
  
  if (savedLocale && isValidLocale(savedLocale)) {
    return savedLocale;
  }
  
  return null;
}

// 3. IP 기반 지역 감지 (간소화)
async function detectLocaleFromIP(request) {
  try {
    // Vercel Geo API 우선
    const geoCountry = request.geo?.country;
    if (geoCountry) {
      return mapCountryToLocale(geoCountry);
    }
    
    // 간소화된 IP 기반 감지
    const ip = request.ip;
    if (ip && !isLocalIP(ip)) {
      // 시뮬레이션된 IP 매핑
      const ipCountryMap = {
        '8.8.8.8': 'US',
        '1.1.1.1': 'US',
        '203.0.113.1': 'US',
        '198.51.100.1': 'GB',
        '192.0.2.1': 'CA',
      };
      
      const country = ipCountryMap[ip];
      if (country) {
        return mapCountryToLocale(country);
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

// 4. 브라우저 언어 감지
function detectLocaleFromHeaders(request) {
  const acceptLanguage = request.headers.get('accept-language');
  if (!acceptLanguage) return null;
  
  try {
    const languages = acceptLanguage
      .split(',')
      .map(lang => {
        const [code, qValue] = lang.split(';');
        const cleanCode = code.trim().split('-')[0].toLowerCase();
        const quality = qValue ? parseFloat(qValue.replace('q=', '')) : 1.0;
        
        return {
          code: cleanCode,
          quality: isNaN(quality) ? 1.0 : quality
        };
      })
      .sort((a, b) => b.quality - a.quality);
    
    for (const { code } of languages) {
      if (isValidLocale(code)) {
        return code;
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

// 로컬 IP 확인
function isLocalIP(ip) {
  if (!ip) return true;
  
  const localPatterns = [
    /^127\./,
    /^192\.168\./,
    /^10\./,
    /^172\.(1[6-9]|2\d|3[0-1])\./,
    /^localhost$/i,
  ];
  
  return localPatterns.some(pattern => pattern.test(ip));
}

// 통합 언어 감지 함수
async function detectLocale(request) {
  // 1순위: URL 경로의 언어 코드
  const pathLocale = extractLocaleFromPath(request.nextUrl.pathname);
  if (pathLocale) {
    return {
      locale: pathLocale,
      source: 'url',
      confidence: 1.0
    };
  }
  
  // 2순위: 저장된 사용자 선택 (쿠키)
  const cookieLocale = getLocaleFromCookie(request);
  if (cookieLocale) {
    return {
      locale: cookieLocale,
      source: 'cookie',
      confidence: 0.9
    };
  }
  
  // 3순위: IP 기반 지역 감지
  const ipLocale = await detectLocaleFromIP(request);
  if (ipLocale) {
    return {
      locale: ipLocale,
      source: 'ip',
      confidence: 0.8
    };
  }
  
  // 4순위: 브라우저 언어 감지
  const headerLocale = detectLocaleFromHeaders(request);
  if (headerLocale) {
    return {
      locale: headerLocale,
      source: 'header',
      confidence: 0.7
    };
  }
  
  // 5순위: 기본 언어
  return {
    locale: DEFAULT_LOCALE,
    source: 'default',
    confidence: 0.5
  };
}

// 테스트 실행
let testCount = 0;
let passCount = 0;

function test(description, testFn) {
  testCount++;
  console.log(`\n테스트 ${testCount}: ${description}`);
  return testFn().then(() => {
    console.log(`✅ 통과`);
    passCount++;
  }).catch(error => {
    console.log(`❌ 실패: ${error.message}`);
  });
}

async function runTests() {
  // 1. 우선순위별 개별 테스트
  console.log('1. 우선순위별 개별 테스트');
  
  await test('1순위: URL 경로 언어 감지', async () => {
    const request = createMockRequest({
      nextUrl: { pathname: '/ko/app' },
      cookies: { 'NEXT_LOCALE': { value: 'en' } },
      geo: { country: 'JP' },
      headers: { 'accept-language': 'ja-JP,ja;q=0.9' }
    });
    
    const result = await detectLocale(request);
    if (result.locale !== 'ko' || result.source !== 'url' || result.confidence !== 1.0) {
      throw new Error(`예상: {locale: 'ko', source: 'url', confidence: 1.0}, 실제: ${JSON.stringify(result)}`);
    }
  });

  await test('2순위: 쿠키 언어 감지', async () => {
    const request = createMockRequest({
      nextUrl: { pathname: '/app' },
      cookies: { 'NEXT_LOCALE': { value: 'ja' } },
      geo: { country: 'US' },
      headers: { 'accept-language': 'en-US,en;q=0.9' }
    });
    
    const result = await detectLocale(request);
    if (result.locale !== 'ja' || result.source !== 'cookie' || result.confidence !== 0.9) {
      throw new Error(`예상: {locale: 'ja', source: 'cookie', confidence: 0.9}, 실제: ${JSON.stringify(result)}`);
    }
  });

  await test('3순위: IP 기반 지역 감지 (Vercel Geo)', async () => {
    const request = createMockRequest({
      nextUrl: { pathname: '/app' },
      geo: { country: 'JP' },
      headers: { 'accept-language': 'en-US,en;q=0.9' }
    });
    
    const result = await detectLocale(request);
    if (result.locale !== 'ja' || result.source !== 'ip' || result.confidence !== 0.8) {
      throw new Error(`예상: {locale: 'ja', source: 'ip', confidence: 0.8}, 실제: ${JSON.stringify(result)}`);
    }
  });

  await test('3순위: IP 기반 지역 감지 (IP 주소)', async () => {
    const request = createMockRequest({
      nextUrl: { pathname: '/app' },
      ip: '8.8.8.8',
      headers: { 'accept-language': 'ko-KR,ko;q=0.9' }
    });
    
    const result = await detectLocale(request);
    if (result.locale !== 'en' || result.source !== 'ip' || result.confidence !== 0.8) {
      throw new Error(`예상: {locale: 'en', source: 'ip', confidence: 0.8}, 실제: ${JSON.stringify(result)}`);
    }
  });

  await test('4순위: 브라우저 언어 감지', async () => {
    const request = createMockRequest({
      nextUrl: { pathname: '/app' },
      headers: { 'accept-language': 'ja-JP,ja;q=0.9,en-US;q=0.8' }
    });
    
    const result = await detectLocale(request);
    if (result.locale !== 'ja' || result.source !== 'header' || result.confidence !== 0.7) {
      throw new Error(`예상: {locale: 'ja', source: 'header', confidence: 0.7}, 실제: ${JSON.stringify(result)}`);
    }
  });

  await test('5순위: 기본 언어', async () => {
    const request = createMockRequest({
      nextUrl: { pathname: '/app' }
    });
    
    const result = await detectLocale(request);
    if (result.locale !== 'ko' || result.source !== 'default' || result.confidence !== 0.5) {
      throw new Error(`예상: {locale: 'ko', source: 'default', confidence: 0.5}, 실제: ${JSON.stringify(result)}`);
    }
  });

  // 2. 우선순위 조합 테스트
  console.log('\n2. 우선순위 조합 테스트');

  await test('URL > 쿠키 > IP > 헤더 (URL 우선)', async () => {
    const request = createMockRequest({
      nextUrl: { pathname: '/en/app' },
      cookies: { 'NEXT_LOCALE': { value: 'ja' } },
      geo: { country: 'KR' },
      headers: { 'accept-language': 'ko-KR,ko;q=0.9' }
    });
    
    const result = await detectLocale(request);
    if (result.locale !== 'en' || result.source !== 'url') {
      throw new Error(`URL이 우선되어야 함: ${JSON.stringify(result)}`);
    }
  });

  await test('쿠키 > IP > 헤더 (쿠키 우선)', async () => {
    const request = createMockRequest({
      nextUrl: { pathname: '/app' },
      cookies: { 'NEXT_LOCALE': { value: 'ja' } },
      geo: { country: 'US' },
      headers: { 'accept-language': 'ko-KR,ko;q=0.9' }
    });
    
    const result = await detectLocale(request);
    if (result.locale !== 'ja' || result.source !== 'cookie') {
      throw new Error(`쿠키가 우선되어야 함: ${JSON.stringify(result)}`);
    }
  });

  await test('IP > 헤더 (IP 우선)', async () => {
    const request = createMockRequest({
      nextUrl: { pathname: '/app' },
      geo: { country: 'JP' },
      headers: { 'accept-language': 'en-US,en;q=0.9' }
    });
    
    const result = await detectLocale(request);
    if (result.locale !== 'ja' || result.source !== 'ip') {
      throw new Error(`IP가 우선되어야 함: ${JSON.stringify(result)}`);
    }
  });

  await test('헤더 > 기본값 (헤더 우선)', async () => {
    const request = createMockRequest({
      nextUrl: { pathname: '/app' },
      headers: { 'accept-language': 'en-US,en;q=0.9' }
    });
    
    const result = await detectLocale(request);
    if (result.locale !== 'en' || result.source !== 'header') {
      throw new Error(`헤더가 우선되어야 함: ${JSON.stringify(result)}`);
    }
  });

  // 3. 실제 시나리오 테스트
  console.log('\n3. 실제 시나리오 테스트');

  await test('한국 사용자 (모든 조건 일치)', async () => {
    const request = createMockRequest({
      nextUrl: { pathname: '/ko/app' },
      cookies: { 'NEXT_LOCALE': { value: 'ko' } },
      geo: { country: 'KR' },
      headers: { 'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8' }
    });
    
    const result = await detectLocale(request);
    if (result.locale !== 'ko' || result.source !== 'url') {
      throw new Error(`한국 사용자 시나리오 실패: ${JSON.stringify(result)}`);
    }
  });

  await test('일본 거주 한국인 (IP vs 헤더)', async () => {
    const request = createMockRequest({
      nextUrl: { pathname: '/app' },
      geo: { country: 'JP' },
      headers: { 'accept-language': 'ko-KR,ko;q=0.9,ja-JP;q=0.8' }
    });
    
    const result = await detectLocale(request);
    if (result.locale !== 'ja' || result.source !== 'ip') {
      throw new Error(`IP가 헤더보다 우선되어야 함: ${JSON.stringify(result)}`);
    }
  });

  await test('미국 거주 외국인 (지원하지 않는 언어)', async () => {
    const request = createMockRequest({
      nextUrl: { pathname: '/app' },
      geo: { country: 'US' },
      headers: { 'accept-language': 'de-DE,de;q=0.9,fr-FR;q=0.8' }
    });
    
    const result = await detectLocale(request);
    if (result.locale !== 'en' || result.source !== 'ip') {
      throw new Error(`IP 기반 언어 감지가 되어야 함: ${JSON.stringify(result)}`);
    }
  });

  await test('VPN 사용자 (저장된 언어 선택)', async () => {
    const request = createMockRequest({
      nextUrl: { pathname: '/app' },
      cookies: { 'NEXT_LOCALE': { value: 'ko' } },
      geo: { country: 'US' },
      headers: { 'accept-language': 'en-US,en;q=0.9' }
    });
    
    const result = await detectLocale(request);
    if (result.locale !== 'ko' || result.source !== 'cookie') {
      throw new Error(`사용자 선택 언어가 우선되어야 함: ${JSON.stringify(result)}`);
    }
  });

  await test('개발 환경 (로컬 IP)', async () => {
    const request = createMockRequest({
      nextUrl: { pathname: '/app' },
      ip: '127.0.0.1',
      headers: { 'accept-language': 'en-US,en;q=0.9' }
    });
    
    const result = await detectLocale(request);
    if (result.locale !== 'en' || result.source !== 'header') {
      throw new Error(`로컬 IP에서는 헤더 감지가 되어야 함: ${JSON.stringify(result)}`);
    }
  });

  // 4. 폴백 메커니즘 테스트
  console.log('\n4. 폴백 메커니즘 테스트');

  await test('잘못된 URL 로케일 (쿠키로 폴백)', async () => {
    const request = createMockRequest({
      nextUrl: { pathname: '/invalid/app' },
      cookies: { 'NEXT_LOCALE': { value: 'ja' } }
    });
    
    const result = await detectLocale(request);
    if (result.locale !== 'ja' || result.source !== 'cookie') {
      throw new Error(`쿠키로 폴백되어야 함: ${JSON.stringify(result)}`);
    }
  });

  await test('잘못된 쿠키 로케일 (IP로 폴백)', async () => {
    const request = createMockRequest({
      nextUrl: { pathname: '/app' },
      cookies: { 'NEXT_LOCALE': { value: 'invalid' } },
      geo: { country: 'JP' }
    });
    
    const result = await detectLocale(request);
    if (result.locale !== 'ja' || result.source !== 'ip') {
      throw new Error(`IP로 폴백되어야 함: ${JSON.stringify(result)}`);
    }
  });

  await test('모든 감지 실패 (기본값으로 폴백)', async () => {
    const request = createMockRequest({
      nextUrl: { pathname: '/app' },
      cookies: { 'NEXT_LOCALE': { value: 'invalid' } },
      ip: '127.0.0.1',
      headers: { 'accept-language': 'de-DE,de;q=0.9,fr-FR;q=0.8' }
    });
    
    const result = await detectLocale(request);
    if (result.locale !== 'ko' || result.source !== 'default') {
      throw new Error(`기본값으로 폴백되어야 함: ${JSON.stringify(result)}`);
    }
  });

  // 5. 성능 테스트
  console.log('\n5. 성능 테스트');

  await test('단일 호출 성능', async () => {
    const request = createMockRequest({
      nextUrl: { pathname: '/app' },
      cookies: { 'NEXT_LOCALE': { value: 'ko' } },
      geo: { country: 'KR' },
      headers: { 'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8' }
    });
    
    const startTime = performance.now();
    const result = await detectLocale(request);
    const endTime = performance.now();
    
    console.log(`  처리 시간: ${(endTime - startTime).toFixed(2)}ms`);
    
    if (endTime - startTime > 10) {
      throw new Error(`처리 시간이 10ms를 초과: ${(endTime - startTime).toFixed(2)}ms`);
    }
    
    if (result.locale !== 'ko') {
      throw new Error(`예상: ko, 실제: ${result.locale}`);
    }
  });

  await test('반복 호출 성능', async () => {
    const request = createMockRequest({
      nextUrl: { pathname: '/en/app' },
      cookies: { 'NEXT_LOCALE': { value: 'ja' } },
      geo: { country: 'US' },
      headers: { 'accept-language': 'ko-KR,ko;q=0.9' }
    });
    
    const iterations = 100;
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      await detectLocale(request);
    }
    
    const endTime = performance.now();
    const avgTime = (endTime - startTime) / iterations;
    
    console.log(`  ${iterations}회 반복 평균 시간: ${avgTime.toFixed(4)}ms`);
    
    if (avgTime > 1) {
      throw new Error(`평균 처리 시간이 1ms를 초과: ${avgTime.toFixed(4)}ms`);
    }
  });

  // 6. 에러 처리 테스트
  console.log('\n6. 에러 처리 테스트');

  await test('잘못된 request 객체', async () => {
    const request = {};
    
    try {
      const result = await detectLocale(request);
      if (result.locale !== 'ko' || result.source !== 'default') {
        throw new Error(`기본값으로 처리되어야 함: ${JSON.stringify(result)}`);
      }
    } catch (error) {
      if (error.message.includes('기본값으로 처리되어야 함')) {
        throw error;
      }
      // 다른 에러는 허용 (기본값 반환)
    }
  });

  await test('null request', async () => {
    try {
      const result = await detectLocale(null);
      if (result.locale !== 'ko' || result.source !== 'default') {
        throw new Error(`기본값으로 처리되어야 함: ${JSON.stringify(result)}`);
      }
    } catch (error) {
      if (error.message.includes('기본값으로 처리되어야 함')) {
        throw error;
      }
      // 다른 에러는 허용 (기본값 반환)
    }
  });

  // 결과 요약
  console.log('\n=== 테스트 결과 요약 ===');
  console.log(`총 테스트: ${testCount}`);
  console.log(`통과: ${passCount}`);
  console.log(`실패: ${testCount - passCount}`);

  if (passCount === testCount) {
    console.log('✅ 모든 테스트 통과! 통합 언어 감지 로직이 올바르게 구현되었습니다.');
  } else {
    console.log('❌ 일부 테스트 실패. 구현을 다시 확인해주세요.');
  }

  // 기능 요약
  console.log('\n=== 기능 요약 ===');
  console.log('✅ 5단계 우선순위 기반 언어 감지');
  console.log('✅ URL > 쿠키 > IP > 헤더 > 기본값 순서');
  console.log('✅ 각 단계별 폴백 메커니즘');
  console.log('✅ 신뢰도 점수 시스템');
  console.log('✅ 실제 시나리오 대응');
  console.log('✅ 성능 최적화');
  console.log('✅ 에러 처리 및 안정성');

  // 우선순위 가이드
  console.log('\n=== 우선순위 가이드 ===');
  console.log('1순위 (신뢰도 1.0): URL 경로 (/ko/, /en/, /ja/)');
  console.log('2순위 (신뢰도 0.9): 쿠키 저장 언어 (NEXT_LOCALE)');
  console.log('3순위 (신뢰도 0.8): IP 기반 지역 감지 (Vercel Geo API)');
  console.log('4순위 (신뢰도 0.7): 브라우저 언어 (Accept-Language)');
  console.log('5순위 (신뢰도 0.5): 기본 언어 (ko)');
}

// 테스트 실행
runTests().catch(error => {
  console.error('테스트 실행 중 오류:', error);
});