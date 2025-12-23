// utils/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // 클라이언트 컴포넌트에서 호출될 때마다 싱글톤처럼 동작합니다.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}