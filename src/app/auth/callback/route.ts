// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/timebox'

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }

  // ⚠️ 여기서 await를 반드시 추가해야 합니다!
  const supabase = await createClient()

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('❌ exchangeCodeForSession error:', error)
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}