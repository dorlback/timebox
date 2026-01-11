// components/GoogleLoginButton.tsx
'use client'

import { createClient } from "@/lib/supabase/client"

export default function GoogleLoginButton() {
  const supabase = createClient()

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        // 구글 로그인 창 설정을 추가합니다.
        queryParams: {
          prompt: 'select_account', // 매번 계정 선택창을 띄움
          access_type: 'offline',   // 필요한 경우 refresh token을 받기 위함
        },
      },
    })
  }

  return (
    // <button onClick={handleLogin}>구글로 로그인하기</button>

    <div className="space-y-4">
      <button
        onClick={handleLogin}
        className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl hover:border-[#3B82F6] hover:bg-[#3B82F6]/5 transition-all duration-200 flex items-center justify-center gap-3 group"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span className="text-gray-700 group-hover:text-[#3B82F6] transition-colors" style={{ fontWeight: 500 }}>
          Google로 계속하기
        </span>
      </button>
      <p className="text-center text-sm text-gray-400 mt-8">
        로그인하면 서비스 약관 및 개인정보 보호정책에 동의하게 됩니다
      </p>
    </div>
  )
}