import { useState, useCallback, useEffect } from 'react';
import { DailyData, BrainDumpItem, TodoItem, TimeBlock } from '../types/planner';
import { getDateKey } from '../utils/dateUtils';
import { savePlannerData } from '@/utils/savePlannerData'; // 앞서 작성한 upsert 로직
import { createClient } from '@/lib/supabase/client';

/**
 * 특정 날짜의 플래너 데이터를 관리하고 DB와 동기화하는 커스텀 훅
 */
export const usePlannerData = (currentDate: Date, userId: string, showSuccess: (msg: string) => void, showError: (msg: string) => void) => {
  // 1. 전체 날짜 데이터를 관리하는 상태 (날짜 키 기준)
  const [dailyData, setDailyData] = useState<Record<string, DailyData>>({});
  const [loading, setLoading] = useState<boolean>(false);

  const supabase = createClient();

  const dateKey = getDateKey(currentDate);

  // 2. [불러오기] 날짜가 변경될 때 DB에서 해당 날짜의 payload를 가져옴
  useEffect(() => {
    if (!userId) return;

    // 이미 메모리에 데이터가 로드되어 있다면 중복 호출 방지 (캐싱)
    if (dailyData[dateKey]) return;

    const fetchPlannerData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('timebox')
          .select('payload')
          .eq('user_id', userId)
          .eq('planned_date', dateKey)
          .single();

        if (error && error.code !== 'PGRST116') {
          showError('데이터를 불러오는 중 오류가 발생했습니다.');
        }

        if (data?.payload) {
          setDailyData(prev => ({
            ...prev,
            [dateKey]: data.payload as DailyData
          }));
        } else {
          setDailyData(prev => ({
            ...prev,
            [dateKey]: { brainDump: [], todoList: [], timeBlocks: [] }
          }));
        }
      } catch (err) {
        showError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlannerData();
  }, [dateKey, userId]);

  // 3. 현재 화면에 표시할 데이터 추출 (불러오기 전까지 빈 배열 반환)
  const currentData: DailyData = dailyData[dateKey] || {
    brainDump: [],
    todoList: [],
    timeBlocks: []
  };

  const handleSave = useCallback(async () => {
    if (!userId) {
      showError('로그인이 필요합니다.');
      return;
    }
    await savePlannerData(userId, dateKey, currentData, false, showSuccess, showError);
  }, [userId, dateKey, currentData, showSuccess, showError]);

  const handleAutoSave = useCallback(async () => {
    if (!userId) {
      return;
    }
    await savePlannerData(userId, dateKey, currentData, true, showSuccess, showError);
  }, [userId, dateKey, currentData, showSuccess, showError]);

  // --- 상태 업데이트 함수들 ---

  const setBrainDump = useCallback((newBrainDump: BrainDumpItem[] | ((prev: BrainDumpItem[]) => BrainDumpItem[])) => {
    setDailyData(prev => {
      const currentItems = prev[dateKey]?.brainDump || [];
      const updatedItems = typeof newBrainDump === 'function'
        ? (newBrainDump as (p: BrainDumpItem[]) => BrainDumpItem[])(currentItems)
        : newBrainDump;
      return {
        ...prev,
        [dateKey]: { ...prev[dateKey], brainDump: updatedItems }
      };
    });
  }, [dateKey]);

  const setTodoList = useCallback((newTodoList: TodoItem[] | ((prev: TodoItem[]) => TodoItem[])) => {
    setDailyData(prev => {
      const currentItems = prev[dateKey]?.todoList || [];
      const updatedItems = typeof newTodoList === 'function'
        ? (newTodoList as (p: TodoItem[]) => TodoItem[])(currentItems)
        : newTodoList;
      return {
        ...prev,
        [dateKey]: { ...prev[dateKey], todoList: updatedItems }
      };
    });
  }, [dateKey]);

  const setTimeBlocks = useCallback((newTimeBlocks: TimeBlock[] | ((prev: TimeBlock[]) => TimeBlock[])) => {
    setDailyData(prev => {
      const currentItems = prev[dateKey]?.timeBlocks || [];
      const updatedItems = typeof newTimeBlocks === 'function'
        ? (newTimeBlocks as (p: TimeBlock[]) => TimeBlock[])(currentItems)
        : newTimeBlocks;
      return {
        ...prev,
        [dateKey]: { ...prev[dateKey], timeBlocks: updatedItems }
      };
    });
  }, [dateKey]);

  return {
    brainDump: currentData.brainDump,
    todoList: currentData.todoList,
    timeBlocks: currentData.timeBlocks,
    setBrainDump,
    setTodoList,
    setTimeBlocks,
    handleSave,
    handleAutoSave,
    loading
  };
};