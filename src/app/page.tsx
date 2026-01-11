// app/page.tsx
import Link from "next/link";
import { ArrowRight, Calendar, Clock, Target, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            하루를 더 효율적으로,
            <br />
            <span className="text-blue-600">TimeBox Planner</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            시간을 블록 단위로 관리하고, 하루를 계획하세요.
            <br />
            드래그 앤 드롭으로 쉽게 일정을 조정하고, 목표를 달성하세요.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              시작하기
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/timebox"
              className="px-8 py-4 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:border-slate-400 transition-colors"
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
            icon={<Calendar className="w-8 h-8 text-blue-600" />}
            title="직관적인 타임블록"
            description="시간대별로 일정을 블록으로 관리하여 하루를 시각적으로 파악하세요."
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8 text-blue-600" />}
            title="드래그 앤 드롭"
            description="마우스로 간편하게 일정을 이동하고 시간을 조정할 수 있습니다."
          />
          <FeatureCard
            icon={<Clock className="w-8 h-8 text-blue-600" />}
            title="실시간 충돌 감지"
            description="일정이 겹치지 않도록 자동으로 확인하고 알려드립니다."
          />
          <FeatureCard
            icon={<Target className="w-8 h-8 text-blue-600" />}
            title="목표 달성"
            description="계획한 일정을 완료하며 생산성을 높여보세요."
          />
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-slate-100 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
              간단하고 강력한 일정 관리
            </h2>
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
              {/* Mock TimeBox Preview */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <div className="text-sm font-semibold text-blue-700 w-20">
                    09:00
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">
                      프로젝트 기획 회의
                    </div>
                    <div className="text-sm text-slate-500">1시간</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-green-50 border-l-4 border-green-500 rounded">
                  <div className="text-sm font-semibold text-green-700 w-20">
                    10:00
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">
                      개발 작업
                    </div>
                    <div className="text-sm text-slate-500">2시간</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-purple-50 border-l-4 border-purple-500 rounded">
                  <div className="text-sm font-semibold text-purple-700 w-20">
                    13:00
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">
                      점심 식사
                    </div>
                    <div className="text-sm text-slate-500">1시간</div>
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
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            오늘부터 시작하세요
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            TimeBox Planner로 더 효율적인 하루를 계획하고 실행하세요.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
          >
            무료로 시작하기
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8">
        <div className="container mx-auto px-4 text-center text-slate-600">
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
    <div className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}