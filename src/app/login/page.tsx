import LoginButton from "@/components/auth/LoginButton";
import LogoutButton from "@/components/auth/LogoutButton";
import { createClient } from "@/lib/supabase/server";
import { Smile, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="w-full h-[calc(var(--vh,1vh)*100)] flex items-center justify-center bg-background transition-colors relative">
      {!user && (
        <Link
          href="/"
          className="absolute top-8 left-8 w-10 h-10 flex items-center justify-center rounded-lg border border-transparent hover:border-border transition-all"
        >
          <ArrowLeft size={24} className="text-gray-400 dark:text-gray-500" />
        </Link>
      )}

      <div className="w-full max-w-md px-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary flex items-center justify-center text-white">
            {user ? (
              <Smile size={32} strokeWidth={2.5} />
            ) : (
              <Lock size={32} strokeWidth={2.5} />
            )}
          </div>
          <h1 className="text-3xl mb-2 font-semibold text-foreground">
            {user ? "로그인 완료" : "환영합니다"}
          </h1>
          <p className="text-muted-foreground">
            {user ? "이미 계정에 로그인되어 있습니다" : "Google 계정으로 로그인하세요"}
          </p>
        </div>

        {user ? (
          <div className="space-y-4">
            <p className="text-center text-muted-foreground mb-4">
              {user.email}로 로그인되어 있습니다
            </p>
            <LogoutButton />
            <Link
              href="/"
              className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-xl flex items-center justify-center font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
            >
              홈으로 돌아가기
            </Link>
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
