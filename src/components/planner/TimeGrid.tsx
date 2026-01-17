import React from 'react';
import { TimeBlock as TimeBlockType } from '@/types/planner';
import { TimeBlock } from './TimeBlock';
import { CurrentTimeIndicator } from './CurrentTimeIndicator';

interface TimeGridProps {
  timeBlocks: TimeBlockType[];
  draggingBlockId: number | null;
  resizingBlockId: number | null;
  onBlockMouseDown: (e: React.MouseEvent, block: TimeBlockType) => void;
  onBlockEdit: (block: TimeBlockType) => void;
  showCurrentTime?: boolean; // 오늘 날짜일 때만 true로 전달
}

export const TimeGrid: React.FC<TimeGridProps> = ({
  timeBlocks,
  draggingBlockId,
  resizingBlockId,
  onBlockMouseDown,
  onBlockEdit,
  showCurrentTime = false
}) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minuteMarkers = [10, 20, 30, 40, 50, 0];
  const pixelsPerMinute = 1; // 1분당 1픽셀 (60px / 60분)

  return (
    <div className="relative">
      <div className="border-b border-gray-300 mb-2" style={{ height: '1px' }}></div>

      <div id="time-grid" className="relative" style={{ height: '1440px' }}>
        {/* 시간 그리드 배경 */}
        {hours.map((hour) => (
          <div key={hour} className="flex border-b border-gray-200" style={{ height: '60px' }}>
            <div className="w-12 text-sm text-gray-600 pr-2 text-right pt-1">{hour}</div>
            <div className="flex-1 relative">
              {minuteMarkers.map((_, idx) => (
                <div
                  key={idx}
                  className="absolute border-l border-gray-100"
                  style={{ left: `${idx * 16.666}%`, height: '100%' }}
                ></div>
              ))}
            </div>
          </div>
        ))}

        {/* 타임 블록들 */}
        {timeBlocks.map((block) => (
          <TimeBlock
            key={block.id}
            block={block}
            isDragging={draggingBlockId === block.id}
            isResizing={resizingBlockId === block.id}
            onMouseDown={onBlockMouseDown}
            onEdit={onBlockEdit}
          />
        ))}

        {/* 현재 시간 표시 줄 - 오늘 날짜일 때만 */}
        {showCurrentTime && (
          <CurrentTimeIndicator pixelsPerMinute={pixelsPerMinute} />
        )}
      </div>
    </div>
  );
};