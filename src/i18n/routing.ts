import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  // 지원하는 모든 로케일 (ja로 표준화)
  locales: ['ko', 'en', 'ja'],
  
  // 기본 로케일 (영어로 변경)
  defaultLocale: 'en',
  
  // 로케일 감지 방식 (브라우저 언어 자동 감지 활성화)
  localeDetection: true,
  
  // 기본 로케일 경로에서도 prefix 사용 
  localePrefix: 'always',
  
  // 경로 이름 (동적 라우트 포함)
  pathnames: {
    '/': '/',
    '/app': '/app',
    '/app/settings': '/app/settings', 
    '/app/cell/[id]': '/app/cell/[id]',
    '/auth/login': '/auth/login',
    '/auth/signup': '/auth/signup',
    '/auth/confirm': '/auth/confirm',
    '/auth/logout': '/auth/logout'
  }
});

// 타입 정의
export type Pathnames = keyof typeof routing.pathnames;
export type Locale = (typeof routing.locales)[number];