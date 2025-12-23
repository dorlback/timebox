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

// 본인 회원 완전 탈퇴
export async function withdrawAccount() {
  const supabase = createClient();

  // 1. DB에 만든 delete_user_account 함수 실행
  const { error } = await supabase.rpc('delete_user_account');

  if (error) {
    console.error('탈퇴 처리 중 에러:', error.message);
    throw error;
  }

  // 2. 계정이 삭제되었으므로 클라이언트 세션도 로그아웃 처리
  await supabase.auth.signOut();

  // 3. 필요한 경우 메인 페이지로 이동
  window.location.href = '/';
}

// 관리자가 회원 완전 삭제
export async function forceDeleteAccount(userId: string) {
  const { error } = await supabase.rpc('admin_delete_user', {
    target_user_id: userId
  });
  if (error) throw error;
}