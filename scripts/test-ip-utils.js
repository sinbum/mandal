/**
 * IP 주소 추출 및 검증 유틸리티 함수 테스트
 */

console.log('=== IP 주소 추출 및 검증 유틸리티 테스트 시작 ===\n');

// 테스트 헬퍼 함수
function createMockRequest(options = {}) {
  const headers = new Map(Object.entries(options.headers || {}));
  
  return {
    headers: {
      get: (key) => headers.get(key) || null,
    },
    ip: options.ip,
  };
}

// getClientIP 함수 (locale-detection.ts에서 복사)
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

// isLocalIP 함수 (locale-detection.ts에서 복사)
function isLocalIP(ip) {
  if (!ip) return true;
  
  // 특수 케이스: localhost 문자열
  if (/^localhost$/i.test(ip)) {
    return true;
  }
  
  // IPv4 로컬 주소 패턴 (더 정확한 검증)
  const ipv4LocalPatterns = [
    /^127\.(\d{1,3}\.){2}\d{1,3}$/,           // 127.0.0.1 (localhost)
    /^192\.168\.(\d{1,3}\.)\d{1,3}$/,        // 192.168.x.x (사설 IP)
    /^10\.(\d{1,3}\.){2}\d{1,3}$/,           // 10.x.x.x (사설 IP)
    /^172\.(1[6-9]|2\d|3[0-1])\.(\d{1,3}\.)\d{1,3}$/, // 172.16.x.x - 172.31.x.x (사설 IP)
    /^0\.0\.0\.0$/,                          // 0.0.0.0
    /^169\.254\.(\d{1,3}\.)\d{1,3}$/,        // 169.254.x.x (링크 로컬)
  ];
  
  // IPv6 로컬 주소 패턴
  const ipv6LocalPatterns = [
    /^::1$/,                                 // IPv6 localhost
    /^fe80::/i,                             // IPv6 링크 로컬
    /^::ffff:192\.168\./,                   // IPv4-mapped IPv6 사설 IP
    /^::ffff:10\./,                         // IPv4-mapped IPv6 사설 IP
    /^::ffff:172\.(1[6-9]|2\d|3[0-1])\./,  // IPv4-mapped IPv6 사설 IP
  ];
  
  // IPv4 패턴 확인
  for (const pattern of ipv4LocalPatterns) {
    if (pattern.test(ip)) {
      // 추가 검증: 각 옥텟이 0-255 범위인지 확인
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

// 1. getClientIP 함수 테스트
console.log('1. getClientIP 함수 테스트');

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

test('X-Real-IP 헤더에서 IP 추출', () => {
  const request = createMockRequest({
    headers: { 'x-real-ip': '203.0.113.1' }
  });
  const result = getClientIP(request);
  if (result !== '203.0.113.1') {
    throw new Error(`예상: 203.0.113.1, 실제: ${result}`);
  }
});

test('request.ip에서 IP 추출', () => {
  const request = createMockRequest({ ip: '203.0.113.1' });
  const result = getClientIP(request);
  if (result !== '203.0.113.1') {
    throw new Error(`예상: 203.0.113.1, 실제: ${result}`);
  }
});

test('CF-Connecting-IP 우선순위 테스트', () => {
  const request = createMockRequest({
    headers: {
      'cf-connecting-ip': '203.0.113.1',
      'x-forwarded-for': '198.51.100.1',
      'x-real-ip': '192.0.2.1'
    },
    ip: '172.16.0.1'
  });
  const result = getClientIP(request);
  if (result !== '203.0.113.1') {
    throw new Error(`예상: 203.0.113.1, 실제: ${result}`);
  }
});

test('X-Forwarded-For 우선순위 테스트', () => {
  const request = createMockRequest({
    headers: {
      'x-forwarded-for': '198.51.100.1',
      'x-real-ip': '192.0.2.1'
    },
    ip: '172.16.0.1'
  });
  const result = getClientIP(request);
  if (result !== '198.51.100.1') {
    throw new Error(`예상: 198.51.100.1, 실제: ${result}`);
  }
});

test('X-Real-IP 우선순위 테스트', () => {
  const request = createMockRequest({
    headers: {
      'x-real-ip': '192.0.2.1'
    },
    ip: '172.16.0.1'
  });
  const result = getClientIP(request);
  if (result !== '192.0.2.1') {
    throw new Error(`예상: 192.0.2.1, 실제: ${result}`);
  }
});

test('헤더 없을 때 request.ip 사용', () => {
  const request = createMockRequest({ ip: '172.16.0.1' });
  const result = getClientIP(request);
  if (result !== '172.16.0.1') {
    throw new Error(`예상: 172.16.0.1, 실제: ${result}`);
  }
});

test('IP를 찾을 수 없을 때 null 반환', () => {
  const request = createMockRequest();
  const result = getClientIP(request);
  if (result !== null) {
    throw new Error(`예상: null, 실제: ${result}`);
  }
});

test('X-Forwarded-For 다중 IP 처리', () => {
  const request = createMockRequest({
    headers: { 'x-forwarded-for': '  203.0.113.1  ,  198.51.100.1  ,  192.0.2.1  ' }
  });
  const result = getClientIP(request);
  if (result !== '203.0.113.1') {
    throw new Error(`예상: 203.0.113.1, 실제: ${result}`);
  }
});

// 2. isLocalIP 함수 테스트
console.log('\n2. isLocalIP 함수 테스트');

test('IPv4 로컬 IP 주소 식별', () => {
  const localIPs = [
    '127.0.0.1',      // localhost
    '127.0.0.2',      // localhost range
    '127.255.255.255', // localhost range
    '192.168.1.1',    // private class C
    '192.168.0.100',  // private class C
    '192.168.255.255', // private class C
    '10.0.0.1',       // private class A
    '10.255.255.255', // private class A
    '172.16.0.1',     // private class B
    '172.31.255.255', // private class B
    '172.20.1.1',     // private class B
    '0.0.0.0',        // any address
    '169.254.1.1',    // link-local
    '169.254.255.255', // link-local
  ];

  localIPs.forEach(ip => {
    const result = isLocalIP(ip);
    if (!result) {
      throw new Error(`${ip}가 로컬 IP로 인식되지 않음`);
    }
  });
});

test('IPv6 로컬 IP 주소 식별', () => {
  const localIPs = [
    '::1',                    // IPv6 localhost
    'fe80::1',               // IPv6 link-local
    'fe80::abcd:ef01:2345:6789', // IPv6 link-local
    '::ffff:192.168.1.1',    // IPv4-mapped IPv6 private
    '::ffff:10.0.0.1',       // IPv4-mapped IPv6 private
    '::ffff:172.16.0.1',     // IPv4-mapped IPv6 private
  ];

  localIPs.forEach(ip => {
    const result = isLocalIP(ip);
    if (!result) {
      throw new Error(`${ip}가 로컬 IP로 인식되지 않음`);
    }
  });
});

test('특수 로컬 주소 식별', () => {
  const localAddresses = [
    'localhost',
    'LOCALHOST',
    'LocalHost',
  ];

  localAddresses.forEach(addr => {
    const result = isLocalIP(addr);
    if (!result) {
      throw new Error(`${addr}가 로컬 주소로 인식되지 않음`);
    }
  });
});

test('공개 IPv4 주소 식별', () => {
  const publicIPs = [
    '8.8.8.8',        // Google DNS
    '1.1.1.1',        // Cloudflare DNS
    '203.0.113.1',    // documentation IP
    '198.51.100.1',   // documentation IP
    '192.0.2.1',      // documentation IP
    '173.252.74.22',  // Facebook
    '172.217.12.14',  // Google (public range)
    '172.15.255.255', // just below private range
    '172.32.0.1',     // just above private range
    '9.255.255.255',  // just below 10.x.x.x
    '11.0.0.1',       // just above 10.x.x.x
    '192.167.255.255', // just below 192.168.x.x
    '192.169.0.1',    // just above 192.168.x.x
  ];

  publicIPs.forEach(ip => {
    const result = isLocalIP(ip);
    if (result) {
      throw new Error(`${ip}가 로컬 IP로 잘못 인식됨`);
    }
  });
});

test('공개 IPv6 주소 식별', () => {
  const publicIPs = [
    '2001:db8::1',           // documentation IPv6
    '2001:4860:4860::8888',  // Google DNS IPv6
    '2606:4700:4700::1111',  // Cloudflare DNS IPv6
    '::ffff:8.8.8.8',       // IPv4-mapped IPv6 public
  ];

  publicIPs.forEach(ip => {
    const result = isLocalIP(ip);
    if (result) {
      throw new Error(`${ip}가 로컬 IP로 잘못 인식됨`);
    }
  });
});

test('null/undefined/빈 문자열 처리', () => {
  const emptyValues = [null, undefined, ''];
  
  emptyValues.forEach(value => {
    const result = isLocalIP(value);
    if (!result) {
      throw new Error(`${value}에 대해 true를 반환해야 함`);
    }
  });
});

test('잘못된 IP 형식 처리', () => {
  const invalidIPs = [
    '256.256.256.256',  // 잘못된 IPv4
    '192.168.1',        // 불완전한 IPv4
    '192.168.1.1.1',    // 너무 많은 옥텟
    'not-an-ip',        // 완전히 잘못된 형식
    '192.168.1.a',      // 문자 포함
    '192.168.-1.1',     // 음수
    '999.999.999.999',  // 범위 초과
  ];

  // 잘못된 형식에 대해서는 false를 반환해야 함
  invalidIPs.forEach(ip => {
    const result = isLocalIP(ip);
    if (result) {
      throw new Error(`${ip}가 로컬 IP로 잘못 인식됨`);
    }
  });
});

// 3. 통합 테스트
console.log('\n3. 통합 테스트');

test('실제 시나리오: Cloudflare 뒤의 서버', () => {
  const request = createMockRequest({
    headers: {
      'cf-connecting-ip': '203.0.113.1',
      'x-forwarded-for': '203.0.113.1, 172.68.1.1',
      'x-real-ip': '172.68.1.1'
    },
    ip: '172.68.1.1'
  });
  
  const clientIP = getClientIP(request);
  const isLocal = isLocalIP(clientIP);
  
  if (clientIP !== '203.0.113.1') {
    throw new Error(`클라이언트 IP 추출 실패: ${clientIP}`);
  }
  if (isLocal) {
    throw new Error(`공개 IP가 로컬 IP로 잘못 인식됨: ${clientIP}`);
  }
});

test('실제 시나리오: 로드 밸런서 뒤의 서버', () => {
  const request = createMockRequest({
    headers: {
      'x-forwarded-for': '192.168.1.100, 10.0.0.1',
      'x-real-ip': '10.0.0.1'
    },
    ip: '10.0.0.1'
  });
  
  const clientIP = getClientIP(request);
  const isLocal = isLocalIP(clientIP);
  
  if (clientIP !== '192.168.1.100') {
    throw new Error(`클라이언트 IP 추출 실패: ${clientIP}`);
  }
  if (!isLocal) {
    throw new Error(`로컬 IP가 공개 IP로 잘못 인식됨: ${clientIP}`);
  }
});

test('실제 시나리오: 개발 환경', () => {
  const request = createMockRequest({
    ip: '127.0.0.1'
  });
  
  const clientIP = getClientIP(request);
  const isLocal = isLocalIP(clientIP);
  
  if (clientIP !== '127.0.0.1') {
    throw new Error(`클라이언트 IP 추출 실패: ${clientIP}`);
  }
  if (!isLocal) {
    throw new Error(`로컬 IP가 공개 IP로 잘못 인식됨: ${clientIP}`);
  }
});

// 결과 요약
console.log('\n=== 테스트 결과 요약 ===');
console.log(`총 테스트: ${testCount}`);
console.log(`통과: ${passCount}`);
console.log(`실패: ${testCount - passCount}`);

if (passCount === testCount) {
  console.log('✅ 모든 테스트 통과! IP 주소 추출 및 검증 유틸리티가 올바르게 구현되었습니다.');
} else {
  console.log('❌ 일부 테스트 실패. 구현을 다시 확인해주세요.');
}

// 사용 예시
console.log('\n=== 사용 예시 ===');
const examples = [
  {
    name: 'Vercel 환경',
    request: createMockRequest({
      headers: { 'x-forwarded-for': '203.0.113.1' },
      ip: '127.0.0.1'
    })
  },
  {
    name: 'Cloudflare 환경',
    request: createMockRequest({
      headers: { 'cf-connecting-ip': '198.51.100.1' }
    })
  },
  {
    name: '로컬 개발 환경',
    request: createMockRequest({
      ip: '127.0.0.1'
    })
  }
];

examples.forEach(({ name, request }) => {
  const ip = getClientIP(request);
  const isLocal = isLocalIP(ip);
  console.log(`${name}: IP=${ip}, 로컬=${isLocal}`);
});