'use client';

import React from 'react';
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';
import { usePlannerHistory } from '@/hooks/usePlannerHistory';
import { getDateKey } from '@/utils/dateUtils';
import { useTranslation } from '@/contexts/LanguageContext';

export function DailyPlanTracker() {
  const { t } = useTranslation();
  const { user, isLoading: isUserLoading } = useUser();
  const { data: history, loading: isHistoryLoading } = usePlannerHistory(user?.id);

  const isLoading = isUserLoading || isHistoryLoading;
  const todayKey = getDateKey(new Date());

  // Calculate average score
  const avgScore = history.length > 0
    ? Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / history.length)
    : 0;

  // Trend calculation (last 15 days vs previous 15 days)
  let trend = 0;
  if (history.length === 30) {
    const currentHalf = history.slice(15);
    const previousHalf = history.slice(0, 15);

    const currentAvg = currentHalf.reduce((acc, curr) => acc + curr.score, 0) / 15;
    const previousAvg = previousHalf.reduce((acc, curr) => acc + curr.score, 0) / 15;

    if (previousAvg > 0) {
      trend = Math.round(((currentAvg - previousAvg) / previousAvg) * 100);
    } else if (currentAvg > 0) {
      trend = 100; // From 0 to something
    }
  }

  return (
    <section className="bg-card p-6 rounded-2xl border border-border shadow-sm transition-colors relative min-h-[220px]">
      {isLoading && (
        <div className="absolute inset-0 bg-card/40 backdrop-blur-[1px] z-20 flex items-center justify-center rounded-2xl">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <span className="text-xs font-bold text-primary animate-pulse">{t('common.loading')}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-lg font-bold mb-1 text-card-foreground">{t('dashboard.trackerTitle')}</h3>
          <p className="text-sm text-muted-foreground">Consistency score over the last 30 days</p>
        </div>
        {!isLoading && (
          <div className="text-left sm:text-right">
            <div className="text-2xl font-bold text-primary">{avgScore}% {t('dashboard.avgScore')}</div>
            <div className={`text-sm font-bold flex items-center sm:justify-end gap-1 ${trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
              <span className="material-symbols-outlined text-sm">{trend >= 0 ? 'trending_up' : 'trending_down'}</span>
              {trend >= 0 ? '+' : ''}{trend}% from previous period
            </div>
          </div>
        )}
      </div>

      <div className="w-full pb-2 relative z-10">
        <div className="grid grid-cols-10 sm:grid-cols-15 gap-1.5 sm:gap-3 mb-4">
          {(isLoading ? Array(30).fill({ date: '', score: 0, completedTasks: 0, totalTasks: 0 }) : history).map((item, idx) => {
            const isToday = item.date === todayKey;

            return (
              <Link
                key={idx}
                href={!isLoading && item.date ? `/timebox?date=${item.date}` : '#'}
                className={`aspect-square rounded-md hover:ring-2 ring-primary transition-all cursor-pointer relative group ${isLoading ? 'bg-muted animate-pulse pointer-events-none' : ''} ${isToday ? 'ring-2 ring-primary ring-offset-2 ring-offset-card' : ''}`}
                style={{
                  backgroundColor: !isLoading ? (
                    item.score === 0 ? 'rgba(59, 130, 246, 0.05)' :
                      item.score <= 25 ? 'rgba(59, 130, 246, 0.2)' :
                        item.score <= 50 ? 'rgba(59, 130, 246, 0.45)' :
                          item.score <= 75 ? 'rgba(59, 130, 246, 0.7)' :
                            'rgba(59, 130, 246, 1)'
                  ) : undefined
                }}
              >
                {!isLoading && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-card text-card-foreground text-[10px] font-bold rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none border border-border">
                    <div className="text-center mb-1">{item.date} {isToday && `(${t('common.today')})`}</div>
                    <div className="text-center text-primary text-xs mb-0.5">{t('dashboard.score')}: {item.score}%</div>
                    <div className="text-center text-muted-foreground font-medium">{t('dashboard.completedGoals')}: {item.completedTasks}/{item.totalTasks}</div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-4">
          <span>0%</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-primary/5 rounded-sm" title="0%"></div>
            <div className="w-3 h-3 bg-primary/20 rounded-sm" title="1-25%"></div>
            <div className="w-3 h-3 bg-primary/45 rounded-sm" title="26-50%"></div>
            <div className="w-3 h-3 bg-primary/70 rounded-sm" title="51-75%"></div>
            <div className="w-3 h-3 bg-primary rounded-sm" title="76-100%"></div>
          </div>
          <span>100%</span>
        </div>
      </div>
    </section>
  );
}
