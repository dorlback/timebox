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
}

export const TimeBlock: React.FC<TimeBlockProps> = ({
  block,
  isDragging,
  isResizing,
  onMouseDown,
  onEdit
}) => {
  const top = block.startTime * 1;
  const height = (block.endTime - block.startTime) * 1;
  const color = getColorByIndex(block.colorIndex);
  const isCompleted = block.completed;

  return (
    <div
      className={`absolute left-12 right-0 rounded px-2 py-1 transition-colors ${isCompleted
        ? 'bg-gray-200 border-2 border-gray-400'
        : `${color.bg} border-2 ${color.border}`
        } ${isDragging ? 'opacity-70 shadow-lg cursor-move' : ''
        } ${isResizing ? 'opacity-70 shadow-lg' : ''} ${isCompleted ? '' : 'hover:brightness-95'
        }`}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        cursor: isDragging ? 'move' : 'default'
      }}
      onMouseDown={(e) => onMouseDown(e, block)}
      onMouseMove={(e) => {
        if (isDragging || isResizing) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;
        const blockHeight = rect.height;
        if (offsetY <= 10 || offsetY >= blockHeight - 10) {
          e.currentTarget.style.cursor = 'ns-resize';
        } else {
          e.currentTarget.style.cursor = 'move';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragging && !isResizing) {
          e.currentTarget.style.cursor = 'default';
        }
      }}
    >
      <div className={`text-xs font-semibold truncate pointer-events-none ${isCompleted ? 'text-gray-600 line-through' : color.text
        }`}>
        {block.text}
      </div>
      <div className={`text-xs mt-1 flex justify-between items-center ${isCompleted ? 'text-gray-500' : color.text.replace('900', '700')
        }`}>
        <span className="pointer-events-none">
          {formatTimeDisplay(block.startTime)} - {formatTimeDisplay(block.endTime)}
          <span className="ml-2">({block.endTime - block.startTime}분)</span>
        </span>
        <button
          className={`edit-button text-white px-2 py-1 rounded text-xs ${isCompleted ? 'bg-gray-400 hover:bg-gray-500' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          onClick={(e) => {
            e.stopPropagation();
            onEdit(block);
          }}
        >
          수정
        </button>
      </div>
    </div>
  );
};