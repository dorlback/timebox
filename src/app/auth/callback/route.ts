// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // 로그인 후 이동할 페이지 (기본값: '/')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    // server.ts에서 만든 비동기 클라이언트 호출
    const supabase = await createClient()

    // 코드를 세션으로 교환 (이 과정에서 쿠키가 구워집니다)
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // 성공 시 원하는 페이지로 리다이렉트
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // 에러 발생 시 로그인 페이지나 에러 페이지로 리다이렉트
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}