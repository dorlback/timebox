import { createClient } from "../supabase/client";

export async function fetchUnreadAnnouncementsCount(userId: string) {
  const supabase = createClient();

  // 1. 유저가 볼 수 있는 모든 공지사항 가져오기 (RLS 정책에 의해 자동 필터링됨)
  const { data: announcements, error: annError } = await supabase
    .from('announcements')
    .select('id');

  if (annError) throw annError;

  // 2. 유저가 이미 읽은 공지사항 ID 목록 가져오기
  const { data: readAnnouncements, error: readError } = await supabase
    .from('announcement_reads')
    .select('announcement_id')
    .eq('user_id', userId);

  if (readError) throw readError;

  const readIds = new Set(readAnnouncements.map(r => r.announcement_id));
  const unreadCount = announcements.filter(a => !readIds.has(a.id)).length;

  return unreadCount;
}

export async function fetchAnnouncementsWithReadStatus(userId: string) {
  const supabase = createClient();

  // 공지사항과 읽음 정보를 조인해서 가져오기
  const { data, error } = await supabase
    .from('announcements')
    .select(`
      *,
      author:profiles(display_name),
      announcement_reads(user_id)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(ann => ({
    ...ann,
    isRead: ann.announcement_reads?.some((r: any) => r.user_id === userId) || false
  }));
}

export async function markAsRead(userId: string, announcementId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('announcement_reads')
    .upsert({ user_id: userId, announcement_id: announcementId }, { onConflict: 'user_id, announcement_id' });

  if (error) {
    if (error.code === '23505') return; // 이미 읽음 처리된 경우 무시
    throw error;
  }
}

export async function markAllAsRead(userId: string, unreadIds: string[]) {
  if (unreadIds.length === 0) return;
  const supabase = createClient();
  const insertData = unreadIds.map(id => ({ user_id: userId, announcement_id: id }));

  const { error } = await supabase
    .from('announcement_reads')
    .upsert(insertData, { onConflict: 'user_id, announcement_id' });

  if (error) throw error;
}
