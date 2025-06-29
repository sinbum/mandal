import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const redirectTo = searchParams.get('redirect_to') ?? '/'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })

    if (!error) {
      // 인증 성공 시 메인 페이지로 리다이렉트
      return NextResponse.redirect(new URL(redirectTo, request.url))
    } else {
      // 인증 실패 시 에러 페이지로 리다이렉트
      return NextResponse.redirect(new URL('/auth/login?error=confirmation_failed', request.url))
    }
  }

  // 파라미터가 없는 경우 로그인 페이지로 리다이렉트
  return NextResponse.redirect(new URL('/auth/login', request.url))
}