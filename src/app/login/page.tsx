import LoginButton from "@/components/auth/LoginButton";
import LogoutButton from "@/components/auth/LogoutButton";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main style={{ padding: '50px' }}>
      {user ? (
        <div>
          <p>안녕하세요, <strong>{user.email}</strong>님!</p>
          <LogoutButton />
        </div>
      ) : (
        <div>
          <p>로그인이 필요합니다.</p>
          <LoginButton />
        </div>
      )}
    </main>
  );
}