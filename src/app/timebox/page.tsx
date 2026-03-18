'use client';

import TimeBoxPlanner from "@/components/planner/TimeBoxPlanner";
import Sidebar from "@/components/Sidebar";
import { useUser } from "@/hooks/useUser";
import { useTranslation } from "@/contexts/LanguageContext";

export default function Page() {
  const { user, isLoading } = useUser();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex h-[calc(var(--vh,1vh)*100)] overflow-hidden bg-background text-foreground transition-colors">
        <Sidebar defaultExpanded={false} />
        <main className="flex-1 w-full flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="sr-only">{t('common.loading')}</span>
            </div>
            <p className="mt-4 text-muted-foreground">{t('common.loading')}</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[calc(var(--vh,1vh)*100)] overflow-hidden bg-background text-foreground transition-colors">
        <Sidebar defaultExpanded={false} />
        <main className="flex-1 w-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('profile.loginRequired')}</h2>
            <p className="text-muted-foreground mb-6">{t('profile.loginDesc')}</p>
            <a
              href="/login"
              className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all shadow-sm"
            >
              {t('profile.login')}
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(var(--vh,1vh)*100)] overflow-hidden bg-background text-foreground transition-colors">
      <Sidebar defaultExpanded={false} />
      <main className="flex-1 overflow-y-auto w-full">
        <TimeBoxPlanner CurrentUser={user} />
      </main>
    </div>
  );
}