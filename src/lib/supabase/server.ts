// utils/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // 모든 쿠키를 가져오는 최신 방식
        getAll() {
          return cookieStore.getAll()
        },
        // 모든 쿠키를 설정하는 최신 방식
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // 서버 컴포넌트(RSC)에서 호출될 때의 에러는 무시합니다.
            // 실제 쿠키 설정은 Middleware나 Route Handler에서 처리됩니다.
          }
        },
      },
    }
  )
}