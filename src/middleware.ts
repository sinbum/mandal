import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // 공개 경로들 (인증이 필요없는 페이지들)
  const publicPaths = [
    '/',  // 랜딩 페이지
    '/auth/login',
    '/auth/signup',
    '/auth/confirm',
    '/auth/logout',
    '/error'
  ];

  // 정적 자산 및 공개 페이지는 미들웨어를 건너뜁니다
  if (request.nextUrl.pathname.startsWith('/_next') || 
      request.nextUrl.pathname.startsWith('/static') ||
      request.nextUrl.pathname.startsWith('/api') ||
      request.nextUrl.pathname.startsWith('/favicon.ico') ||
      publicPaths.includes(request.nextUrl.pathname)
    ) {
    return NextResponse.next()
  }

  return await updateSession(request)
}

// 미들웨어가 실행될 경로를 지정합니다
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
} 