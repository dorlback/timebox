import React, { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import { addDays, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';

// 스타일 임포트 (전역 CSS에 추가 권장)
import "react-datepicker/dist/react-datepicker.css";

interface DateSelectorProps {
  date: Date;
  onDateChange: (year: number, month: number, day: number) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  date,
  onDateChange
}) => {

  // 공통 날짜 업데이트 로직
  const handleDateUpdate = (newDate: Date | null) => {
    if (!newDate) return;
    onDateChange(
      newDate.getFullYear(),
      newDate.getMonth() + 1,
      newDate.getDate()
    );
  };

  // 화살표 클릭 핸들러
  const goYesterday = () => handleDateUpdate(subDays(date, 1));
  const goTomorrow = () => handleDateUpdate(addDays(date, 1));

  /**
   * DatePicker를 트리거할 커스텀 입력창입니다.
   * forwardRef를 사용해야 라이브러리에서 위치를 잡고 팝업을 띄울 수 있습니다.
   */
  const CustomInput = forwardRef(({ value, onClick }: any, ref: any) => (
    <button
      onClick={onClick}
      ref={ref}
      className="flex items-center gap-2 px-4 h-full hover:bg-gray-50 transition-colors group outline-none"
    >
      <span className="text-sm font-bold text-gray-800 tracking-tight">
        {value}
      </span>
      <svg
        className="text-[#3B82F6] group-hover:scale-110 transition-transform"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        viewBox="0 0 24 24"
      >
        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </button>
  ));

  CustomInput.displayName = "CustomInput";

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm h-10 overflow-hidden">
        {/* 어제 이동 버튼 */}
        <button
          onClick={goYesterday}
          className="px-3 h-full hover:bg-gray-50 transition-colors border-r border-gray-100 text-gray-400 hover:text-gray-600"
          title="어제"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* 데이트피커 본체 */}
        <DatePicker
          selected={date}
          onChange={handleDateUpdate}
          locale={ko}
          dateFormat="yyyy년 MM월 dd일 (eee)"
          customInput={<CustomInput />}
          // 팝업 위치 조절 (필요 시)
          popperPlacement="bottom-start"
          // 팝업이 다른 요소에 가려진다면 아래 설정 추가
          portalId="root-portal"
        />

        {/* 내일 이동 버튼 */}
        <button
          onClick={goTomorrow}
          className="px-3 h-full hover:bg-gray-50 transition-colors border-l border-gray-100 text-gray-400 hover:text-gray-600"
          title="내일"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* 오늘 버튼 */}
      <button
        onClick={() => handleDateUpdate(new Date())}
        className="px-4 h-10 text-xs font-bold text-[#3B82F6] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
      >
        오늘
      </button>
    </div>
  );
};