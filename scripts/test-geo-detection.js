/**
 * Vercel Geo API 기반 지역 감지 기능 테스트
 */

console.log('=== Vercel Geo API 기반 지역 감지 테스트 시작 ===\n');

// 테스트 헬퍼 함수
function createMockRequest(options = {}) {
  const headers = new Map(Object.entries(options.headers || {}));
  
  return {
    headers: {
      get: (key) => headers.get(key) || null,
    },
    ip: options.ip,
    geo: options.geo,
  };
}

// 국가-언어 매핑 함수
const COUNTRY_LOCALE_MAP = {
  'KR': 'ko',
  'JP': 'ja',
  'US': 'en',
  'GB': 'en',
  'CA': 'en',
  'AU': 'en',
  'NZ': 'en',
  'IE': 'en',
  'DE': 'en',
  'FR': 'en',
  'CN': 'en',
  'IN': 'en',
  'BR': 'en',
  'RU': 'en',
};

function mapCountryToLocale(country) {
  const upperCountry = country?.toUpperCase();
  return COUNTRY_LOCALE_MAP[upperCountry] || 'ko';
}

// 캐싱 관련
const CACHE_DURATION = 1000 * 60 * 60; // 1시간
const geoCache = new Map();

function getCachedGeoLocation(ip) {
  const cached = geoCache.get(ip);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return { country: cached.country };
  }
  
  return null;
}

function setCachedGeoLocation(ip, country) {
  geoCache.set(ip, {
    country,
    timestamp: Date.now()
  });
}

// IP 검증 함수
function getClientIP(request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return request.ip || null;
}

function isLocalIP(ip) {
  if (!ip) return true;
  
  // 특수 케이스: localhost 문자열
  if (/^localhost$/i.test(ip)) {
    return true;
  }
  
  // IPv4 로컬 주소 패턴
  const ipv4LocalPatterns = [
    /^127\.(\d{1,3}\.){2}\d{1,3}$/,
    /^192\.168\.(\d{1,3}\.)\d{1,3}$/,
    /^10\.(\d{1,3}\.){2}\d{1,3}$/,
    /^172\.(1[6-9]|2\d|3[0-1])\.(\d{1,3}\.)\d{1,3}$/,
    /^0\.0\.0\.0$/,
    /^169\.254\.(\d{1,3}\.)\d{1,3}$/,
  ];
  
  // IPv6 로컬 주소 패턴
  const ipv6LocalPatterns = [
    /^::1$/,
    /^fe80::/i,
    /^::ffff:192\.168\./,
    /^::ffff:10\./,
    /^::ffff:172\.(1[6-9]|2\d|3[0-1])\./,
  ];
  
  // IPv4 패턴 확인
  for (const pattern of ipv4LocalPatterns) {
    if (pattern.test(ip)) {
      const parts = ip.split('.');
      if (parts.length === 4) {
        const validOctets = parts.every(part => {
          const num = parseInt(part, 10);
          return !isNaN(num) && num >= 0 && num <= 255 && part === num.toString();
        });
        if (validOctets) {
          return true;
        }
      }
    }
  }
  
  // IPv6 패턴 확인
  for (const pattern of ipv6LocalPatterns) {
    if (pattern.test(ip)) {
      return true;
    }
  }
  
  return false;
}

// 외부 API 호출 시뮬레이션 (개발 환경용)
async function fetchGeoLocationFromAPI(ip) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return null;
    }
    
    // 실제 API 호출 시뮬레이션
    console.log(`  [DEBUG] 외부 API 호출 시뮬레이션: ${ip}`);
    
    // 시뮬레이션된 응답
    const mockResponses = {
      '203.0.113.1': { country_code: 'US' },
      '198.51.100.1': { country_code: 'GB' },
      '192.0.2.1': { country_code: 'CA' },
      '8.8.8.8': { country_code: 'US' },
      '1.1.1.1': { country_code: 'US' },
    };
    
    // 지연 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const response = mockResponses[ip];
    if (response && response.country_code) {
      return {
        country: response.country_code.toUpperCase()
      };
    }
    
    return null;
  } catch (error) {
    console.error('외부 IP 지역 조회 API 호출 실패:', error);
    return null;
  }
}

