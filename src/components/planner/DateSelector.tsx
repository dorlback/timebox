import React, { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import { addDays, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';

// 스타일 임포트 (전역 CSS에 추가 권장)
import "react-datepicker/dist/react-datepicker.css";

interface DateSelectorProps {
  date: Date;
  onDateChange: (year: number, month: number, day: number) => void;
  isMobile?: boolean;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  date,
  onDateChange,
  isMobile = false
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
      className="flex items-center gap-2 px-4 h-full hover:bg-muted transition-colors group outline-none"
    >
      <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold text-foreground tracking-tight`}>
        {value}
      </span>
      <svg
        className="text-primary group-hover:scale-110 transition-transform"
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
    <div className={`flex w-full items-center  ${isMobile ? 'gap-1 justify-between' : 'gap-2 justify-end'}`}>
      <div className={`flex items-center bg-card border border-border rounded-lg shadow-sm h-10 overflow-hidden ${isMobile ? 'scale-90 origin-right' : ''}`}>
        {/* 어제 이동 버튼 */}
        <button
          onClick={goYesterday}
          className={`${isMobile ? 'px-2' : 'px-3'} h-full hover:bg-muted transition-colors border-r border-border text-muted-foreground hover:text-foreground`}
          title="어제"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* 데이트피커 본체 */}
        <DatePicker
          selected={date}
          onChange={handleDateUpdate}
          locale={ko}
          dateFormat={isMobile ? "MM/dd (eee)" : "yyyy년 MM월 dd일 (eee)"}
          customInput={<CustomInput />}
          popperPlacement="bottom-start"
          portalId="root-portal"
        />

        {/* 내일 이동 버튼 */}
        <button
          onClick={goTomorrow}
          className={`${isMobile ? 'px-2' : 'px-3'} h-full hover:bg-muted transition-colors border-l border-border text-muted-foreground hover:text-foreground`}
          title="내일"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <button
        onClick={() => handleDateUpdate(new Date())}
        className={`${isMobile ? 'min-h-8' : 'min-h-10'} px-4  text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors border border-primary/20`}
      >
        오늘
      </button>
    </div>
  );
};