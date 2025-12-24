import { useState, useCallback } from 'react';
import { DailyData, BrainDumpItem, TodoItem, TimeBlock } from '../types/planner';
import { getDateKey } from '../utils/dateUtils';

export const usePlannerData = (currentDate: Date) => {
  const [dailyData, setDailyData] = useState<Record<string, DailyData>>({});
  const dateKey = getDateKey(currentDate);

  const brainDump = dailyData[dateKey]?.brainDump || [
    { id: 1, text: '예시: 이메일 확인하기', completed: false }
  ];
  const todoList = dailyData[dateKey]?.todoList || [];
  const timeBlocks = dailyData[dateKey]?.timeBlocks || [];

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
    setTimeBlocks
  };
};