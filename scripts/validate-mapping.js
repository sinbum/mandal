/**
 * 국가-언어 매핑 테이블 검증 스크립트
 */

// 매핑 테이블 (locale-detection.ts에서 복사)
const COUNTRY_LOCALE_MAP = {
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
  'AT': 'en',
  'CH': 'en',
  'BE': 'en',
  'PL': 'en',
  'CZ': 'en',
  'HU': 'en',
  'RO': 'en',
  'BG': 'en',
  'HR': 'en',
  'SK': 'en',
  'SI': 'en',
  'EE': 'en',
  'LV': 'en',
  'LT': 'en',
  'LU': 'en',
  'MT': 'en',
  'CY': 'en',
  
  // 남미/기타 (영어 기본)
  'BR': 'en',
  'AR': 'en',
  'CL': 'en',
  'CO': 'en',
  'PE': 'en',
  'MX': 'en',
  'VE': 'en',
  'EC': 'en',
  'UY': 'en',
  'PY': 'en',
  'BO': 'en',
  
  // 중동/아프리카 (영어 기본)
  'SA': 'en',
  'AE': 'en',
  'QA': 'en',
  'KW': 'en',
  'BH': 'en',
  'OM': 'en',
  'JO': 'en',
  'LB': 'en',
  'IL': 'en',
  'TR': 'en',
  'EG': 'en',
  'ZA': 'en',
  'NG': 'en',
  'KE': 'en',
  'GH': 'en',
  'ET': 'en',
  'TZ': 'en',
  'UG': 'en',
  'ZW': 'en',
  'ZM': 'en',
  'BW': 'en',
  'MW': 'en',
  'MZ': 'en',
  'AO': 'en',
  'NA': 'en',
  'SZ': 'en',
  'LS': 'en',
  
  // 오세아니아 (영어 기본)
  'FJ': 'en',
  'PG': 'en',
  'SB': 'en',
  'VU': 'en',
  'NC': 'en',
  'PF': 'en',
  'WS': 'en',
  'TO': 'en',
  'KI': 'en',
  'TV': 'en',
  'NR': 'en',
  'PW': 'en',
  'FM': 'en',
  'MH': 'en',
  
  // 기타 유럽 소국
  'IS': 'en',
  'GL': 'en',
  'FO': 'en',
  'AD': 'en',
  'MC': 'en',
  'SM': 'en',
  'VA': 'en',
  'LI': 'en',
  
  // 러시아 및 구소련
  'RU': 'en',
  'UA': 'en',
  'BY': 'en',
  'MD': 'en',
  'GE': 'en',
  'AM': 'en',
  'AZ': 'en',
  'KZ': 'en',
  'KG': 'en',
  'UZ': 'en',
  'TJ': 'en',
  'TM': 'en',
  'MN': 'en',
};

const SUPPORTED_LOCALES = ['ko', 'en', 'ja'];
const DEFAULT_LOCALE = 'ko';

// 매핑 함수
function mapCountryToLocale(country) {
  const upperCountry = country?.toUpperCase();
  return COUNTRY_LOCALE_MAP[upperCountry] || DEFAULT_LOCALE;
}

// 로케일 유효성 검사
function isValidLocale(locale) {
  return SUPPORTED_LOCALES.includes(locale);
}

// 로컬 IP 검사
function isLocalIP(ip) {
  if (!ip) return true;
  
  const localPatterns = [
    /^127\./,
    /^192\.168\./,
    /^10\./,
    /^172\.(1[6-9]|2\d|3[0-1])\./,
    /^::1$/,
    /^localhost$/i,
    /^0\.0\.0\.0$/,
    /^169\.254\./,
    /^fe80:/i,
  ];
  
  return localPatterns.some(pattern => pattern.test(ip));
}

