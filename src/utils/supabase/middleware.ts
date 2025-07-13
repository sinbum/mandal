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

  // 공개 경로들 (인증이 필요없는 페이지들) - 로케일 제거 후 확인
  const publicPaths = [
    '/',  // 랜딩 페이지
    '/auth/login',
    '/auth/signup',
    '/auth/confirm',
    '/auth/logout',
    '/error'
  ];

  // 로케일을 제거한 경로 확인
  const pathWithoutLocale = request.nextUrl.pathname.replace(/^\/[a-z]{2}/, '');
  const isPublicPath = publicPaths.includes(pathWithoutLocale || '/');

  // 정적 자산 및 공개 페이지는 미들웨어를 건너뜁니다
  if (request.nextUrl.pathname.startsWith('/_next') || 
      request.nextUrl.pathname.startsWith('/static') ||
      request.nextUrl.pathname.startsWith('/api') ||
      request.nextUrl.pathname.startsWith('/favicon.ico') ||
      isPublicPath
    ) {
    return NextResponse.next()
  }

  if (
    !user
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    
    // 현재 로케일 추출
    const currentLocale = request.nextUrl.pathname.split('/')[1];
    const validLocales = ['ko', 'en', 'ja'];
    const locale = validLocales.includes(currentLocale) ? currentLocale : 'ko';
    
    url.pathname = `/${locale}/auth/login`
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