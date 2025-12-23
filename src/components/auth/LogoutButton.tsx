'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const supabase = createClient()
  const router = useRouter()

  const handleLogout = async () => {
    // 1. Supabase 로그아웃 호출 (서버 세션 및 쿠키 무효화)
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('로그아웃 에러:', error.message)
      return
    }

    // 2. 로그아웃 후 페이지 이동 및 새로고침
    // 새로고침을 해줘야 서버 컴포넌트의 유저 정보가 업데이트됩니다.
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      style={{ padding: '10px 20px', cursor: 'pointer', color: 'red' }}
    >
      로그아웃
    </button>
  )
}