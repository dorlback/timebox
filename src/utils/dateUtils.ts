export const formatDate = (date: Date) => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    dayOfWeek: days[date.getDay()],
    dayOfWeekIndex: date.getDay()
  };
};

export const getDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};