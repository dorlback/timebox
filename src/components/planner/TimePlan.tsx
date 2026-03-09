import React, { useEffect, useRef } from 'react';
import { TimeGrid } from './TimeGrid';
import { DateSelector } from './DateSelector';
import { TimeBlock } from '@/types/planner';

interface TimePlanProps {
  date: Date;
  timeBlocks: TimeBlock[];
  draggingBlockId: number | null;
  resizingBlockId: number | null;
  dragPreviewOffset?: { blockId: number; offsetY: number; type: 'drag' | 'resize-top' | 'resize-bottom' } | null;
  onDateChange: (year: number, month: number, day: number) => void;
  onDayOfWeekClick: (dayIndex: number) => void;
  onBlockMouseDown: (e: React.MouseEvent, block: TimeBlock) => void;
  onBlockEdit: (block: TimeBlock) => void;
  isMobile?: boolean;
  activeBlockId?: number | null;
  activeView?: 'left' | 'right';
}

export const TimePlan: React.FC<TimePlanProps> = React.memo(({
  date,
  timeBlocks,
  draggingBlockId,
  resizingBlockId,
  dragPreviewOffset,
  onDateChange,
  onDayOfWeekClick,
  onBlockMouseDown,
  onBlockEdit,
  isMobile = false,
  activeBlockId = null,
  activeView = 'right'
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 뷰가 바뀌거나 날짜가 바뀔 때 스크롤 수행
    // 모바일에서는 activeView가 'right'일 때만, 데스크탑은 항상 수행
    if (isMobile && activeView !== 'right') return;

    const performScroll = () => {
      if (scrollContainerRef.current) {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTimeInMinutes = currentHour * 60 + currentMinute;

        // 1분 = 1px이므로, 현재 시간의 픽셀 위치
        const scrollPosition = currentTimeInMinutes;

        // 사용자의 요청: 현재 시간이 상단에서 약 20% 지점에 오도록
        // 즉, scrollTop = currentTime - (containerHeight * 0.2)
        const containerHeight = scrollContainerRef.current.clientHeight;
        const adjustedScrollPosition = scrollPosition - (containerHeight * 0.2);

        scrollContainerRef.current.scrollTo({
          top: Math.max(0, adjustedScrollPosition),
          behavior: 'smooth'
        });

        console.log('Scrolling to current time:', `${currentHour}:${currentMinute}`);
      }
    };

    // DOM 렌더링 및 레이아웃 계산을 위해 약간의 지연 후 실행
    const timer = setTimeout(performScroll, 300);
    return () => clearTimeout(timer);
  }, [date, activeView, isMobile]);

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="flex flex-col h-full w-full min-w-0 bg-card/30 md:rounded-lg md:border md:border-border overflow-hidden">

      <div id="planner-scroll-container" className={`flex-1 overflow-y-auto overflow-x-hidden w-full custom-scrollbar ${isMobile ? 'pb-[3.8rem]' : ''}`} ref={scrollContainerRef}>
        <TimeGrid
          timeBlocks={timeBlocks}
          draggingBlockId={draggingBlockId}
          resizingBlockId={resizingBlockId}
          dragPreviewOffset={dragPreviewOffset}
          onBlockMouseDown={onBlockMouseDown}
          onBlockEdit={onBlockEdit}
          showCurrentTime={isToday(date)}
          date={date}
          isMobile={isMobile}
          activeBlockId={activeBlockId}
        />
      </div>
    </div >
  );
});