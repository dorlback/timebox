'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LogoutButton() {
  const supabase = createClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase.auth.signOut();

      if (error) {
        setError('로그아웃 중 오류가 발생했습니다.');
        setIsLoading(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setError('로그아웃 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className="w-full px-6 py-4 border border-gray-500/30 dark:border-gray-400/30 rounded-xl hover:border-gray-500/50 dark:hover:border-gray-400/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 focus-visible:ring-2 focus-visible:ring-gray-400/50 focus-visible:ring-offset-2 transition-all duration-300 flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
        aria-label="로그아웃"
      >
        <span className="text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors font-medium">
          {isLoading ? '로그아웃 중…' : '로그아웃'}
        </span>
      </button>

      {error && (
        <p className="text-center text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}