'use client';

import TimeBoxPlanner from "@/components/planner/TimeBoxPlanner";
import Sidebar from "@/components/Sidebar";
import { useUser } from "@/hooks/useUser";

export default function Page() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden bg-background text-foreground transition-colors">
        <Sidebar />
        <main className="flex-1 w-full flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="sr-only">로딩 중…</span>
            </div>
            <p className="mt-4 text-muted-foreground">데이터를 불러오는 중…</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen overflow-hidden bg-background text-foreground transition-colors">
        <Sidebar />
        <main className="flex-1 w-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-4">로그인이 필요합니다</h2>
            <p className="text-muted-foreground mb-6">TimeBox Planner를 사용하려면 로그인해주세요.</p>
            <a
              href="/login"
              className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all shadow-sm"
            >
              로그인하기
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground transition-colors">
      <Sidebar userName={user.displayName} userAvatar={user.avatarUrl} defaultExpanded={false} />
      <main className="flex-1 overflow-y-auto w-full">
        <TimeBoxPlanner CurrentUser={user} />
      </main>
    </div>
  );
}