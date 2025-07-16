/**
 * locale-detection.ts 유틸리티 함수 테스트
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  mapCountryToLocale,
  isValidLocale,
  getClientIP,
  isLocalIP,
  detectLocaleFromHeaders,
  extractLocaleFromPath,
  getLocaleFromCookie,
  getCacheStats,
  clearCache,
  COUNTRY_LOCALE_MAP,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
} from '../locale-detection';

// NextRequest 모킹을 위한 타입 정의
interface MockNextRequest {
  headers: Map<string, string>;
  cookies: Map<string, { value: string }>;
  ip?: string;
  geo?: { country: string };
  nextUrl: { pathname: string };
}

// NextRequest 모킹 헬퍼
function createMockRequest(options: Partial<MockNextRequest> = {}): any {
  const headers = new Map(Object.entries(options.headers || {}));
  const cookies = new Map(Object.entries(options.cookies || {}));
  
  return {
    headers: {
      get: (key: string) => headers.get(key) || null,
    },
    cookies: {
      get: (key: string) => cookies.get(key) || undefined,
    },
    ip: options.ip,
    geo: options.geo,
    nextUrl: {
      pathname: options.nextUrl?.pathname || '/',
    },
  };
}

describe('locale-detection 유틸리티 함수', () => {
  beforeEach(() => {
    clearCache();
  });

  describe('mapCountryToLocale 함수', () => {
    it('한국(KR)을 ko로 매핑해야 한다', () => {
      expect(mapCountryToLocale('KR')).toBe('ko');
      expect(mapCountryToLocale('kr')).toBe('ko');
    });

    it('일본(JP)을 ja로 매핑해야 한다', () => {
      expect(mapCountryToLocale('JP')).toBe('ja');
      expect(mapCountryToLocale('jp')).toBe('ja');
    });

    it('영어권 국가들을 en으로 매핑해야 한다', () => {
      const englishCountries = ['US', 'GB', 'CA', 'AU', 'NZ', 'IE'];
      englishCountries.forEach(country => {
        expect(mapCountryToLocale(country)).toBe('en');
        expect(mapCountryToLocale(country.toLowerCase())).toBe('en');
      });
    });

    it('기타 아시아 국가들을 en으로 매핑해야 한다', () => {
      const asianCountries = ['CN', 'TW', 'HK', 'SG', 'MY', 'TH', 'VN', 'PH', 'IN'];
      asianCountries.forEach(country => {
        expect(mapCountryToLocale(country)).toBe('en');
      });
    });

    it('유럽 국가들을 en으로 매핑해야 한다', () => {
      const europeanCountries = ['DE', 'FR', 'IT', 'ES', 'NL', 'SE', 'NO', 'DK', 'FI'];
      europeanCountries.forEach(country => {
        expect(mapCountryToLocale(country)).toBe('en');
      });
    });

    it('존재하지 않는 국가 코드에 대해 기본값을 반환해야 한다', () => {
      expect(mapCountryToLocale('XX')).toBe(DEFAULT_LOCALE);
      expect(mapCountryToLocale('YY')).toBe(DEFAULT_LOCALE);
      expect(mapCountryToLocale('ZZ')).toBe(DEFAULT_LOCALE);
    });

    it('빈 문자열에 대해 기본값을 반환해야 한다', () => {
      expect(mapCountryToLocale('')).toBe(DEFAULT_LOCALE);
    });

    it('null/undefined에 대해 기본값을 반환해야 한다', () => {
      expect(mapCountryToLocale(null as any)).toBe(DEFAULT_LOCALE);
      expect(mapCountryToLocale(undefined as any)).toBe(DEFAULT_LOCALE);
    });
  });

  describe('isValidLocale 함수', () => {
    it('지원하는 로케일에 대해 true를 반환해야 한다', () => {
      SUPPORTED_LOCALES.forEach(locale => {
        expect(isValidLocale(locale)).toBe(true);
      });
    });

    it('지원하지 않는 로케일에 대해 false를 반환해야 한다', () => {
      expect(isValidLocale('de')).toBe(false);
      expect(isValidLocale('fr')).toBe(false);
      expect(isValidLocale('zh')).toBe(false);
      expect(isValidLocale('es')).toBe(false);
    });

    it('빈 문자열에 대해 false를 반환해야 한다', () => {
      expect(isValidLocale('')).toBe(false);
    });

    it('null/undefined에 대해 false를 반환해야 한다', () => {
      expect(isValidLocale(null as any)).toBe(false);
      expect(isValidLocale(undefined as any)).toBe(false);
    });
  });

  describe('getClientIP 함수', () => {
    it('CF-Connecting-IP 헤더에서 IP를 추출해야 한다', () => {
      const request = createMockRequest({
        headers: { 'cf-connecting-ip': '203.0.113.1' }
      });
      expect(getClientIP(request)).toBe('203.0.113.1');
    });

    it('X-Forwarded-For 헤더에서 첫 번째 IP를 추출해야 한다', () => {
      const request = createMockRequest({
        headers: { 'x-forwarded-for': '203.0.113.1, 198.51.100.1, 192.0.2.1' }
      });
      expect(getClientIP(request)).toBe('203.0.113.1');
    });

    it('X-Real-IP 헤더에서 IP를 추출해야 한다', () => {
      const request = createMockRequest({
        headers: { 'x-real-ip': '203.0.113.1' }
      });
      expect(getClientIP(request)).toBe('203.0.113.1');
    });

    it('request.ip에서 IP를 추출해야 한다', () => {
      const request = createMockRequest({ ip: '203.0.113.1' });
      expect(getClientIP(request)).toBe('203.0.113.1');
    });

    it('IP를 찾을 수 없을 때 null을 반환해야 한다', () => {
      const request = createMockRequest();
      expect(getClientIP(request)).toBe(null);
    });

    it('CF-Connecting-IP가 X-Forwarded-For보다 우선순위가 높아야 한다', () => {
      const request = createMockRequest({
        headers: {
          'cf-connecting-ip': '203.0.113.1',
          'x-forwarded-for': '198.51.100.1'
        }
      });
      expect(getClientIP(request)).toBe('203.0.113.1');
    });
  });

  describe('isLocalIP 함수', () => {
    it('로컬 IP 주소들을 정확히 식별해야 한다', () => {
      const localIPs = [
        '127.0.0.1',
        '127.0.0.2',
        '192.168.1.1',
        '192.168.0.100',
        '10.0.0.1',
        '10.255.255.255',
        '172.16.0.1',
        '172.31.255.255',
        '::1',
        'localhost',
        'LOCALHOST',
        '0.0.0.0',
        '169.254.1.1',
        'fe80::1',
        '::ffff:192.168.1.1',
        '::ffff:10.0.0.1',
      ];

      localIPs.forEach(ip => {
        expect(isLocalIP(ip)).toBe(true);
      });
    });

    it('공개 IP 주소들을 정확히 식별해야 한다', () => {
      const publicIPs = [
        '8.8.8.8',
        '1.1.1.1',
        '203.0.113.1',
        '198.51.100.1',
        '192.0.2.1',
        '2001:db8::1',
        '173.252.74.22', // Facebook
        '172.217.12.14', // Google (public range)
      ];

      publicIPs.forEach(ip => {
        expect(isLocalIP(ip)).toBe(false);
      });
    });

    it('빈 문자열에 대해 true를 반환해야 한다', () => {
      expect(isLocalIP('')).toBe(true);
    });

    it('null/undefined에 대해 true를 반환해야 한다', () => {
      expect(isLocalIP(null as any)).toBe(true);
      expect(isLocalIP(undefined as any)).toBe(true);
    });
  });

  describe('detectLocaleFromHeaders 함수', () => {
    it('Accept-Language 헤더에서 한국어를 감지해야 한다', () => {
      const request = createMockRequest({
        headers: { 'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8' }
      });
      expect(detectLocaleFromHeaders(request)).toBe('ko');
    });

    it('Accept-Language 헤더에서 영어를 감지해야 한다', () => {
      const request = createMockRequest({
        headers: { 'accept-language': 'en-US,en;q=0.9,ko;q=0.8' }
      });
      expect(detectLocaleFromHeaders(request)).toBe('en');
    });

    it('Accept-Language 헤더에서 일본어를 감지해야 한다', () => {
      const request = createMockRequest({
        headers: { 'accept-language': 'ja-JP,ja;q=0.9,en;q=0.8' }
      });
      expect(detectLocaleFromHeaders(request)).toBe('ja');
    });

    it('품질 점수에 따라 우선순위를 정해야 한다', () => {
      const request = createMockRequest({
        headers: { 'accept-language': 'en;q=0.8,ko;q=0.9,ja;q=0.7' }
      });
      expect(detectLocaleFromHeaders(request)).toBe('ko');
    });

    it('지원하지 않는 언어는 건너뛰어야 한다', () => {
      const request = createMockRequest({
        headers: { 'accept-language': 'de-DE,de;q=0.9,en-US;q=0.8' }
      });
      expect(detectLocaleFromHeaders(request)).toBe('en');
    });

    it('Accept-Language 헤더가 없을 때 null을 반환해야 한다', () => {
      const request = createMockRequest();
      expect(detectLocaleFromHeaders(request)).toBe(null);
    });

    it('잘못된 Accept-Language 헤더에 대해 null을 반환해야 한다', () => {
      const request = createMockRequest({
        headers: { 'accept-language': 'invalid-header' }
      });
      expect(detectLocaleFromHeaders(request)).toBe(null);
    });
  });

  describe('extractLocaleFromPath 함수', () => {
    it('경로에서 로케일을 정확히 추출해야 한다', () => {
      expect(extractLocaleFromPath('/ko/app')).toBe('ko');
      expect(extractLocaleFromPath('/en/auth/login')).toBe('en');
      expect(extractLocaleFromPath('/ja/app/settings')).toBe('ja');
    });

    it('루트 경로에서 로케일을 추출해야 한다', () => {
      expect(extractLocaleFromPath('/ko/')).toBe('ko');
      expect(extractLocaleFromPath('/en/')).toBe('en');
      expect(extractLocaleFromPath('/ja/')).toBe('ja');
    });

    it('지원하지 않는 로케일에 대해 null을 반환해야 한다', () => {
      expect(extractLocaleFromPath('/de/app')).toBe(null);
      expect(extractLocaleFromPath('/fr/auth/login')).toBe(null);
    });

    it('로케일이 없는 경로에 대해 null을 반환해야 한다', () => {
      expect(extractLocaleFromPath('/app')).toBe(null);
      expect(extractLocaleFromPath('/auth/login')).toBe(null);
      expect(extractLocaleFromPath('/')).toBe(null);
    });

    it('빈 경로에 대해 null을 반환해야 한다', () => {
      expect(extractLocaleFromPath('')).toBe(null);
    });
  });

  describe('getLocaleFromCookie 함수', () => {
    it('쿠키에서 유효한 로케일을 추출해야 한다', () => {
      const request = createMockRequest({
        cookies: { 'NEXT_LOCALE': { value: 'ko' } }
      });
      expect(getLocaleFromCookie(request)).toBe('ko');
    });

    it('쿠키에서 유효하지 않은 로케일에 대해 null을 반환해야 한다', () => {
      const request = createMockRequest({
        cookies: { 'NEXT_LOCALE': { value: 'de' } }
      });
      expect(getLocaleFromCookie(request)).toBe(null);
    });

    it('쿠키가 없을 때 null을 반환해야 한다', () => {
      const request = createMockRequest();
      expect(getLocaleFromCookie(request)).toBe(null);
    });
  });

  describe('캐시 기능', () => {
    it('캐시 통계를 정확히 반환해야 한다', () => {
      const initialStats = getCacheStats();
      expect(initialStats.size).toBe(0);
      expect(initialStats.entries).toEqual([]);
    });

    it('캐시 초기화가 정상 동작해야 한다', () => {
      clearCache();
      const stats = getCacheStats();
      expect(stats.size).toBe(0);
    });
  });

  describe('상수 정의', () => {
    it('COUNTRY_LOCALE_MAP이 올바른 매핑을 포함해야 한다', () => {
      expect(COUNTRY_LOCALE_MAP['KR']).toBe('ko');
      expect(COUNTRY_LOCALE_MAP['JP']).toBe('ja');
      expect(COUNTRY_LOCALE_MAP['US']).toBe('en');
      expect(COUNTRY_LOCALE_MAP['GB']).toBe('en');
    });

    it('SUPPORTED_LOCALES가 올바른 로케일을 포함해야 한다', () => {
      expect(SUPPORTED_LOCALES).toContain('ko');
      expect(SUPPORTED_LOCALES).toContain('en');
      expect(SUPPORTED_LOCALES).toContain('ja');
    });

    it('DEFAULT_LOCALE가 올바르게 설정되어야 한다', () => {
      expect(DEFAULT_LOCALE).toBe('ko');
    });
  });
});