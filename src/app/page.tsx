// app/page.tsx
import Link from "next/link";
import { ArrowRight, Calendar, Clock, Target, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import NavBar from "@/components/NavBar";
import { User } from "@/types/user";

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  // Supabase 유저를 커스텀 User 타입 구조의 일반 객체로 변환 (타입 불일치 및 직렬화 에러 해결)
  const user = authUser ? {
    id: authUser.id,
    email: authUser.email ?? '',
    displayName: (authUser as any).user_metadata?.full_name ?? '익명 유저',
    avatarUrl: (authUser as any).user_metadata?.avatar_url ?? '',
    phone: authUser.phone ?? '',
    isAdmin: false,
    createdAt: new Date(authUser.created_at),
    updatedAt: new Date(authUser.created_at)
  } : null;

  const startHref = user ? "/timebox" : "/login";

  return (
    <div className="100dvh bg-background transition-colors">
      <NavBar user={user as any} />

      {/* Hero Section with Gradient Background */}
      <div className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 gradient-bg-light opacity-50" />

        <div className="container relative mx-auto px-4 sm:px-6 pt-16 sm:pt-20 lg:pt-24 pb-12 sm:pb-16 lg:pb-20">
          <div className="text-center max-w-4xl mx-auto animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
              하루를 더 효율적으로,
              <br />
              <span className="text-primary bg-clip-text">TimeBox Planner</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed px-4">
              시간을 블록 단위로 관리하고, 하루를 계획하세요.
              <br className="hidden sm:block" />
              드래그 앤 드롭으로 쉽게 일정을 조정하고, 목표를 달성하세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
              <Link
                href={startHref}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-primary text-primary-foreground rounded-ios-lg font-semibold hover:opacity-90 hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-300 flex items-center justify-center gap-2 shadow-ios-lg"
                aria-label="TimeBox Planner 시작하기"
              >
                시작하기
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link
                href="/timebox"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-border text-foreground rounded-ios-lg font-semibold hover:bg-muted hover:scale-105 focus-visible:ring-2 focus-visible:ring-border focus-visible:ring-offset-2 transition-all duration-300 shadow-ios"
              >
                플래너로 이동
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
          <FeatureCard
            icon={<Calendar className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />}
            title="직관적인 타임블록"
            description="시간대별로 일정을 블록으로 관리하여 하루를 시각적으로 파악하세요."
            delay="0ms"
          />
          <FeatureCard
            icon={<Zap className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />}
            title="드래그 앤 드롭"
            description="마우스로 간편하게 일정을 이동하고 시간을 조정할 수 있습니다."
            delay="100ms"
          />
          <FeatureCard
            icon={<Clock className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />}
            title="실시간 충돌 감지"
            description="일정이 겹치지 않도록 자동으로 확인하고 알려드립니다."
            delay="200ms"
          />
          <FeatureCard
            icon={<Target className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />}
            title="목표 달성"
            description="계획한 일정을 완료하며 생산성을 높여보세요."
            delay="300ms"
          />
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-muted/30 py-12 sm:py-16 lg:py-20 transition-colors">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-foreground mb-8 sm:mb-12 animate-fade-in">
              간단하고 강력한 일정 관리
            </h2>
            <div className="glass rounded-ios-lg sm:rounded-2xl shadow-ios-xl p-4 sm:p-6 lg:p-8 border border-border/50 transition-all hover:shadow-ios-xl hover:scale-[1.02] duration-300">
              {/* Mock TimeBox Preview */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-primary/5 dark:bg-primary/10 border-l-4 border-primary rounded-ios transition-all hover:shadow-ios">
                  <div className="text-sm font-semibold text-primary dark:text-primary-foreground w-full sm:w-20">
                    09:00
                  </div>
                  <div className="flex-1 w-full">
                    <div className="font-semibold text-foreground text-sm sm:text-base">
                      프로젝트 기획 회의
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">1시간</div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-green-50 dark:bg-green-950/30 border-l-4 border-green-500 rounded-ios transition-all hover:shadow-ios">
                  <div className="text-sm font-semibold text-green-700 dark:text-green-400 w-full sm:w-20">
                    10:00
                  </div>
                  <div className="flex-1 w-full">
                    <div className="font-semibold text-foreground text-sm sm:text-base">
                      개발 작업
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">2시간</div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-purple-50 dark:bg-purple-950/30 border-l-4 border-purple-500 rounded-ios transition-all hover:shadow-ios">
                  <div className="text-sm font-semibold text-purple-700 dark:text-purple-400 w-full sm:w-20">
                    13:00
                  </div>
                  <div className="flex-1 w-full">
                    <div className="font-semibold text-foreground text-sm sm:text-base">
                      점심 식사
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">1시간</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4 sm:mb-6">
            오늘부터 시작하세요
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 px-4">
            TimeBox Planner로 더 효율적인 하루를 계획하고 실행하세요.
          </p>
          <Link
            href={startHref}
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-primary text-primary-foreground rounded-ios-lg font-semibold hover:opacity-90 hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-300 text-base sm:text-lg shadow-ios-lg animate-pulse-slow"
            aria-label="TimeBox Planner 무료로 시작하기"
          >
            무료로 시작하기
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-6 sm:py-8 transition-colors">
        <div className="container mx-auto px-4 sm:px-6 text-center text-sm sm:text-base text-muted-foreground">
          <p>© 2026 dorlback.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay = "0ms",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: string;
}) {
  return (
    <div
      className="glass p-5 sm:p-6 rounded-ios-lg border border-border/50 hover:shadow-ios-lg hover:scale-105 hover:border-primary/30 transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: delay }}
    >
      <div className="mb-3 sm:mb-4 transform transition-transform duration-300 hover:scale-110" aria-hidden="true">
        {icon}
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}