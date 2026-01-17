import { TimeBlock } from "@/types/planner";

export const formatTimeDisplay = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${mins.toString().padStart(2, '0')}`;
};

export const getCurrentTimeInMinutes = (): number => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

export const findAvailableSlot = (
  blocks: TimeBlock[],
  duration: number = 60,
  startFrom: number = 0
): { startTime: number; endTime: number } | null => {
  // 블록들을 시작 시간 기준으로 정렬
  const sortedBlocks = [...blocks].sort((a, b) => a.startTime - b.startTime);

  // startFrom 이전의 블록들은 필터링
  const relevantBlocks = sortedBlocks.filter(block => block.endTime > startFrom);

  // startFrom부터 시작
  let currentTime = startFrom;

  for (const block of relevantBlocks) {
    // 현재 시간과 다음 블록 시작 사이에 공간이 있는지 확인
    if (currentTime + duration <= block.startTime) {
      return {
        startTime: currentTime,
        endTime: currentTime + duration
      };
    }
    // 다음 블록이 끝나는 시간으로 이동
    currentTime = Math.max(currentTime, block.endTime);
  }

  // 마지막 블록 이후에 공간이 있는지 확인 (24시 이전)
  if (currentTime + duration <= 1440) {
    return {
      startTime: currentTime,
      endTime: currentTime + duration
    };
  }

  return null;
};

export const findAvailableSlotAfterNow = (
  blocks: TimeBlock[],
  duration: number = 60
): { startTime: number; endTime: number } | null => {
  const currentTime = getCurrentTimeInMinutes();

  // 현재 시간 다음 정시 계산
  // 예: 14:23 -> 15:00, 16:00 -> 16:00, 16:30 -> 17:00
  const currentHour = Math.floor(currentTime / 60);
  const currentMinute = currentTime % 60;

  // 현재 분이 0이 아니면 다음 정시, 0이면 현재 정시
  const nextHourStart = currentMinute > 0 ? (currentHour + 1) * 60 : currentHour * 60;

  // 24시를 넘지 않도록 체크
  if (nextHourStart >= 1440) {
    return null;
  }

  return findAvailableSlot(blocks, duration, nextHourStart);
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