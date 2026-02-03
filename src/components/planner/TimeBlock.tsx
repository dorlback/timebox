import React from 'react';
import { TimeBlock as TimeBlockType } from '@/types/planner';
import { getColorByIndex } from '@/utils/colorUtils';
import { formatTimeDisplay } from '@/utils/timeUtils';

interface TimeBlockProps {
  block: TimeBlockType;
  isDragging: boolean;
  isResizing: boolean;
  onMouseDown: (e: React.MouseEvent, block: TimeBlockType) => void;
  onEdit: (block: TimeBlockType) => void;
  isMobile?: boolean;
}

export const TimeBlock: React.FC<TimeBlockProps> = ({
  block,
  isDragging,
  isResizing,
  onMouseDown,
  onEdit,
  isMobile = false
}) => {
  const top = block.startTime * 1;
  const height = (block.endTime - block.startTime) * 1;
  const color = getColorByIndex(block.colorIndex);
  const isCompleted = block.completed;

  // 50분 미만이면 내용 숨김
  const duration = block.endTime - block.startTime;
  const showContent = duration >= 50;

  let touchTimer: NodeJS.Timeout;
  const handleTouchStart = () => {
    touchTimer = setTimeout(() => {
      onEdit(block);
    }, 600);
  };
  const handleTouchEnd = () => {
    clearTimeout(touchTimer);
  };

  return (
    <div
      className={`absolute ${isMobile ? 'left-8 right-1' : 'left-12 right-0'} rounded px-2 py-1 transition-all ${isCompleted
        ? 'bg-gray-200 border-2 border-gray-400'
        : `${color.bg} border-2 ${color.border}`
        } ${isDragging ? 'opacity-70 shadow-lg cursor-move' : ''} ${isResizing ? 'opacity-70 shadow-lg' : ''
        } ${isCompleted ? '' : 'hover:brightness-95'}`}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        cursor: isDragging ? 'move' : 'default'
      }}
      onMouseDown={(e) => onMouseDown(e, block)}
      onClick={(e) => {
        // 드래그/리사이즈 중이 아니었을 때만 클릭으로 처리
        if (!isMobile) {
          onEdit(block);
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseMove={(e) => {
        if (isDragging || isResizing) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;
        const blockHeight = rect.height;
        if (offsetY <= 10 || offsetY >= blockHeight - 10) {
          e.currentTarget.style.cursor = 'ns-resize';
        } else {
          e.currentTarget.style.cursor = showContent ? 'move' : 'pointer';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragging && !isResizing) {
          e.currentTarget.style.cursor = 'default';
        }
      }}
      title={
        !showContent
          ? `${block.text}\n${formatTimeDisplay(block.startTime)} - ${formatTimeDisplay(
            block.endTime
          )} (${duration}분)`
          : ''
      }
    >
      {showContent && (
        <>
          <div
            className={`text-xs font-semibold truncate pointer-events-none ${isCompleted ? 'text-gray-600 line-through' : color.text
              }`}
          >
            {block.text}
          </div>
          <div
            className={`text-xs mt-1 flex justify-between items-center ${isCompleted
              ? 'text-gray-500'
              : color.text.replace('900', '700')
              }`}
          >
            <span className="pointer-events-none">
              {formatTimeDisplay(block.startTime)} -{' '}
              {formatTimeDisplay(block.endTime)}
              <span className="ml-2">({duration}분)</span>
            </span>
          </div>
        </>
      )}
    </div>
  );
};