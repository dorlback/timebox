'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getDateKey } from '@/utils/dateUtils';
import { DailyData } from '@/types/planner';

export interface DayHistory {
  date: string;
  score: number;
  completedTasks: number;
  totalTasks: number;
}

export function usePlannerHistory(userId: string | undefined) {
  const [data, setData] = useState<DayHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchHistory() {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 29);

      // We calculate keys for all 30 days to ensure we have a full array
      const last30DaysKeys: string[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(end.getDate() - i);
        last30DaysKeys.push(getDateKey(d));
      }

      const startKey = last30DaysKeys[0];
      const endKey = last30DaysKeys[last30DaysKeys.length - 1];

      try {
        const { data: records, error: fetchError } = await supabase
          .from('timebox')
          .select('planned_date, payload')
          .eq('user_id', userId)
          .gte('planned_date', startKey)
          .lte('planned_date', endKey);

        if (fetchError) throw fetchError;

        const historyMap = new Map<string, { score: number; completed: number; total: number }>();

        console.log(`[usePlannerHistory] Range: ${startKey} ~ ${endKey}`);
        console.log(`[usePlannerHistory] Records fetched: ${records?.length || 0}`);

        records?.forEach(r => {
          const payload = r.payload as DailyData;

          // Calculate productivity score based on actual Todo length
          const todoListItems = payload.todoList || [];
          const totalTasks = todoListItems.length;
          const completedTasks = todoListItems.filter(i => i.completed).length;

          // Score is (completed / total) * 100, capped at 100. If no tasks, score is 0.
          const score = totalTasks > 0
            ? Math.min(100, Math.round((completedTasks / totalTasks) * 100))
            : 0;

          historyMap.set(r.planned_date, { score, completed: completedTasks, total: totalTasks });

          console.log(`[usePlannerHistory] Date: ${r.planned_date}, Completed: ${completedTasks}/${totalTasks}, Score: ${score}%`);
        });

        const historyData: DayHistory[] = last30DaysKeys.map(key => {
          const entry = historyMap.get(key);
          return {
            date: key,
            score: entry?.score || 0,
            completedTasks: entry?.completed || 0,
            totalTasks: entry?.total || 0
          };
        });

        setData(historyData);
      } catch (err: any) {
        console.error('Error fetching planner history:', err);
        setError(err.message || '데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [userId]);

  return { data, loading, error };
}
