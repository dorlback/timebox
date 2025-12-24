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

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-white border-2 border-blue-500 rounded-lg p-4 shadow-2xl w-80">
        <div className="text-sm font-semibold mb-3">{block.text}</div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-sm w-16">시작 시간</label>
            <input
              type="number"
              min="0"
              max="23"
              value={startHour}
              onChange={(e) => setStartHour(parseInt(e.target.value) || 0)}
              className="w-14 px-2 py-1 border rounded text-sm text-center"
            />
            <span>:</span>
            <select
              value={startMin}
              onChange={(e) => setStartMin(parseInt(e.target.value))}
              className="w-14 px-2 py-1 border rounded text-sm"
            >
              {[0, 10, 20, 30, 40, 50].map(m => (
                <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm w-16">소요 시간</label>
            <input
              type="number"
              min="10"
              max="480"
              step="10"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 10)}
              className="w-20 px-2 py-1 border rounded text-sm text-center"
            />
            <span className="text-sm">분</span>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
            >
              저장
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 px-3 py-2 rounded text-sm hover:bg-gray-400"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </>
  );
};