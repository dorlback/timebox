import LoginButton from "@/components/auth/LoginButton";
import LogoutButton from "@/components/auth/LogoutButton";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="w-full h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md px-8">
        {/* 로고/타이틀 영역 */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#3B82F6] flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl mb-2" style={{ fontWeight: 600, color: '#1F2937' }}>
            환영합니다
          </h1>
          <p className="text-gray-500">
            구글 계정으로 로그인하세요
          </p>
        </div>

        {user ? (
          <div>
            <LogoutButton />
          </div>
        ) : (
          <div>
            <LoginButton />

          </div>
        )}
      </div>
    </div>
  );
}
