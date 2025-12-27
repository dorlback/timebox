import { useState, useCallback } from 'react';
import { DailyData, BrainDumpItem, TodoItem, TimeBlock } from '../types/planner';
import { getDateKey } from '../utils/dateUtils';

/**
 * 특정 날짜의 플래너 데이터를 관리하는 커스텀 훅
 * @param currentDate 현재 화면에 표시되는 날짜 객체
 */
export const usePlannerData = (currentDate: Date) => {
  // 1. 전체 데이터를 저장하는 상태. 키는 날짜 문자열(dateKey), 값은 해당 날짜의 데이터(DailyData)
  const [dailyData, setDailyData] = useState<Record<string, DailyData>>({});

  // 2. 현재 선택된 날짜를 "YYYY-MM-DD" 형태의 문자열 키로 변환 (예: '2023-10-27')
  const dateKey = getDateKey(currentDate);

  // 3. 현재 날짜의 '브레인 덤프' 목록 추출 (데이터가 없으면 예시 데이터 반환)
  const brainDump = dailyData[dateKey]?.brainDump || [
    { id: 1, text: '예시: 이메일 확인하기', completed: false }
  ];

  // 4. 현재 날짜의 '할 일(Todo)' 목록 추출 (없으면 빈 배열)
  const todoList = dailyData[dateKey]?.todoList || [];

  // 5. 현재 날짜의 '타임 블록(일정)' 목록 추출 (없으면 빈 배열)
  const timeBlocks = dailyData[dateKey]?.timeBlocks || [];

  /**
   * 브레인 덤프 데이터를 업데이트하는 함수
   * useCallback을 사용하여 dateKey가 변경될 때만 함수가 재생성되도록 최적화
   */
  const setBrainDump = useCallback((newBrainDump: BrainDumpItem[]) => {
    setDailyData(prev => ({
      ...prev, // 기존의 다른 날짜 데이터 유지
      [dateKey]: { ...prev[dateKey], brainDump: newBrainDump } // 현재 날짜의 브레인 덤프만 교체
    }));
  }, [dateKey]);

  /**
   * 할 일 목록을 업데이트하는 함수
   */
  const setTodoList = useCallback((newTodoList: TodoItem[]) => {
    setDailyData(prev => ({
      ...prev,
      [dateKey]: { ...prev[dateKey], todoList: newTodoList }
    }));
  }, [dateKey]);

  /**
   * 타임 블록 데이터를 업데이트하는 함수
   */
  const setTimeBlocks = useCallback((newTimeBlocks: TimeBlock[]) => {
    setDailyData(prev => ({
      ...prev,
      [dateKey]: { ...prev[dateKey], timeBlocks: newTimeBlocks }
    }));
  }, [dateKey]);

  // 외부 컴포넌트에서 사용할 데이터와 함수들을 반환
  return {
    brainDump,
    todoList,
    timeBlocks,
    setBrainDump,
    setTodoList,
    setTimeBlocks
  };
};