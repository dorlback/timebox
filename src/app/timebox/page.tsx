'use client';

import TimeBoxPlanner from "@/components/planner/TimeBoxPlanner";
import { useUser } from "@/hooks/useUser";

export default function Page() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 dark:border-blue-400 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="sr-only">로딩 중…</span>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">데이터를 불러오는 중…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">로그인이 필요합니다</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">TimeBox Planner를 사용하려면 로그인해주세요.</p>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all"
          >
            로그인하기
          </a>
        </div>
      </div>
    );
  }

  return <TimeBoxPlanner CurrentUser={user} />;
}