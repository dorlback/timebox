import React from 'react';
import { TimeBlock } from '@/types/planner';
import { TimeGrid } from './TimeGrid';
import { DateSelector } from './DateSelector';

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
  return (
    <div className="col-span-2 bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-700">TIME PLAN</h2>
        <DateSelector
          date={date}
          onDateChange={onDateChange}
          onDayOfWeekClick={onDayOfWeekClick}
        />
      </div>

      <div className="overflow-auto" style={{ maxHeight: '700px' }}>
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