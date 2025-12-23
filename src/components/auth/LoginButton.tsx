// components/GoogleLoginButton.tsx
'use client'

import { createClient } from "@/lib/supabase/client"

// 실제 이용할 버전
// export default function GoogleLoginButton() {
//   const supabase = createClient()

//   const handleLogin = async () => {
//     await supabase.auth.signInWithOAuth({
//       provider: 'google',
//       options: {
//         // 구글 로그인 성공 후 돌아올 주소
//         redirectTo: `${window.location.origin}/auth/callback`,
//       },
//     })
//   }

//   return (
//     <button
//       onClick={handleLogin}
//       style={{ padding: '10px 20px', cursor: 'pointer' }}
//     >
//       구글로 로그인하기
//     </button>
//   )
// }

// 테스트용 버전
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
    <button onClick={handleLogin}>구글로 로그인하기</button>
  )
}