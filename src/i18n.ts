import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// 지원하는 로케일
export const locales = ['ko', 'en', 'ja'] as const;
export type Locale = typeof locales[number];

// 기본 로케일
export const defaultLocale: Locale = 'ko';

// 로케일 별칭 매핑
export const localeAliases: Record<string, Locale> = {
  'ko-KR': 'ko',
  'ko-kr': 'ko',
  'korean': 'ko',
  'en-US': 'en',
  'en-us': 'en',
  'english': 'en',
  'ja-JP': 'ja',
  'ja-jp': 'ja',
  'japanese': 'ja',
};

// 로케일 검증 함수
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

// 로케일 정규화 함수 (별칭 처리 포함)
export function normalizeLocale(locale: string): Locale {
  const normalized = locale.toLowerCase();
  
  // 별칭이 있으면 변환
  if (localeAliases[normalized]) {
    return localeAliases[normalized];
  }
  
  // 직접 매칭
  if (isValidLocale(normalized)) {
    return normalized;
  }
  
  // 언어 코드만 추출 (예: en-US -> en)
  const languageCode = normalized.split('-')[0];
  if (isValidLocale(languageCode)) {
    return languageCode;
  }
  
  // 기본 로케일 반환
  return defaultLocale;
}

export default getRequestConfig(async ({ locale }) => {
  // 로케일 검증
  if (!isValidLocale(locale)) {
    notFound();
  }

  return {
    messages: (await import(`../messages/${locale}.yaml`)).default,
    timeZone: 'Asia/Seoul', // 기본 타임존
    now: new Date(),
  };
});