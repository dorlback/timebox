import React, { useState, useEffect } from 'react';
import { getCurrentTimeInMinutes } from '@/utils/timeUtils';

interface CurrentTimeIndicatorProps {
  pixelsPerMinute: number;
  date?: Date; // 날짜가 변경될 때 감지하기 위한 prop
}

export const CurrentTimeIndicator: React.FC<CurrentTimeIndicatorProps> = ({
  pixelsPerMinute,
  date
}) => {
  const [currentMinutes, setCurrentMinutes] = useState(getCurrentTimeInMinutes());

  useEffect(() => {
    // 컴포넌트 마운트 시 또는 날짜 변경 시 즉시 업데이트
    setCurrentMinutes(getCurrentTimeInMinutes());

    // 매 분마다 현재 시간 업데이트
    const interval = setInterval(() => {
      setCurrentMinutes(getCurrentTimeInMinutes());
    }, 60000); // 1분마다 업데이트

    return () => clearInterval(interval);
  }, [date]); // date가 변경될 때마다 재실행

  const topPosition = currentMinutes * pixelsPerMinute;
  const currentHour = Math.floor(currentMinutes / 60);
  const currentMin = currentMinutes % 60;
  const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;

  return (
    <div
      className="absolute left-0 right-0 z-30 pointer-events-none"
      style={{ top: `${topPosition}px` }}
    >
      {/* 시간 표시 레이블 */}
      <div className="absolute -left-1 -top-2.5 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded shadow-md">
        {timeString}
      </div>

      {/* 빨간 선 */}
      <div className="w-full h-0.5 bg-red-500 shadow-sm">
        {/* 선 끝의 원형 점 */}
        <div className="absolute -right-1 -top-1 w-2 h-2 bg-red-500 rounded-full shadow-md" />
      </div>
    </div>
  );
};