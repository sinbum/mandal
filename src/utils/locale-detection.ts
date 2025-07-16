/**
 * 다국어 지원을 위한 언어 감지 유틸리티
 * IP 기반 지역 감지 및 브라우저 언어 감지 기능 제공
 */

import type { NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';

// 타입 정의
export interface GeoLocation {
  country: string;
  region?: string;
  city?: string;
}

export interface LocaleDetectionResult {
  locale: Locale;
  source: 'url' | 'cookie' | 'ip' | 'header' | 'default';
  confidence: number;
}

export interface CacheEntry {
  country: string;
  timestamp: number;
}

// 상수 정의
export const COUNTRY_LOCALE_MAP: Record<string, Locale> = {
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

export const SUPPORTED_LOCALES: Locale[] = routing.locales;
export const DEFAULT_LOCALE: Locale = routing.defaultLocale;

// 캐싱 관련 상수
export const CACHE_DURATION = 1000 * 60 * 60; // 1시간
export const MAX_CACHE_SIZE = 1000;

// 메모리 캐시 (서버 재시작 시 초기화)
const geoCache = new Map<string, CacheEntry>();

/**
 * 로케일 유효성 검사
 */
export function isValidLocale(locale: string): locale is Locale {
  return SUPPORTED_LOCALES.includes(locale as Locale);
}

/**
 * 국가 코드를 로케일로 매핑
 */
export function mapCountryToLocale(country: string): Locale {
  const upperCountry = country?.toUpperCase();
  return COUNTRY_LOCALE_MAP[upperCountry] || DEFAULT_LOCALE;
}

/**
 * 클라이언트 IP 주소 추출
 */
export function getClientIP(request: NextRequest): string | null {
  // Vercel, Netlify 등에서 사용하는 표준 헤더들
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  if (forwardedFor) {
    // x-forwarded-for는 여러 IP를 포함할 수 있음 (client, proxy1, proxy2, ...)
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  // Next.js의 기본 IP (개발 환경에서는 undefined일 수 있음)
  return request.ip || null;
}

/**
 * 로컬 IP 주소 확인
 */
export function isLocalIP(ip: string): boolean {
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

/**
 * Accept-Language 헤더에서 언어 감지
 */
export function detectLocaleFromHeaders(request: NextRequest): Locale | null {
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

/**
 * 캐시된 지역 정보 조회
 */
function getCachedGeoLocation(ip: string): { country: string } | null {
  const cached = geoCache.get(ip);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return { country: cached.country };
  }
  
  return null;
}

/**
 * 지역 정보 캐시 저장
 */
function setCachedGeoLocation(ip: string, country: string): void {
  // 캐시 크기 제한
  if (geoCache.size >= MAX_CACHE_SIZE) {
    // 가장 오래된 항목 제거
    const oldestKey = geoCache.keys().next().value;
    if (oldestKey) {
      geoCache.delete(oldestKey);
    }
  }
  
  geoCache.set(ip, {
    country,
    timestamp: Date.now()
  });
}

/**
 * 외부 IP 지역 조회 API 호출 (개발 환경용)
 */
async function fetchGeoLocationFromAPI(ip: string): Promise<{ country: string } | null> {
  try {
    // 개발 환경에서만 외부 API 사용
    if (process.env.NODE_ENV !== 'development') {
      return null;
    }
    
    // 무료 IP 지역 조회 서비스 (실제 사용 시 API 키 및 제한 확인 필요)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000); // 1초 타임아웃
    
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LocaleDetection/1.0)',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.country_code && typeof data.country_code === 'string') {
      return {
        country: data.country_code.toUpperCase()
      };
    }
    
    return null;
  } catch (error) {
    console.error('외부 IP 지역 조회 API 호출 실패:', error);
    return null;
  }
}

/**
 * IP 기반 지역 감지
 */
export async function detectLocaleFromIP(request: NextRequest): Promise<Locale | null> {
  try {
    // 1. Vercel/Netlify 등의 지역 정보 사용 (우선순위)
    const geoCountry = request.geo?.country;
    if (geoCountry) {
      return mapCountryToLocale(geoCountry);
    }
    
    // 2. 클라이언트 IP 추출
    const clientIP = getClientIP(request);
    if (!clientIP || isLocalIP(clientIP)) {
      return null;
    }
    
    // 3. 캐시된 지역 정보 확인
    const cachedGeo = getCachedGeoLocation(clientIP);
    if (cachedGeo) {
      return mapCountryToLocale(cachedGeo.country);
    }
    
    // 4. 외부 API를 통한 지역 조회 (개발 환경만)
    const apiGeo = await fetchGeoLocationFromAPI(clientIP);
    if (apiGeo) {
      setCachedGeoLocation(clientIP, apiGeo.country);
      return mapCountryToLocale(apiGeo.country);
    }
    
    return null;
  } catch (error) {
    console.error('IP 기반 지역 감지 실패:', error);
    return null;
  }
}

/**
 * URL 경로에서 로케일 추출
 */
export function extractLocaleFromPath(pathname: string): Locale | null {
  const segments = pathname.split('/');
  const potentialLocale = segments[1];
  
  if (potentialLocale && isValidLocale(potentialLocale)) {
    return potentialLocale;
  }
  
  return null;
}

/**
 * 쿠키에서 저장된 로케일 조회
 */
export function getLocaleFromCookie(request: NextRequest): Locale | null {
  const savedLocale = request.cookies.get('NEXT_LOCALE')?.value;
  
  if (savedLocale && isValidLocale(savedLocale)) {
    return savedLocale;
  }
  
  return null;
}

/**
 * 통합 언어 감지 함수
 * 우선순위: URL > 쿠키 > IP > 브라우저 언어 > 기본값
 */
export async function detectLocale(request: NextRequest): Promise<LocaleDetectionResult> {
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

/**
 * 개발 환경 테스트용 모의 지역 설정
 */
export function getMockCountryForDevelopment(request: NextRequest): string | null {
  if (process.env.NODE_ENV === 'development') {
    return request.headers.get('x-mock-country');
  }
  return null;
}

/**
 * 캐시 통계 조회 (디버깅용)
 */
export function getCacheStats(): {
  size: number;
  entries: Array<{ ip: string; country: string; age: number }>;
} {
  const now = Date.now();
  const entries = Array.from(geoCache.entries()).map(([ip, entry]) => ({
    ip,
    country: entry.country,
    age: now - entry.timestamp
  }));
  
  return {
    size: geoCache.size,
    entries
  };
}

/**
 * 캐시 초기화 (테스트용)
 */
export function clearCache(): void {
  geoCache.clear();
}