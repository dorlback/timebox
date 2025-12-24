import React from 'react';
import { TimeBlock as TimeBlockType } from '@/types/planner';
import { TimeBlock } from './TimeBlock';

interface TimeGridProps {
  timeBlocks: TimeBlockType[];
  draggingBlockId: number | null;
  resizingBlockId: number | null;
  onBlockMouseDown: (e: React.MouseEvent, block: TimeBlockType) => void;
  onBlockEdit: (block: TimeBlockType) => void;
}

export const TimeGrid: React.FC<TimeGridProps> = ({
  timeBlocks,
  draggingBlockId,
  resizingBlockId,
  onBlockMouseDown,
  onBlockEdit
}) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minuteMarkers = [10, 20, 30, 40, 50, 0];

  return (
    <div className="relative">
      <div className="border-b border-gray-300 mb-2" style={{ height: '1px' }}></div>

      <div id="time-grid" className="relative" style={{ height: '1440px' }}>
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
      </div>
    </div>
  );
};