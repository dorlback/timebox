import React, { useEffect, useRef } from 'react';
import { TimeGrid } from './TimeGrid';
import { DateSelector } from './DateSelector';
import { TimeBlock } from '@/types/planner';

interface TimePlanProps {
  date: Date;
  timeBlocks: TimeBlock[];
  draggingBlockId: number | null;
  resizingBlockId: number | null;
  onDateChange: (year: number, month: number, day: number) => void;
  onDayOfWeekClick: (dayIndex: number) => void;
  onBlockMouseDown: (e: React.MouseEvent, block: TimeBlock) => void;
  onBlockEdit: (block: TimeBlock) => void;
}

export const TimePlan: React.FC<TimePlanProps> = ({
  date,
  timeBlocks,
  draggingBlockId,
  resizingBlockId,
  onDateChange,
  onDayOfWeekClick,
  onBlockMouseDown,
  onBlockEdit
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    // DOM이 완전히 렌더링된 후 스크롤
    setTimeout(() => {
      if (scrollContainerRef.current) {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTimeInMinutes = currentHour * 60 + currentMinute;

        // 1분 = 1px이므로, 현재 시간의 픽셀 위치
        const scrollPosition = currentTimeInMinutes;

        // 스크롤 컨테이너 높이의 절반만큼 위로 올려서 현재 시간이 상단에 오도록
        const containerHeight = scrollContainerRef.current.clientHeight;
        const adjustedScrollPosition = scrollPosition - 50; // 상단에서 약간 아래 위치

        scrollContainerRef.current.scrollTop = Math.max(0, adjustedScrollPosition);

        console.log('Current time:', `${currentHour}:${currentMinute}`);
        console.log('Scroll position:', adjustedScrollPosition);
      }
    }, 100); // 100ms 후 실행
  }, [date]); // date가 변경될 때마다 다시 스크롤


  return (
    <div className="h-full flex flex-col bg-white col-span-2 rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-700">TIME PLAN</h2>
        <DateSelector
          date={date}
          onDateChange={onDateChange}
        />
      </div>

      <div
        ref={scrollContainerRef}
        className="overflow-auto"
        style={{ maxHeight: '700px' }}
      >
        <TimeGrid
          timeBlocks={timeBlocks}
          draggingBlockId={draggingBlockId}
          resizingBlockId={resizingBlockId}
          onBlockMouseDown={onBlockMouseDown}
          onBlockEdit={onBlockEdit}
        />
      </div>
    </div>

  );
};