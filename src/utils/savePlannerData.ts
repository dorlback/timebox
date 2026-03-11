// hooks/usePlannerData.ts 내부 또는 별도 서비스 함수로 작성

import { DailyData } from '../types/planner';
import { createClient } from '../lib/supabase/client';

/**
 * 플래너 데이터를 DB에 저장하는 함수
 * @param userId 유저 고유 ID
 * @param dateKey "YYYY-MM-DD" 형식의 날짜 문자열
 * @param data 현재 날짜의 DailyData (brainDump, todoList, timeBlocks 포함)
 */
/**
 * 플래너 데이터를 DB에 저장하는 함수
 */
export const savePlannerData = async (
  userId: string,
  dateKey: string,
  data: DailyData,
  isAuto: boolean, // 자동 저장 여부
  showSuccess: (msg: string) => void,
  showError: (msg: string) => void,
  lastKnownUpdatedAt?: string // 클라이언트가 알고 있는 최신 수정 시간
): Promise<{ success: boolean; conflict?: boolean; serverData?: DailyData; updated_at?: string }> => {
  const supabase = createClient();

  // 3. 빈 데이터(Empty State) 저장 방지 가드
  const isEmpty =
    (!data.brainDump || data.brainDump.length === 0) &&
    (!data.todoList || data.todoList.length === 0) &&
    (!data.timeBlocks || data.timeBlocks.length === 0);

  if (isEmpty) {
    console.warn("저장할 데이터가 비어있어 중단합니다.");
    return { success: false };
  }

  try {
    // 1. updated_at (타임스탬프) 비교
    if (lastKnownUpdatedAt) {
      const { data: serverRecord, error: fetchError } = await supabase
        .from('timebox')
        .select('updated_at, payload')
        .eq('user_id', userId)
        .eq('planned_date', dateKey)
        .single();

      if (!fetchError && serverRecord?.updated_at) {
        const serverTime = new Date(serverRecord.updated_at).getTime();
        const clientTime = new Date(lastKnownUpdatedAt).getTime();

        // 서버의 데이터가 내 로컬 데이터보다 최신인 경우
        if (serverTime > clientTime) {
          console.warn("서버에 더 최신 데이터가 있습니다. 충돌 발생.");
          return {
            success: false,
            conflict: true,
            serverData: serverRecord.payload as DailyData,
            updated_at: serverRecord.updated_at
          };
        }
      }
    }

    const newUpdatedAt = new Date().toISOString();
    const { error } = await supabase
      .from('timebox')
      .upsert(
        {
          user_id: userId,
          planned_date: dateKey,
          payload: {
            brainDump: data.brainDump,
            todoList: data.todoList,
            timeBlocks: data.timeBlocks
          },
          updated_at: newUpdatedAt
        },
        { onConflict: 'user_id, planned_date' }
      );

    if (error) throw error;

    if (!isAuto) {
      showSuccess('저장이 완료되었습니다.');
    }

    return { success: true, updated_at: newUpdatedAt };

  } catch (error: any) {
    console.error('저장 에러:', error);
    showError('저장 중 오류가 발생했습니다.');
    return { success: false };
  }
};