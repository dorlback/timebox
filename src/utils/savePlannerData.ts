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
  showError: (msg: string) => void
) => {
  const supabase = createClient();

  try {
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
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id, planned_date' }
      );

    if (error) throw error;

    // ✅ 핵심: 자동 저장이 아닐 때(버튼 클릭)만 성공 토스트를 띄웁니다.
    if (!isAuto) {
      showSuccess('저장이 완료되었습니다.');
    }

  } catch (error: any) {
    // 에러 발생 시에는 자동/수동 상관없이 알려주는 것이 좋습니다.
    console.error('저장 에러:', error);
    showError('저장 중 오류가 발생했습니다.');
    // alert은 toast가 있다면 중복이므로 제거하거나 선택적으로 사용하세요.
  }
};