// 통합 지역 감지 함수 (locale-detection.ts에서 복사)
async function detectLocaleFromIP(request) {
  try {
    // 1. Vercel/Netlify 등의 지역 정보 사용 (우선순위)
    const geoCountry = request.geo?.country;
    if (geoCountry) {
      console.log(`  [DEBUG] Vercel Geo API에서 국가 감지: ${geoCountry}`);
      return mapCountryToLocale(geoCountry);
    }
    
    // 2. 클라이언트 IP 추출
    const clientIP = getClientIP(request);
    if (!clientIP || isLocalIP(clientIP)) {
      console.log(`  [DEBUG] 로컬 IP 또는 IP 없음: ${clientIP}`);
      return null;
    }
    
    // 3. 캐시된 지역 정보 확인
    const cachedGeo = getCachedGeoLocation(clientIP);
    if (cachedGeo) {
      console.log(`  [DEBUG] 캐시에서 국가 정보 조회: ${cachedGeo.country}`);
      return mapCountryToLocale(cachedGeo.country);
    }
    
    // 4. 외부 API를 통한 지역 조회 (개발 환경만)
    const apiGeo = await fetchGeoLocationFromAPI(clientIP);
    if (apiGeo) {
      console.log(`  [DEBUG] 외부 API에서 국가 감지: ${apiGeo.country}`);
      setCachedGeoLocation(clientIP, apiGeo.country);
      return mapCountryToLocale(apiGeo.country);
    }
    
    console.log(`  [DEBUG] 지역 감지 실패`);
    return null;
  } catch (error) {
    console.error('IP 기반 지역 감지 실패:', error);
    return null;
  }
}

