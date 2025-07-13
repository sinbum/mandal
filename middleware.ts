import { NextResponse, type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale, normalizeLocale } from '@/i18n';
import { updateSession } from '@/utils/supabase/middleware';

// next-intl 미들웨어 생성
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localeDetection: true,
  localePrefix: 'always',
});

// 공개 경로들 (인증이 필요없는 페이지들)
const publicPaths = [
  '/',  // 랜딩 페이지
  '/auth/login',
  '/auth/signup',
  '/auth/confirm',
  '/auth/logout',
  '/error'
];

// 정적 자산 경로들
const staticPaths = [
  '/_next',
  '/static',
  '/api',
  '/favicon.ico',
  '/manifest.json',
  '/robots.txt',
  '/sitemap.xml',
];

function isStaticPath(pathname: string): boolean {
  return staticPaths.some(path => pathname.startsWith(path));
}

function isPublicPath(pathname: string): boolean {
  // 로케일 제거하고 확인
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '');
  return publicPaths.includes(pathWithoutLocale || '/');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 정적 자산은 미들웨어를 건너뜁니다
  if (isStaticPath(pathname)) {
    return NextResponse.next();
  }

  // 브라우저 언어 감지 및 로케일 정규화
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferredLanguage = acceptLanguage.split(',')[0].split(';')[0];
    const normalizedLocale = normalizeLocale(preferredLanguage);
    
    // 쿠키에 선호 언어 저장
    const response = NextResponse.next();
    response.cookies.set('NEXT_LOCALE', normalizedLocale, {
      maxAge: 60 * 60 * 24 * 365, // 1년
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
  }

  // 1. 먼저 intl 미들웨어 실행 (로케일 라우팅 처리)
  const intlResponse = intlMiddleware(request);
  
  // intl 미들웨어가 리다이렉트를 요청하면 그대로 반환
  if (intlResponse.status === 307 || intlResponse.status === 302) {
    return intlResponse;
  }

  // 2. 현재 경로가 공개 경로인지 확인
  if (isPublicPath(pathname)) {
    return intlResponse;
  }

  // 3. 인증이 필요한 경로에서 Supabase 세션 확인
  try {
    // intl 응답의 쿠키를 포함한 새로운 요청 생성
    const modifiedRequest = new Request(request);
    intlResponse.cookies.getAll().forEach(cookie => {
      modifiedRequest.headers.set('cookie', 
        modifiedRequest.headers.get('cookie') + `; ${cookie.name}=${cookie.value}`
      );
    });

    const supabaseResponse = await updateSession(request);
    
    // Supabase에서 리다이렉트를 요청하면 로케일과 함께 리다이렉트
    if (supabaseResponse.status === 307 || supabaseResponse.status === 302) {
      const redirectUrl = new URL(supabaseResponse.headers.get('location') || '/auth/login', request.url);
      
      // 현재 로케일 추출
      const currentLocale = pathname.split('/')[1];
      const validLocale = locales.includes(currentLocale as any) ? currentLocale : defaultLocale;
      
      // 로케일을 포함한 리다이렉트 URL 생성
      redirectUrl.pathname = `/${validLocale}${redirectUrl.pathname}`;
      
      return NextResponse.redirect(redirectUrl);
    }

    // intl 응답에 Supabase 쿠키 추가
    supabaseResponse.cookies.getAll().forEach(cookie => {
      intlResponse.cookies.set(cookie.name, cookie.value, cookie);
    });

    return intlResponse;
  } catch (error) {
    console.error('Middleware error:', error);
    return intlResponse;
  }
}

export const config = {
  // 미들웨어가 실행될 경로 패턴
  matcher: [
    // 다음을 제외한 모든 경로에서 실행:
    // - api 라우트
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public 폴더의 파일들
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|robots.txt|sitemap.xml).*)',
  ],
};