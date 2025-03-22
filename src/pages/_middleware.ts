import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 현재 경로
  const { pathname } = request.nextUrl;
  
  // 로그인 상태 확인 (서버 측에서는 쿠키를 확인)
  const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true';
  
  // 인증이 필요한 페이지 목록
  const protectedRoutes = ['/', '/mandalart'];
  
  // 현재 경로가 인증이 필요한 페이지인지 확인
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // 인증이 필요한 페이지에 접근하려고 하지만 로그인하지 않은 경우
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }
  
  // 이미 로그인한 상태에서 로그인 페이지에 접근하려는 경우
  if (pathname === '/auth' && isLoggedIn) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
} 