// 개발 환경 모의 국가 설정
function getMockCountryForDevelopment(request) {
  if (process.env.NODE_ENV === 'development') {
    return request.headers.get('x-mock-country');
  }
  return null;
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
  // 1. Vercel Geo API 기본 테스트
  console.log('1. Vercel Geo API 기본 테스트');
  
  await test('한국 지역 감지 (KR)', async () => {
    const request = createMockRequest({
      geo: { country: 'KR' }
    });
    const result = await detectLocaleFromIP(request);
    if (result !== 'ko') {
      throw new Error(`예상: ko, 실제: ${result}`);
    }
  });

  await test('일본 지역 감지 (JP)', async () => {
    const request = createMockRequest({
      geo: { country: 'JP' }
    });
    const result = await detectLocaleFromIP(request);
    if (result !== 'ja') {
      throw new Error(`예상: ja, 실제: ${result}`);
    }
  });

  await test('미국 지역 감지 (US)', async () => {
    const request = createMockRequest({
      geo: { country: 'US' }
    });
    const result = await detectLocaleFromIP(request);
    if (result !== 'en') {
      throw new Error(`예상: en, 실제: ${result}`);
    }
  });

  await test('영국 지역 감지 (GB)', async () => {
    const request = createMockRequest({
      geo: { country: 'GB' }
    });
    const result = await detectLocaleFromIP(request);
    if (result !== 'en') {
      throw new Error(`예상: en, 실제: ${result}`);
    }
  });

  await test('알 수 없는 국가 코드', async () => {
    const request = createMockRequest({
      geo: { country: 'XX' }
    });
    const result = await detectLocaleFromIP(request);
    if (result !== 'ko') {
      throw new Error(`예상: ko (기본값), 실제: ${result}`);
    }
  });

  // 2. 폴백 메커니즘 테스트
  console.log('\n2. 폴백 메커니즘 테스트');

  await test('Geo API 없을 때 IP 기반 감지', async () => {
    const request = createMockRequest({
      headers: { 'x-forwarded-for': '203.0.113.1' }
    });
    const result = await detectLocaleFromIP(request);
    if (result !== 'en') {
      throw new Error(`예상: en, 실제: ${result}`);
    }
  });

  await test('로컬 IP일 때 null 반환', async () => {
    const request = createMockRequest({
      ip: '127.0.0.1'
    });
    const result = await detectLocaleFromIP(request);
    if (result !== null) {
      throw new Error(`예상: null, 실제: ${result}`);
    }
  });

  await test('IP 없을 때 null 반환', async () => {
    const request = createMockRequest({});
    const result = await detectLocaleFromIP(request);
    if (result !== null) {
      throw new Error(`예상: null, 실제: ${result}`);
    }
  });

  // 3. 캐싱 메커니즘 테스트
  console.log('\n3. 캐싱 메커니즘 테스트');

  await test('캐시 저장 및 조회', async () => {
    const ip = '203.0.113.1';
    const country = 'US';
    
    // 캐시 저장
    setCachedGeoLocation(ip, country);
    
    // 캐시 조회
    const cached = getCachedGeoLocation(ip);
    if (!cached || cached.country !== country) {
      throw new Error(`캐시 저장/조회 실패: ${cached?.country}`);
    }
  });

  await test('캐시 만료 확인', async () => {
    const ip = '198.51.100.1';
    const country = 'GB';
    
    // 과거 시간으로 캐시 저장
    geoCache.set(ip, {
      country,
      timestamp: Date.now() - (CACHE_DURATION + 1000)
    });
    
    // 만료된 캐시 조회
    const cached = getCachedGeoLocation(ip);
    if (cached !== null) {
      throw new Error(`만료된 캐시가 반환됨: ${cached?.country}`);
    }
  });

  await test('캐시를 통한 지역 감지', async () => {
    const ip = '192.0.2.1';
    const country = 'CA';
    
    // 캐시에 저장
    setCachedGeoLocation(ip, country);
    
    // 캐시를 통한 감지
    const request = createMockRequest({
      headers: { 'x-forwarded-for': ip }
    });
    const result = await detectLocaleFromIP(request);
    if (result !== 'en') {
      throw new Error(`예상: en, 실제: ${result}`);
    }
  });

  // 4. 우선순위 테스트
  console.log('\n4. 우선순위 테스트');

  await test('Vercel Geo API 우선순위', async () => {
    const request = createMockRequest({
      geo: { country: 'JP' },
      headers: { 'x-forwarded-for': '203.0.113.1' } // 미국 IP
    });
    const result = await detectLocaleFromIP(request);
    if (result !== 'ja') {
      throw new Error(`예상: ja (Geo API 우선), 실제: ${result}`);
    }
  });

  await test('IP 기반 폴백', async () => {
    const request = createMockRequest({
      headers: { 'x-forwarded-for': '8.8.8.8' } // 미국 IP
    });
    const result = await detectLocaleFromIP(request);
    if (result !== 'en') {
      throw new Error(`예상: en, 실제: ${result}`);
    }
  });

  // 5. 에러 처리 테스트
  console.log('\n5. 에러 처리 테스트');

  await test('잘못된 Geo 데이터 처리', async () => {
    const request = createMockRequest({
      geo: { country: null }
    });
    const result = await detectLocaleFromIP(request);
    if (result !== null) {
      throw new Error(`예상: null, 실제: ${result}`);
    }
  });

  await test('빈 Geo 객체 처리', async () => {
    const request = createMockRequest({
      geo: {}
    });
    const result = await detectLocaleFromIP(request);
    if (result !== null) {
      throw new Error(`예상: null, 실제: ${result}`);
    }
  });

  // 6. 실제 시나리오 테스트
  console.log('\n6. 실제 시나리오 테스트');

  await test('Vercel 프로덕션 환경 시뮬레이션', async () => {
    const request = createMockRequest({
      geo: { country: 'KR', region: 'Seoul' },
      headers: { 'x-forwarded-for': '203.0.113.1' },
      ip: '127.0.0.1'
    });
    const result = await detectLocaleFromIP(request);
    if (result !== 'ko') {
      throw new Error(`예상: ko, 실제: ${result}`);
    }
  });

  await test('개발 환경 시뮬레이션', async () => {
    // 개발 환경 설정
    process.env.NODE_ENV = 'development';
    
    const request = createMockRequest({
      headers: { 'x-forwarded-for': '1.1.1.1' }
    });
    const result = await detectLocaleFromIP(request);
    if (result !== 'en') {
      throw new Error(`예상: en, 실제: ${result}`);
    }
    
    // 환경 변수 복원
    delete process.env.NODE_ENV;
  });

  await test('모의 국가 설정 (개발 환경)', async () => {
    process.env.NODE_ENV = 'development';
    
    const request = createMockRequest({
      headers: { 'x-mock-country': 'JP' }
    });
    
    const mockCountry = getMockCountryForDevelopment(request);
    if (mockCountry !== 'JP') {
      throw new Error(`예상: JP, 실제: ${mockCountry}`);
    }
    
    delete process.env.NODE_ENV;
  });

  // 결과 요약
  console.log('\n=== 테스트 결과 요약 ===');
  console.log(`총 테스트: ${testCount}`);
  console.log(`통과: ${passCount}`);
  console.log(`실패: ${testCount - passCount}`);

  if (passCount === testCount) {
    console.log('✅ 모든 테스트 통과! Vercel Geo API 기반 지역 감지가 올바르게 구현되었습니다.');
  } else {
    console.log('❌ 일부 테스트 실패. 구현을 다시 확인해주세요.');
  }

  // 캐시 상태 확인
  console.log('\n=== 캐시 상태 ===');
  console.log(`캐시 크기: ${geoCache.size}`);
  const cacheEntries = Array.from(geoCache.entries()).map(([ip, data]) => ({
    ip,
    country: data.country,
    age: Date.now() - data.timestamp
  }));
  console.log('캐시 항목:', cacheEntries);
}

// 테스트 실행
runTests().catch(error => {
  console.error('테스트 실행 중 오류:', error);
});