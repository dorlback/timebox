// app/page.tsx
import Link from "next/link";
import { ArrowRight, Calendar, Clock, Target, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import NavBar from "@/components/NavBar";

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const startHref = user ? "/timebox" : "/login";

  return (
    <div className="min-h-screen bg-background transition-colors">
      <NavBar user={user} />
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            하루를 더 효율적으로,
            <br />
            <span className="text-primary">TimeBox Planner</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            시간을 블록 단위로 관리하고, 하루를 계획하세요.
            <br />
            드래그 앤 드롭으로 쉽게 일정을 조정하고, 목표를 달성하세요.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href={startHref}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all flex items-center gap-2"
              aria-label="TimeBox Planner 시작하기"
            >
              시작하기
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
            <Link
              href="/timebox"
              className="px-8 py-4 border-2 border-border text-foreground rounded-lg font-semibold hover:bg-muted focus-visible:ring-2 focus-visible:ring-border focus-visible:ring-offset-2 transition-all"
            >
              플래너로 이동
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            icon={<Calendar className="w-8 h-8 text-primary" />}
            title="직관적인 타임블록"
            description="시간대별로 일정을 블록으로 관리하여 하루를 시각적으로 파악하세요."
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8 text-primary" />}
            title="드래그 앤 드롭"
            description="마우스로 간편하게 일정을 이동하고 시간을 조정할 수 있습니다."
          />
          <FeatureCard
            icon={<Clock className="w-8 h-8 text-primary" />}
            title="실시간 충돌 감지"
            description="일정이 겹치지 않도록 자동으로 확인하고 알려드립니다."
          />
          <FeatureCard
            icon={<Target className="w-8 h-8 text-primary" />}
            title="목표 달성"
            description="계획한 일정을 완료하며 생산성을 높여보세요."
          />
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-muted/30 py-20 transition-colors">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">
              간단하고 강력한 일정 관리
            </h2>
            <div className="bg-card rounded-2xl shadow-xl p-8 border border-border transition-colors">
              {/* Mock TimeBox Preview */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <div className="text-sm font-semibold text-blue-700 w-20">
                    09:00
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">
                      프로젝트 기획 회의
                    </div>
                    <div className="text-sm text-muted-foreground">1시간</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-green-50 border-l-4 border-green-500 rounded">
                  <div className="text-sm font-semibold text-green-700 w-20">
                    10:00
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">
                      개발 작업
                    </div>
                    <div className="text-sm text-muted-foreground">2시간</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-purple-50 border-l-4 border-purple-500 rounded">
                  <div className="text-sm font-semibold text-purple-700 w-20">
                    13:00
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">
                      점심 식사
                    </div>
                    <div className="text-sm text-muted-foreground">1시간</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            오늘부터 시작하세요
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            TimeBox Planner로 더 효율적인 하루를 계획하고 실행하세요.
          </p>
          <Link
            href={startHref}
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all text-lg"
            aria-label="TimeBox Planner 무료로 시작하기"
          >
            무료로 시작하기
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 transition-colors">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
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
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg hover:border-border/80 transition-all">
      <div className="mb-4" aria-hidden="true">{icon}</div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
}