// Accept-Language 헤더 파싱
function detectLocaleFromHeaders(acceptLanguage) {
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

// 테스트 실행
console.log('=== 국가-언어 매핑 테이블 검증 시작 ===\n');

let testCount = 0;
let passCount = 0;

function test(description, testFn) {
  testCount++;
  try {
    testFn();
    console.log(`✅ ${description}`);
    passCount++;
  } catch (error) {
    console.log(`❌ ${description}`);
    console.log(`   오류: ${error.message}`);
  }
}

// 1. 기본 매핑 테스트
console.log('1. 기본 매핑 테스트');
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
    const result = mapCountryToLocale(country);
    if (result !== 'en') {
      throw new Error(`${country} 매핑 실패: ${result}`);
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

// 2. 로케일 유효성 검사 테스트
console.log('\n2. 로케일 유효성 검사 테스트');
test('지원하는 로케일에 대해 true 반환', () => {
  SUPPORTED_LOCALES.forEach(locale => {
    const result = isValidLocale(locale);
    if (!result) {
      throw new Error(`${locale}이 유효하지 않다고 판단됨`);
    }
  });
});

test('지원하지 않는 로케일에 대해 false 반환', () => {
  const invalidLocales = ['de', 'fr', 'zh', 'es', ''];
  invalidLocales.forEach(locale => {
    const result = isValidLocale(locale);
    if (result) {
      throw new Error(`${locale}이 유효하다고 판단됨`);
    }
  });
});

// 3. 로컬 IP 검사 테스트
console.log('\n3. 로컬 IP 검사 테스트');
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

// 4. Accept-Language 헤더 파싱 테스트
console.log('\n4. Accept-Language 헤더 파싱 테스트');
test('한국어 감지', () => {
  const result = detectLocaleFromHeaders('ko-KR,ko;q=0.9,en-US;q=0.8');
  if (result !== 'ko') {
    throw new Error(`예상: ko, 실제: ${result}`);
  }
});

test('영어 감지', () => {
  const result = detectLocaleFromHeaders('en-US,en;q=0.9,ko;q=0.8');
  if (result !== 'en') {
    throw new Error(`예상: en, 실제: ${result}`);
  }
});

test('품질 점수에 따른 우선순위 처리', () => {
  const result = detectLocaleFromHeaders('en;q=0.8,ko;q=0.9,ja;q=0.7');
  if (result !== 'ko') {
    throw new Error(`예상: ko, 실제: ${result}`);
  }
});

test('지원하지 않는 언어는 건너뛰기', () => {
  const result = detectLocaleFromHeaders('de-DE,de;q=0.9,en-US;q=0.8');
  if (result !== 'en') {
    throw new Error(`예상: en, 실제: ${result}`);
  }
});

// 5. 매핑 테이블 완전성 검증
console.log('\n5. 매핑 테이블 완전성 검증');
test('모든 매핑값이 지원 로케일에 포함', () => {
  const uniqueLocales = [...new Set(Object.values(COUNTRY_LOCALE_MAP))];
  uniqueLocales.forEach(locale => {
    if (!SUPPORTED_LOCALES.includes(locale)) {
      throw new Error(`매핑 테이블의 ${locale}이 지원 로케일에 없음`);
    }
  });
});

test('주요 국가들의 매핑 확인', () => {
  const majorCountries = {
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

  Object.entries(majorCountries).forEach(([country, expected]) => {
    const result = COUNTRY_LOCALE_MAP[country];
    if (result !== expected) {
      throw new Error(`${country} 매핑 오류: 예상 ${expected}, 실제 ${result}`);
    }
  });
});

// 결과 요약
console.log('\n=== 테스트 결과 요약 ===');
console.log(`총 테스트: ${testCount}`);
console.log(`통과: ${passCount}`);
console.log(`실패: ${testCount - passCount}`);

if (passCount === testCount) {
  console.log('✅ 모든 테스트 통과! 국가-언어 매핑 테이블이 올바르게 구현되었습니다.');
} else {
  console.log('❌ 일부 테스트 실패. 구현을 다시 확인해주세요.');
}

// 매핑 통계
console.log('\n=== 매핑 통계 ===');
const localeStats = {};
Object.values(COUNTRY_LOCALE_MAP).forEach(locale => {
  localeStats[locale] = (localeStats[locale] || 0) + 1;
});

console.log('언어별 매핑 국가 수:');
Object.entries(localeStats).forEach(([locale, count]) => {
  console.log(`  ${locale}: ${count}개국`);
});

console.log(`총 매핑 국가 수: ${Object.keys(COUNTRY_LOCALE_MAP).length}`);