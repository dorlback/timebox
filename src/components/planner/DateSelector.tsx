import { formatDate } from '@/utils/dateUtils';
import React from 'react';

interface DateSelectorProps {
  date: Date;
  onDateChange: (year: number, month: number, day: number) => void;
  onDayOfWeekClick: (dayIndex: number) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  date,
  onDateChange,
  onDayOfWeekClick
}) => {
  const currentDate = formatDate(date);

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={currentDate.year}
          onChange={(e) => {
            const newYear = parseInt(e.target.value) || currentDate.year;
            onDateChange(newYear, currentDate.month, currentDate.day);
          }}
          className="w-16 px-2 py-1 border rounded text-sm text-center"
        />
        <input
          type="number"
          min="1"
          max="12"
          value={currentDate.month}
          onChange={(e) => {
            const newMonth = parseInt(e.target.value) || 1;
            onDateChange(currentDate.year, newMonth, currentDate.day);
          }}
          className="w-12 px-2 py-1 border rounded text-sm text-center"
        />
        <input
          type="number"
          min="1"
          max="31"
          value={currentDate.day}
          onChange={(e) => {
            const newDay = parseInt(e.target.value) || 1;
            onDateChange(currentDate.year, currentDate.month, newDay);
          }}
          className="w-12 px-2 py-1 border rounded text-sm text-center"
        />
      </div>
      <div className="flex gap-1">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
          <button
            key={day}
            onClick={() => onDayOfWeekClick(idx)}
            className={`w-8 h-8 flex items-center justify-center text-xs rounded transition-colors ${idx === currentDate.dayOfWeekIndex
              ? idx === 0 ? 'bg-red-500 text-white font-semibold' : 'bg-blue-500 text-white font-semibold'
              : 'text-gray-400 hover:bg-gray-100 cursor-pointer'
              }`}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
};