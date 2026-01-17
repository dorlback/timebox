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
  // 24시간 형식을 12시간 형식으로 변환
  const convertTo12Hour = (hour24: number) => {
    const period = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 || 12;
    return { hour12, period };
  };

  // 12시간 형식을 24시간 형식으로 변환
  const convertTo24Hour = (hour12: number, period: string) => {
    if (period === 'AM') {
      return hour12 === 12 ? 0 : hour12;
    } else {
      return hour12 === 12 ? 12 : hour12 + 12;
    }
  };

  // 초기값 설정
  const initialStartHour24 = Math.floor(block.startTime / 60);
  const initialEndHour24 = Math.floor(block.endTime / 60);

  const initialStart = convertTo12Hour(initialStartHour24);
  const initialEnd = convertTo12Hour(initialEndHour24);

  // State 관리
  const [startHour12, setStartHour12] = useState(initialStart.hour12);
  const [startPeriod, setStartPeriod] = useState(initialStart.period);
  const [startMin, setStartMin] = useState(block.startTime % 60);

  const [endHour12, setEndHour12] = useState(initialEnd.hour12);
  const [endPeriod, setEndPeriod] = useState(initialEnd.period);
  const [endMin, setEndMin] = useState(block.endTime % 60);

  // 현재 설정된 시간을 24시간 형식으로 계산
  const currentStartHour24 = convertTo24Hour(startHour12, startPeriod);
  const currentEndHour24 = convertTo24Hour(endHour12, endPeriod);
  const currentStartMinutes = currentStartHour24 * 60 + startMin;
  const currentEndMinutes = currentEndHour24 * 60 + endMin;

  // 소요 시간 계산
  const totalMinutes = currentEndMinutes - currentStartMinutes;
  const durationHours = Math.floor(totalMinutes / 60);
  const durationMins = totalMinutes % 60;

  const handleSave = () => {
    // 종료 시간이 시작 시간보다 이전인 경우 방지
    if (currentEndMinutes <= currentStartMinutes) {
      alert('종료 시간은 시작 시간 이후여야 합니다.');
      return;
    }

    onSave(block.id, currentStartMinutes, currentEndMinutes);
  };

  // 시간 옵션 생성 (1-12시)
  const hourOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  // 분 옵션 생성 (0, 10, 20, 30, 40, 50)
  const minuteOptions = [0, 10, 20, 30, 40, 50];

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
                <select
                  value={startPeriod}
                  onChange={(e) => setStartPeriod(e.target.value)}
                  className="w-16 px-2 py-2 text-center border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="AM">오전</option>
                  <option value="PM">오후</option>
                </select>
                <select
                  value={startHour12}
                  onChange={(e) => setStartHour12(parseInt(e.target.value))}
                  className="w-16 px-3 py-2 text-center border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {hourOptions.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <span className="text-gray-400">:</span>
                <select
                  value={startMin}
                  onChange={(e) => setStartMin(parseInt(e.target.value))}
                  className="w-16 px-3 py-2 text-center border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {minuteOptions.map(m => (
                    <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* End Time */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">
                종료 시간
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={endPeriod}
                  onChange={(e) => setEndPeriod(e.target.value)}
                  className="w-16 px-2 py-2 text-center border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="AM">오전</option>
                  <option value="PM">오후</option>
                </select>
                <select
                  value={endHour12}
                  onChange={(e) => setEndHour12(parseInt(e.target.value))}
                  className="w-16 px-3 py-2 text-center border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {hourOptions.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <span className="text-gray-400">:</span>
                <select
                  value={endMin}
                  onChange={(e) => setEndMin(parseInt(e.target.value))}
                  className="w-16 px-3 py-2 text-center border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {minuteOptions.map(m => (
                    <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Duration Display */}
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">소요 시간</span>
                <span className="font-medium text-gray-900">
                  {durationHours > 0 && `${durationHours}시간 `}
                  {durationMins > 0 && `${durationMins}분`}
                  {totalMinutes <= 0 && '시간을 확인해주세요'}
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