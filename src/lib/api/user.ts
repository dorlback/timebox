import { User } from '@/types/user';
import { createClient } from '../supabase/client';
import { ProfileResponse } from '@/types/profile';

const supabase = createClient();

export async function fetchCurrentUserInfo(): Promise<User | null> {
  // 1. 세션 유저 가져오기
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
  if (authError || !authUser) return null;

  // 2. 프로필 정보 가져오기 (직접 DB 호출)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single();

  // 3. 도메인 모델(클래스)로 변환하여 반환
  // 이전에 만드신 User.fromSupabase 정적 메서드를 여기서 활용합니다.
  return User.fromSupabase(authUser, profile);
}

export async function fetchUserList(): Promise<User[]> {
  const { data, error } = await supabase
    .from('user_management_view') // 테이블 대신 뷰를 조회
    .select('*');

  if (error) throw error;

  // 뷰에는 email이 포함되어 있으므로 profile 객체 자체를 
  // authData 자리에 넣어도 email을 읽을 수 있게 됩니다.
  return data.map((item) => User.fromSupabase(item, item));
}

export async function upsertProfile(profile: Partial<ProfileResponse>) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile) // ID가 일치하면 수정, 없으면 삽입
    .select()
    .single();

  if (error) throw error;
  return data;
}

// [update only]
export async function updateMyProfile(profile: Partial<ProfileResponse>) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다.");

  const { data, error } = await supabase
    .from('profiles')
    .upsert({ ...profile, id: user.id }) // 내 ID를 강제로 주입하여 남의 정보를 수정 못하게 방지
    .select()
    .single();

  if (error) throw error;
  return data;
}

// [DELETE] 프로필 삭제
export async function deleteProfile(id: string) {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// 본인 회원 탈퇴 (Soft Delete: 30일 유예 기간 적용)
export async function withdrawAccount() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다.");

  // profiles 테이블의 deleted_at 컬럼에 현재 시간 기록
  const { error } = await supabase
    .from('profiles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', user.id);

  if (error) {
    console.error('탈퇴 신청 중 에러:', error.message);
    throw error;
  }

  // 로그아웃 처리
  await supabase.auth.signOut();
  window.location.href = '/';
}

// 계정 복구 (Soft Delete 해제)
export async function reactivateAccount() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다.");

  // deleted_at을 다시 null로 설정
  const { error } = await supabase
    .from('profiles')
    .update({ deleted_at: null })
    .eq('id', user.id);

  if (error) {
    console.error('계정 복구 중 에러:', error.message);
    throw error;
  }

  return true;
}

// 관리자가 회원 완전 삭제 (기존 RPC 사용 가능)
export async function forceDeleteAccount(userId: string) {
  const { error } = await supabase.rpc('admin_delete_user', {
    target_user_id: userId
  });
  if (error) throw error;
}