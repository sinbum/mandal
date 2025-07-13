import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// next-intl 미들웨어 생성
const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  // 정적 자산과 API 경로는 제외
  if (request.nextUrl.pathname.startsWith('/_next') || 
      request.nextUrl.pathname.startsWith('/static') ||
      request.nextUrl.pathname.startsWith('/api') ||
      request.nextUrl.pathname.startsWith('/favicon.ico') ||
      request.nextUrl.pathname.startsWith('/logo') ||
      request.nextUrl.pathname.startsWith('/manifest.json')
    ) {
    return NextResponse.next()
  }
  
  // 로케일 별칭 처리 (jp → ja)
  const pathname = request.nextUrl.pathname
  if (pathname === '/jp' || pathname.startsWith('/jp/')) {
    const newUrl = request.nextUrl.clone()
    newUrl.pathname = pathname.replace(/^\/jp/, '/ja')
    return NextResponse.redirect(newUrl)
  }

  // 1. 먼저 i18n 미들웨어 실행 (로케일 감지 및 리다이렉트)
  console.log('[Middleware] Original pathname:', request.nextUrl.pathname);
  const intlResponse = intlMiddleware(request);
  
  // i18n 미들웨어가 리다이렉트를 반환한 경우, 즉시 반환
  if (intlResponse && intlResponse.status !== 200) {
    console.log('[Middleware] Intl redirect:', intlResponse.headers.get('location'));
    return intlResponse;
  }

  // 2. 로케일이 포함된 경로에서 공개 경로 확인
  const updatedPathname = request.nextUrl.pathname;
  const locale = updatedPathname.split('/')[1]; // /ko/auth/login -> ko
  console.log('[Middleware] Detected locale:', locale, 'from path:', updatedPathname);
  
  // 로케일을 제거한 실제 경로
  const pathWithoutLocale = updatedPathname.replace(`/${locale}`, '') || '/';
  
  // 공개 경로들 (인증이 필요없는 페이지들)
  const publicPaths = [
    '/',  // 랜딩 페이지
    '/auth/login',
    '/auth/signup',
    '/auth/confirm',
    '/auth/logout',
    '/error'
  ];

  // 공개 페이지인 경우 인증 체크 건너뛰기
  if (publicPaths.includes(pathWithoutLocale)) {
    return intlResponse || NextResponse.next();
  }

  // 3. Supabase 인증 미들웨어 실행
  return await updateSession(request);
}

// 미들웨어가 실행될 경로를 지정합니다
export const config = {
  matcher: [
    // 모든 요청에 대해 실행하되, API 라우트와 정적 파일은 제외
    '/((?!api|_next/static|_next/image|favicon.ico|logo|manifest.json).*)',
    // 루트 경로는 항상 포함
    '/'
  ]
} 