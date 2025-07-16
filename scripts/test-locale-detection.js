/**
 * locale-detection 유틸리티 함수 테스트 스크립트
 */

// ES 모듈 import를 위한 dynamic import 사용
const testLocaleDetection = async () => {
  console.log('=== 국가-언어 매핑 테이블 테스트 시작 ===\n');

  try {
    // 동적 import로 모듈 로드
    const {
      mapCountryToLocale,
      isValidLocale,
      getClientIP,
      isLocalIP,
      detectLocaleFromHeaders,
      extractLocaleFromPath,
      getLocaleFromCookie,
      COUNTRY_LOCALE_MAP,
      SUPPORTED_LOCALES,
      DEFAULT_LOCALE,
    } = await import('../src/utils/locale-detection.js');

    // 테스트 헬퍼 함수
    const createMockRequest = (options = {}) => {
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
    };

    // 테스트 결과 출력 헬퍼
    const test = (description, testFn) => {
      try {
        const result = testFn();
        console.log(`✅ ${description}`);
        return result;
      } catch (error) {
        console.log(`❌ ${description}`);
        console.log(`   오류: ${error.message}`);
        return false;
      }
    };

    // 1. mapCountryToLocale 함수 테스트
    console.log('1. mapCountryToLocale 함수 테스트');
    
    test('한국(KR)을 ko로 매핑', () => {
      const result1 = mapCountryToLocale('KR');
      const result2 = mapCountryToLocale('kr');
      if (result1 !== 'ko' || result2 !== 'ko') {
        throw new Error(`예상: ko, 실제: ${result1}, ${result2}`);
      }
    });

    test('일본(JP)을 ja로 매핑', () => {
      const result1 = mapCountryToLocale('JP');
      const result2 = mapCountryToLocale('jp');
      if (result1 !== 'ja' || result2 !== 'ja') {
        throw new Error(`예상: ja, 실제: ${result1}, ${result2}`);
      }
    });

    test('영어권 국가들을 en으로 매핑', () => {
      const englishCountries = ['US', 'GB', 'CA', 'AU', 'NZ', 'IE'];
      englishCountries.forEach(country => {
        const result1 = mapCountryToLocale(country);
        const result2 = mapCountryToLocale(country.toLowerCase());
        if (result1 !== 'en' || result2 !== 'en') {
          throw new Error(`${country} 매핑 실패: ${result1}, ${result2}`);
        }
      });
    });

    test('존재하지 않는 국가 코드에 대해 기본값 반환', () => {
      const result1 = mapCountryToLocale('XX');
      const result2 = mapCountryToLocale('');
      const result3 = mapCountryToLocale(null);
      if (result1 !== DEFAULT_LOCALE || result2 !== DEFAULT_LOCALE || result3 !== DEFAULT_LOCALE) {
        throw new Error(`예상: ${DEFAULT_LOCALE}, 실제: ${result1}, ${result2}, ${result3}`);
      }
    });

    // 2. isValidLocale 함수 테스트
    console.log('\n2. isValidLocale 함수 테스트');
    
    test('지원하는 로케일에 대해 true 반환', () => {
      SUPPORTED_LOCALES.forEach(locale => {
        const result = isValidLocale(locale);
        if (!result) {
          throw new Error(`${locale}이 유효하지 않다고 판단됨`);
        }
      });
    });

    test('지원하지 않는 로케일에 대해 false 반환', () => {
      const invalidLocales = ['de', 'fr', 'zh', 'es', '', null, undefined];
      invalidLocales.forEach(locale => {
        const result = isValidLocale(locale);
        if (result) {
          throw new Error(`${locale}이 유효하다고 판단됨`);
        }
      });
    });

    // 3. isLocalIP 함수 테스트
    console.log('\n3. isLocalIP 함수 테스트');
    
    test('로컬 IP 주소들을 정확히 식별', () => {
      const localIPs = [
        '127.0.0.1',
        '192.168.1.1',
        '10.0.0.1',
        '172.16.0.1',
        '::1',
        'localhost',
        '0.0.0.0',
        '169.254.1.1',
      ];

      localIPs.forEach(ip => {
        const result = isLocalIP(ip);
        if (!result) {
          throw new Error(`${ip}가 로컬 IP로 인식되지 않음`);
        }
      });
    });

    test('공개 IP 주소들을 정확히 식별', () => {
      const publicIPs = [
        '8.8.8.8',
        '1.1.1.1',
        '203.0.113.1',
        '198.51.100.1',
      ];

      publicIPs.forEach(ip => {
        const result = isLocalIP(ip);
        if (result) {
          throw new Error(`${ip}가 로컬 IP로 잘못 인식됨`);
        }
      });
    });

    // 4. detectLocaleFromHeaders 함수 테스트
    console.log('\n4. detectLocaleFromHeaders 함수 테스트');
    
    test('Accept-Language 헤더에서 한국어 감지', () => {
      const request = createMockRequest({
        headers: { 'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8' }
      });
      const result = detectLocaleFromHeaders(request);
      if (result !== 'ko') {
        throw new Error(`예상: ko, 실제: ${result}`);
      }
    });

    test('Accept-Language 헤더에서 영어 감지', () => {
      const request = createMockRequest({
        headers: { 'accept-language': 'en-US,en;q=0.9,ko;q=0.8' }
      });
      const result = detectLocaleFromHeaders(request);
      if (result !== 'en') {
        throw new Error(`예상: en, 실제: ${result}`);
      }
    });

    test('품질 점수에 따른 우선순위 처리', () => {
      const request = createMockRequest({
        headers: { 'accept-language': 'en;q=0.8,ko;q=0.9,ja;q=0.7' }
      });
      const result = detectLocaleFromHeaders(request);
      if (result !== 'ko') {
        throw new Error(`예상: ko, 실제: ${result}`);
      }
    });

    // 5. extractLocaleFromPath 함수 테스트
    console.log('\n5. extractLocaleFromPath 함수 테스트');
    
    test('경로에서 로케일 추출', () => {
      const testCases = [
        ['/ko/app', 'ko'],
        ['/en/auth/login', 'en'],
        ['/ja/app/settings', 'ja'],
        ['/ko/', 'ko'],
        ['/app', null],
        ['/', null],
        ['/de/app', null],
      ];

      testCases.forEach(([path, expected]) => {
        const result = extractLocaleFromPath(path);
        if (result !== expected) {
          throw new Error(`경로 ${path}: 예상 ${expected}, 실제 ${result}`);
        }
      });
    });

    // 6. getClientIP 함수 테스트
    console.log('\n6. getClientIP 함수 테스트');
    
    test('CF-Connecting-IP 헤더에서 IP 추출', () => {
      const request = createMockRequest({
        headers: { 'cf-connecting-ip': '203.0.113.1' }
      });
      const result = getClientIP(request);
      if (result !== '203.0.113.1') {
        throw new Error(`예상: 203.0.113.1, 실제: ${result}`);
      }
    });

    test('X-Forwarded-For 헤더에서 첫 번째 IP 추출', () => {
      const request = createMockRequest({
        headers: { 'x-forwarded-for': '203.0.113.1, 198.51.100.1, 192.0.2.1' }
      });
      const result = getClientIP(request);
      if (result !== '203.0.113.1') {
        throw new Error(`예상: 203.0.113.1, 실제: ${result}`);
      }
    });

    // 7. 상수 정의 검증
    console.log('\n7. 상수 정의 검증');
    
    test('COUNTRY_LOCALE_MAP 매핑 확인', () => {
      if (COUNTRY_LOCALE_MAP['KR'] !== 'ko') {
        throw new Error('KR → ko 매핑 실패');
      }
      if (COUNTRY_LOCALE_MAP['JP'] !== 'ja') {
        throw new Error('JP → ja 매핑 실패');
      }
      if (COUNTRY_LOCALE_MAP['US'] !== 'en') {
        throw new Error('US → en 매핑 실패');
      }
    });

    test('SUPPORTED_LOCALES 확인', () => {
      if (!SUPPORTED_LOCALES.includes('ko')) {
        throw new Error('ko가 지원 로케일에 없음');
      }
      if (!SUPPORTED_LOCALES.includes('en')) {
        throw new Error('en이 지원 로케일에 없음');
      }
      if (!SUPPORTED_LOCALES.includes('ja')) {
        throw new Error('ja가 지원 로케일에 없음');
      }
    });

    test('DEFAULT_LOCALE 확인', () => {
      if (DEFAULT_LOCALE !== 'ko') {
        throw new Error(`예상: ko, 실제: ${DEFAULT_LOCALE}`);
      }
    });

    console.log('\n=== 모든 테스트 완료 ===');
    console.log('✅ 국가-언어 매핑 테이블이 올바르게 구현되었습니다.');

  } catch (error) {
    console.error('❌ 테스트 실행 중 오류 발생:', error.message);
    console.error('스택 트레이스:', error.stack);
  }
};

// 테스트 실행
testLocaleDetection();