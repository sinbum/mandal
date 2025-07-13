import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  // 지원하는 모든 로케일 (ja로 표준화)
  locales: ['ko', 'en', 'ja'],
  
  // 기본 로케일 (한국어)
  defaultLocale: 'ko',
  
  // 로케일 감지 방식 (URL 기반으로만 감지)
  localeDetection: false,
  
  // 기본 로케일 경로에서 prefix 제거 
  localePrefix: 'always',
  
  // 경로 이름 (동적 라우트 포함)
  pathnames: {
    '/': '/',
    '/app': '/app',
    '/app/settings': '/app/settings',
    '/app/profile': '/app/profile',
    '/app/cell/[id]': {
      ko: '/app/cell/[id]',
      en: '/app/cell/[id]',
      ja: '/app/cell/[id]'
    },
    '/auth/login': '/auth/login',
    '/auth/signup': '/auth/signup',
    '/auth/confirm': '/auth/confirm',
    '/auth/logout': '/auth/logout'
  }
});

// 타입 정의
export type Pathnames = keyof typeof routing.pathnames;
export type Locale = (typeof routing.locales)[number];