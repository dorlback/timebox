import { useState, useCallback, useEffect, useMemo } from 'react';
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
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [serverUpdatedAt, setServerUpdatedAt] = useState<string | null>(null);

  // Undo/Redo stacks
  const [history, setHistory] = useState<Record<string, { undo: DailyData[], redo: DailyData[] }>>({});

  const supabase = createClient();

  const dateKey = getDateKey(currentDate);

  // 3. 현재 화면에 표시할 데이터 추출 (불러오기 전까지 빈 배열 반환)
  const currentData: DailyData = useMemo(() => {
    return dailyData[dateKey] || {
      brainDump: [],
      todoList: [],
      timeBlocks: []
    };
  }, [dailyData, dateKey]);

  // Helper to get stacks for current date
  const currentStacks = useMemo(() => history[dateKey] || { undo: [], redo: [] }, [history, dateKey]);

  const pushHistory = useCallback((data: DailyData) => {
    setHistory(prev => {
      const stacks = prev[dateKey] || { undo: [], redo: [] };
      // Keep last 50 states
      const newUndo = [...stacks.undo, data].slice(-50);
      return {
        ...prev,
        [dateKey]: { undo: newUndo, redo: [] }
      };
    });
  }, [dateKey]);

  const undo = useCallback(() => {
    setHistory(prev => {
      const stacks = prev[dateKey];
      if (!stacks || stacks.undo.length === 0) return prev;

      const newUndo = [...stacks.undo];
      const prevState = newUndo.pop()!;
      const newRedo = [currentData, ...stacks.redo].slice(0, 50);

      // Apply the previous state to dailyData
      setDailyData(dPrev => ({
        ...dPrev,
        [dateKey]: prevState
      }));

      return {
        ...prev,
        [dateKey]: { undo: newUndo, redo: newRedo }
      };
    });
  }, [dateKey, currentData]);

  const redo = useCallback(() => {
    setHistory(prev => {
      const stacks = prev[dateKey];
      if (!stacks || stacks.redo.length === 0) return prev;

      const newRedo = [...stacks.redo];
      const nextState = newRedo.shift()!;
      const newUndo = [...stacks.undo, currentData].slice(-50);

      // Apply the next state to dailyData
      setDailyData(dPrev => ({
        ...dPrev,
        [dateKey]: nextState
      }));

      return {
        ...prev,
        [dateKey]: { undo: newUndo, redo: newRedo }
      };
    });
  }, [dateKey, currentData]);

  // 2. [불러오기] 날짜가 변경될 때 DB에서 해당 날짜의 payload를 가져옴
  useEffect(() => {
    if (!userId) return;

    const fetchPlannerData = async (isRevalidate = false) => {
      // 리밸리데이션이 아닐 때만 로딩 표시
      if (!isRevalidate) setLoading(true);
      try {
        const { data, error } = await supabase
          .from('timebox')
          .select('payload, updated_at')
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
          if (data.updated_at) {
            setServerUpdatedAt(data.updated_at);
          }
        } else if (!error || error.code === 'PGRST116') {
          setDailyData(prev => ({
            ...prev,
            [dateKey]: { brainDump: [], todoList: [], timeBlocks: [] }
          }));
          setServerUpdatedAt(null);
        }
      } catch (err) {
        showError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        if (!isRevalidate) setLoading(false);
      }
    };

    fetchPlannerData();

    // Window Focus 시 데이터 리페치 (Refetch)
    const handleFocus = () => {
      console.log("화면이 활성화됨. 최신 데이터를 확인합니다.");
      fetchPlannerData(true);
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [dateKey, userId, supabase, showError]);

  const handleSave = useCallback(async () => {
    if (!userId) {
      showError('로그인이 필요합니다.');
      return;
    }
    setIsSaving(true);
    try {
      const result = await savePlannerData(userId, dateKey, currentData, false, showSuccess, showError, serverUpdatedAt || undefined);

      if (result.conflict) {
        // 충돌 발생 시 사용자에게 알림
        if (confirm('다른 기기에서 수정된 최신 데이터가 있습니다. 서버의 데이터로 갱신하시겠습니까? (취소 시 현재 데이터를 유지하지만 저장은 되지 않습니다)')) {
          if (result.serverData) {
            setDailyData(prev => ({ ...prev, [dateKey]: result.serverData! }));
          }
          if (result.updated_at) {
            setServerUpdatedAt(result.updated_at);
          }
        }
        return;
      }

      if (result.success && result.updated_at) {
        setServerUpdatedAt(result.updated_at);
        setLastSavedAt(new Date());
      }
    } finally {
      setIsSaving(false);
    }
  }, [userId, dateKey, currentData, showSuccess, showError, serverUpdatedAt]);

  const handleAutoSave = useCallback(async () => {
    if (!userId) {
      return;
    }
    const result = await savePlannerData(userId, dateKey, currentData, true, showSuccess, showError, serverUpdatedAt || undefined);

    if (result.conflict) {
      console.warn("자동 저장 중 충돌 발생. 사용자 방해를 피하기 위해 무시하거나 별도 UI 처리.");
      return;
    }

    if (result.success && result.updated_at) {
      setServerUpdatedAt(result.updated_at);
      setLastSavedAt(new Date());
    }
  }, [userId, dateKey, currentData, showSuccess, showError, serverUpdatedAt]);

  // --- 상태 업데이트 함수들 ---

  const setBrainDump = useCallback((newBrainDump: BrainDumpItem[] | ((prev: BrainDumpItem[]) => BrainDumpItem[])) => {
    pushHistory(currentData);
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
  }, [dateKey, currentData, pushHistory]);

  const setTodoList = useCallback((newTodoList: TodoItem[] | ((prev: TodoItem[]) => TodoItem[])) => {
    pushHistory(currentData);
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
  }, [dateKey, currentData, pushHistory]);

  const setTimeBlocks = useCallback((newTimeBlocks: TimeBlock[] | ((prev: TimeBlock[]) => TimeBlock[])) => {
    pushHistory(currentData);
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
  }, [dateKey, currentData, pushHistory]);

  const setAllData = useCallback((newData: DailyData | ((prev: DailyData) => DailyData)) => {
    pushHistory(currentData);
    setDailyData(prev => {
      const current = prev[dateKey] || { brainDump: [], todoList: [], timeBlocks: [] };
      const updated = typeof newData === 'function' ? newData(current) : newData;
      return {
        ...prev,
        [dateKey]: updated
      };
    });
  }, [dateKey, currentData, pushHistory]);

  return {
    brainDump: currentData.brainDump,
    todoList: currentData.todoList,
    timeBlocks: currentData.timeBlocks,
    setBrainDump,
    setTodoList,
    setTimeBlocks,
    setAllData,
    undo,
    redo,
    canUndo: currentStacks.undo.length > 0,
    canRedo: currentStacks.redo.length > 0,
    handleSave,
    handleAutoSave,
    loading,
    isSaving,
    lastSavedAt,
  };
};