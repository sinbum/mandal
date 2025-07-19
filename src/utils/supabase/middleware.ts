import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {

  let supabaseResponse = NextResponse.next({
    request,
  }
  )

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 로케일 추출 (경로에서 첫 번째 세그먼트)
  const pathname = request.nextUrl.pathname;
  const segments = pathname.split('/').filter(Boolean);
  const locale = segments[0];
  const supportedLocales = ['ko', 'en', 'ja'];
  
  // 로케일이 있는 경우 제거한 경로, 없으면 원본 경로 사용
  const pathWithoutLocale = supportedLocales.includes(locale) 
    ? '/' + segments.slice(1).join('/') 
    : pathname;

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
      publicPaths.includes(pathWithoutLocale)
    ) {
    return supabaseResponse
  }

  if (
    !user
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    // 로케일이 있으면 로케일을 유지하면서 리다이렉트
    if (supportedLocales.includes(locale)) {
      url.pathname = `/${locale}/auth/login`
    } else {
      url.pathname = '/auth/login'
    }
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}