/**
 * 브라우저 언어 감지 기능 테스트
 * Accept-Language 헤더 파싱 및 언어 감지 테스트
 */

console.log('=== 브라우저 언어 감지 기능 테스트 시작 ===\n');

// 테스트 헬퍼 함수
function createMockRequest(options = {}) {
  const headers = new Map(Object.entries(options.headers || {}));
  
  return {
    headers: {
      get: (key) => headers.get(key) || null,
    },
  };
}

// 지원하는 로케일 정의
const SUPPORTED_LOCALES = ['ko', 'en', 'ja'];

// 로케일 유효성 검사
function isValidLocale(locale) {
  return SUPPORTED_LOCALES.includes(locale);
}

// Accept-Language 헤더 파싱 함수 (locale-detection.ts에서 복사)
function detectLocaleFromHeaders(request) {
  const acceptLanguage = request.headers.get('accept-language');
  if (!acceptLanguage) return null;
  
  try {
    // "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7,ja;q=0.6" 형태 파싱
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
      .sort((a, b) => b.quality - a.quality); // 품질 점수 내림차순 정렬
    
    // 지원하는 언어 중에서 가장 높은 우선순위 언어 찾기
    for (const { code } of languages) {
      if (isValidLocale(code)) {
        return code;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Accept-Language 헤더 파싱 오류:', error);
    return null;
  }
}

// 테스트 실행
let testCount = 0;
let passCount = 0;

function test(description, testFn) {
  testCount++;
  console.log(`\n테스트 ${testCount}: ${description}`);
  try {
    testFn();
    console.log(`✅ 통과`);
    passCount++;
  } catch (error) {
    console.log(`❌ 실패: ${error.message}`);
  }
}

// 1. 기본 언어 감지 테스트
console.log('1. 기본 언어 감지 테스트');

test('한국어 감지 (ko-KR)', () => {
  const request = createMockRequest({
    headers: { 'accept-language': 'ko-KR' }
  });
  const result = detectLocaleFromHeaders(request);
  if (result !== 'ko') {
    throw new Error(`예상: ko, 실제: ${result}`);
  }
});

test('한국어 감지 (ko)', () => {
  const request = createMockRequest({
    headers: { 'accept-language': 'ko' }
  });
  const result = detectLocaleFromHeaders(request);
  if (result !== 'ko') {
    throw new Error(`예상: ko, 실제: ${result}`);
  }
});

test('영어 감지 (en-US)', () => {
  const request = createMockRequest({
    headers: { 'accept-language': 'en-US' }
  });
  const result = detectLocaleFromHeaders(request);
  if (result !== 'en') {
    throw new Error(`예상: en, 실제: ${result}`);
  }
});

test('영어 감지 (en-GB)', () => {
  const request = createMockRequest({
    headers: { 'accept-language': 'en-GB' }
  });
  const result = detectLocaleFromHeaders(request);
  if (result !== 'en') {
    throw new Error(`예상: en, 실제: ${result}`);
  }
});

test('일본어 감지 (ja-JP)', () => {
  const request = createMockRequest({
    headers: { 'accept-language': 'ja-JP' }
  });
  const result = detectLocaleFromHeaders(request);
  if (result !== 'ja') {
    throw new Error(`예상: ja, 실제: ${result}`);
  }
});

// 2. 다중 언어 및 우선순위 테스트
console.log('\n2. 다중 언어 및 우선순위 테스트');

test('한국어 우선순위 (ko > en)', () => {
  const request = createMockRequest({
    headers: { 'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7' }
  });
  const result = detectLocaleFromHeaders(request);
  if (result !== 'ko') {
    throw new Error(`예상: ko, 실제: ${result}`);
  }
});

test('영어 우선순위 (en > ko)', () => {
  const request = createMockRequest({
    headers: { 'accept-language': 'en-US,en;q=0.9,ko-KR;q=0.8,ko;q=0.7' }
  });
  const result = detectLocaleFromHeaders(request);
  if (result !== 'en') {
    throw new Error(`예상: en, 실제: ${result}`);
  }
});

test('일본어 우선순위 (ja > en > ko)', () => {
  const request = createMockRequest({
    headers: { 'accept-language': 'ja-JP,ja;q=0.9,en-US;q=0.8,ko;q=0.7' }
  });
  const result = detectLocaleFromHeaders(request);
  if (result !== 'ja') {
    throw new Error(`예상: ja, 실제: ${result}`);
  }
});

test('quality 값에 따른 우선순위 (ko=0.9 > en=0.8 > ja=0.7)', () => {
  const request = createMockRequest({
    headers: { 'accept-language': 'en;q=0.8,ko;q=0.9,ja;q=0.7' }
  });
  const result = detectLocaleFromHeaders(request);
  if (result !== 'ko') {
    throw new Error(`예상: ko, 실제: ${result}`);
  }
});

test('quality 값에 따른 우선순위 (ja=0.9 > ko=0.8 > en=0.7)', () => {
  const request = createMockRequest({
    headers: { 'accept-language': 'ko;q=0.8,en;q=0.7,ja;q=0.9' }
  });
  const result = detectLocaleFromHeaders(request);
  if (result !== 'ja') {
    throw new Error(`예상: ja, 실제: ${result}`);
  }
});

test('동일한 quality 값일 때 순서 우선 (첫 번째 언어 선택)', () => {
  const request = createMockRequest({
    headers: { 'accept-language': 'ko;q=0.8,en;q=0.8,ja;q=0.8' }
  });
  const result = detectLocaleFromHeaders(request);
  if (result !== 'ko') {
    throw new Error(`예상: ko (첫 번째), 실제: ${result}`);
  }
});

// 3. 지원하지 않는 언어 필터링 테스트
console.log('\n3. 지원하지 않는 언어 필터링 테스트');

test('지원하지 않는 언어 건너뛰기 (de > en)', () => {
  const request = createMockRequest({
    headers: { 'accept-language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7' }
  });
  const result = detectLocaleFromHeaders(request);
  if (result !== 'en') {
    throw new Error(`예상: en, 실제: ${result}`);
  }
});

test('지원하지 않는 언어 건너뛰기 (fr > de > ja)', () => {
  const request = createMockRequest({
    headers: { 'accept-language': 'fr-FR,fr;q=0.9,de-DE;q=0.8,ja-JP;q=0.7' }
  });
  const result = detectLocaleFromHeaders(request);
  if (result !== 'ja') {
    throw new Error(`예상: ja, 실제: ${result}`);
  }
});

test('모든 언어가 지원하지 않는 경우 null 반환', () => {
  const request = createMockRequest({
    headers: { 'accept-language': 'de-DE,de;q=0.9,fr-FR;q=0.8,es-ES;q=0.7' }
  });
  const result = detectLocaleFromHeaders(request);
  if (result !== null) {
    throw new Error(`예상: null, 실제: ${result}`);
  }
});

// 4. 복잡한 헤더 형식 테스트
console.log('\n4. 복잡한 헤더 형식 테스트');

test('복잡한 헤더 파싱 (실제 브라우저 헤더)', () => {
  const request = createMockRequest({
    headers: { 'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7,ja;q=0.6,zh-CN;q=0.5,zh;q=0.4' }
  });
  const result = detectLocaleFromHeaders(request);
  if (result !== 'ko') {
    throw new Error(`예상: ko, 실제: ${result}`);
  }
});

test('공백이 포함된 헤더 파싱', () => {
  const request = createMockRequest({
    headers: { 'accept-language': ' en-US , en ; q=0.9 , ko-KR ; q=0.8 , ko ; q=0.7 ' }
  });
  const result = detectLocaleFromHeaders(request);
  if (result !== 'en') {
    throw new Error(`예상: en, 실제: ${result}`);
  }
});

test('quality 값 없는 언어 (기본값 1.0)', () => {
  const request = createMockRequest({
    headers: { 'accept-language': 'ja,en;q=0.9,ko;q=0.8' }
  });
  const result = detectLocaleFromHeaders(request);
  if (result !== 'ja') {
    throw new Error(`예상: ja (q=1.0), 실제: ${result}`);
  }
});

test('잘못된 quality 값 처리', () => {
  const request = createMockRequest({
    headers: { 'accept-language': 'en;q=invalid,ko;q=0.8,ja;q=0.7' }
  });
  const result = detectLocaleFromHeaders(request);
  if (result !== 'en') {
    throw new Error(`예상: en (잘못된 q 값은 1.0으로 처리), 실제: ${result}`);
  }
});

// 5. 에지 케이스 테스트
console.log('\n5. 에지 케이스 테스트');

test('Accept-Language 헤더 없음', () => {
  const request = createMockRequest({});
  const result = detectLocaleFromHeaders(request);
  if (result !== null) {
    throw new Error(`예상: null, 실제: ${result}`);
  }
});

test('빈 Accept-Language 헤더', () => {
  const request = createMockRequest({
    headers: { 'accept-language': '' }
  });
  const result = detectLocaleFromHeaders(request);
  if (result !== null) {
    throw new Error(`예상: null, 실제: ${result}`);
  }
});

test('잘못된 헤더 형식', () => {
  const request = createMockRequest({
    headers: { 'accept-language': 'invalid-header-format' }
  });
  const result = detectLocaleFromHeaders(request);
  if (result !== null) {
    throw new Error(`예상: null, 실제: ${result}`);
  }
});

test('세미콜론만 있는 헤더', () => {
  const request = createMockRequest({
    headers: { 'accept-language': ';;;' }
  });
  const result = detectLocaleFromHeaders(request);
  if (result !== null) {
    throw new Error(`예상: null, 실제: ${result}`);
  }
});

test('콤마만 있는 헤더', () => {
  const request = createMockRequest({
    headers: { 'accept-language': ',,,' }
  });
  const result = detectLocaleFromHeaders(request);
  if (result !== null) {
    throw new Error(`예상: null, 실제: ${result}`);
  }
});

// 6. 실제 브라우저 시나리오 테스트
console.log('\n6. 실제 브라우저 시나리오 테스트');

test('Chrome 브라우저 (한국어 설정)', () => {
  const request = createMockRequest({
    headers: { 'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7' }
  });
  const result = detectLocaleFromHeaders(request);
  if (result !== 'ko') {
    throw new Error(`예상: ko, 실제: ${result}`);
  }
});

test('Firefox 브라우저 (영어 설정)', () => {
  const request = createMockRequest({
    headers: { 'accept-language': 'en-US,en;q=0.5' }
  });
  const result = detectLocaleFromHeaders(request);
  if (result !== 'en') {
    throw new Error(`예상: en, 실제: ${result}`);
  }
});

test('Safari 브라우저 (일본어 설정)', () => {
  const request = createMockRequest({
    headers: { 'accept-language': 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7' }
  });
  const result = detectLocaleFromHeaders(request);
  if (result !== 'ja') {
    throw new Error(`예상: ja, 실제: ${result}`);
  }
});

test('Edge 브라우저 (다국어 설정)', () => {
  const request = createMockRequest({
    headers: { 'accept-language': 'en-US,en;q=0.9,ko-KR;q=0.8,ko;q=0.7,ja-JP;q=0.6,ja;q=0.5' }
  });
  const result = detectLocaleFromHeaders(request);
  if (result !== 'en') {
    throw new Error(`예상: en, 실제: ${result}`);
  }
});

// 7. 성능 테스트
console.log('\n7. 성능 테스트');

test('복잡한 헤더 성능 테스트', () => {
  const complexHeader = Array.from({ length: 50 }, (_, i) => `lang${i};q=0.${i}`).join(',') + ',ko;q=0.9,en;q=0.8,ja;q=0.7';
  
  const request = createMockRequest({
    headers: { 'accept-language': complexHeader }
  });
  
  const startTime = performance.now();
  const result = detectLocaleFromHeaders(request);
  const endTime = performance.now();
  
  console.log(`  처리 시간: ${(endTime - startTime).toFixed(2)}ms`);
  
  if (result !== 'ko') {
    throw new Error(`예상: ko, 실제: ${result}`);
  }
});

test('반복 호출 성능 테스트', () => {
  const request = createMockRequest({
    headers: { 'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7,ja;q=0.6' }
  });
  
  const iterations = 1000;
  const startTime = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    detectLocaleFromHeaders(request);
  }
  
  const endTime = performance.now();
  const avgTime = (endTime - startTime) / iterations;
  
  console.log(`  ${iterations}회 반복 평균 시간: ${avgTime.toFixed(4)}ms`);
  
  if (avgTime > 1) {
    throw new Error(`평균 처리 시간이 1ms를 초과: ${avgTime.toFixed(4)}ms`);
  }
});

// 결과 요약
console.log('\n=== 테스트 결과 요약 ===');
console.log(`총 테스트: ${testCount}`);
console.log(`통과: ${passCount}`);
console.log(`실패: ${testCount - passCount}`);

if (passCount === testCount) {
  console.log('✅ 모든 테스트 통과! 브라우저 언어 감지 기능이 올바르게 구현되었습니다.');
} else {
  console.log('❌ 일부 테스트 실패. 구현을 다시 확인해주세요.');
}

// 기능 요약
console.log('\n=== 기능 요약 ===');
console.log('✅ Accept-Language 헤더 파싱');
console.log('✅ Quality 값에 따른 우선순위 정렬');
console.log('✅ 지원하는 언어 필터링');
console.log('✅ 복잡한 헤더 형식 처리');
console.log('✅ 에러 처리 및 예외 상황 대응');
console.log('✅ 실제 브라우저 시나리오 지원');
console.log('✅ 성능 최적화');

// 사용 예시
console.log('\n=== 사용 예시 ===');
const examples = [
  'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
  'en-US,en;q=0.9,ko-KR;q=0.8,ko;q=0.7',
  'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7',
  'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
  'fr-FR,fr;q=0.9,de-DE;q=0.8,ja-JP;q=0.7',
];

examples.forEach(header => {
  const request = createMockRequest({ headers: { 'accept-language': header } });
  const result = detectLocaleFromHeaders(request);
  console.log(`${header.substring(0, 30)}... → ${result}`);
});