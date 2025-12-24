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
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};