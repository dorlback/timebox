import { useState, useCallback, useEffect } from 'react';
import { DailyData, BrainDumpItem, TodoItem, TimeBlock } from '../types/planner';
import { getDateKey } from '../utils/dateUtils';
import { MOCK_DB_RESPONSE } from '../../data/mockPlannerData';
// 테스트용 목업 데이터 (앞서 만든 JSON 덩어리)

export const usePlannerTestData = (currentDate: Date) => {
  const [dailyData, setDailyData] = useState<Record<string, DailyData>>({});
  const dateKey = getDateKey(currentDate);

  // [FETCH] 특정 날짜 데이터 로드 시뮬레이션
  useEffect(() => {
    // 이미 메모리(dailyData)에 데이터가 있다면 다시 부르지 않음 (캐싱)
    if (dailyData[dateKey]) return;

    const fetchCurrentDateData = async () => {
      // 실제 DB 연동 시: const { data } = await supabase.from('daily_plans').select('payload').eq('planned_date', dateKey)
      const response = MOCK_DB_RESPONSE; // 테스트용 목업

      if (response.payload) {
        setDailyData(prev => ({
          ...prev,
          [dateKey]: response.payload // DB의 통 JSON(payload)을 해당 날짜 키에 저장
        }));
      }
    };

    fetchCurrentDateData();
  }, [dateKey, dailyData]);

  // 데이터 추출 (기본값 설정)
  const brainDump = dailyData[dateKey]?.brainDump || [];
  const todoList = dailyData[dateKey]?.todoList || [];
  const timeBlocks = dailyData[dateKey]?.timeBlocks || [];

  // [SAVE] 현재 날짜의 데이터를 DB 형식으로 변환하여 출력
  const saveCurrentPlan = useCallback(() => {
    const payload = dailyData[dateKey]; // 이게 바로 DB 'payload' 컬럼에 들어갈 통 JSON
    if (!payload) return;

    console.log(`[DB 저장 시뮬레이션] 날짜: ${dateKey}`);
    console.log("저장될 Payload:", payload);
    // 실제 DB 연동 시: await supabase.from('daily_plans').upsert({ planned_date: dateKey, payload })
  }, [dateKey, dailyData]);

  const setBrainDump = useCallback((newBrainDump: BrainDumpItem[]) => {
    setDailyData(prev => ({
      ...prev,
      [dateKey]: { ...prev[dateKey], brainDump: newBrainDump }
    }));
  }, [dateKey]);

  const setTodoList = useCallback((newTodoList: TodoItem[]) => {
    setDailyData(prev => ({
      ...prev,
      [dateKey]: { ...prev[dateKey], todoList: newTodoList }
    }));
  }, [dateKey]);

  const setTimeBlocks = useCallback((newTimeBlocks: TimeBlock[]) => {
    setDailyData(prev => ({
      ...prev,
      [dateKey]: { ...prev[dateKey], timeBlocks: newTimeBlocks }
    }));
  }, [dateKey]);

  return {
    brainDump,
    todoList,
    timeBlocks,
    setBrainDump,
    setTodoList,
    setTimeBlocks,
    saveCurrentPlan // 테스트용 저장 함수 반환
  };
};