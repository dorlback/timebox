import { TimeBlock } from '@/types/planner';
import React, { useState } from 'react';

interface TimeBlockEditorProps {
  block: TimeBlock;
  onSave: (blockId: number, newStart: number, newEnd: number) => void;
  onClose: () => void;
}

export const TimeBlockEditor: React.FC<TimeBlockEditorProps> = ({
  block,
  onSave,
  onClose
}) => {
  const [startHour, setStartHour] = useState(Math.floor(block.startTime / 60));
  const [startMin, setStartMin] = useState(block.startTime % 60);
  const [duration, setDuration] = useState(block.endTime - block.startTime);

  const handleSave = () => {
    const newStart = startHour * 60 + startMin;
    const newEnd = newStart + duration;
    onSave(block.id, newStart, newEnd);
  };

  // 종료 시간 계산
  const endMinutes = startHour * 60 + startMin + duration;
  const endHour = Math.floor(endMinutes / 60);
  const endMin = endMinutes % 60;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-80">
        <div className="bg-white rounded-lg shadow-xl border border-gray-200">

          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{block.text}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-5 py-5 space-y-4">

            {/* Start Time */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">
                시작 시간
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={startHour}
                  onChange={(e) => setStartHour(parseInt(e.target.value) || 0)}
                  className="w-16 px-3 py-2 text-center border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-gray-400">:</span>
                <select
                  value={startMin}
                  onChange={(e) => setStartMin(parseInt(e.target.value))}
                  className="w-16 px-3 py-2 text-center border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[0, 10, 20, 30, 40, 50].map(m => (
                    <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">
                소요 시간
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="10"
                  max="480"
                  step="10"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 10)}
                  className="w-20 px-3 py-2 text-center border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-sm text-gray-500">분</span>
              </div>
            </div>

            {/* End Time Display */}
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">종료 시간</span>
                <span className="font-medium text-gray-900">
                  {endHour.toString().padStart(2, '0')}:{endMin.toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 bg-gray-50 flex gap-2 rounded-b-lg">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </>
  );
};