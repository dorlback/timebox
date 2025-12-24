import { TimeBlock } from "@/types/planner";

export const formatTimeDisplay = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${mins.toString().padStart(2, '0')}`;
};

export const findAvailableSlot = (
  timeBlocks: TimeBlock[],
  duration: number = 60
): { startTime: number; endTime: number } | null => {
  const startHour = 0;
  const endHour = 24;

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 10) {
      const startTime = hour * 60 + minute;
      const endTime = startTime + duration;

      const hasConflict = timeBlocks.some(block => {
        return (startTime < block.endTime && endTime > block.startTime);
      });

      if (!hasConflict && endTime <= endHour * 60) {
        return { startTime, endTime };
      }
    }
  }

  return null;
};

export const checkTimeConflict = (
  timeBlocks: TimeBlock[],
  excludeId: number | null,
  newStart: number,
  newEnd: number
): boolean => {
  return timeBlocks.some(block => {
    if (block.id === excludeId) return false;
    return (newStart < block.endTime && newEnd > block.startTime);
  });
};
