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


    <div className="space-y-4">
      <button
        onClick={handleLogout}
        className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl hover:border-[#3B82F6] hover:bg-[#3B82F6]/5 transition-all duration-200 flex items-center justify-center gap-3 group"
      >
        <span className="text-gray-700 group-hover:text-[#3B82F6] transition-colors" style={{ fontWeight: 500 }}>
          로그아웃
        </span>
      </button>
      <p className="text-center text-sm text-gray-400 mt-8">
        로그인하면 서비스 약관 및 개인정보 보호정책에 동의하게 됩니다
      </p>
    </div>
  )
}