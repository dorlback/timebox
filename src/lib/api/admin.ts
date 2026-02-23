import { createClient } from "../supabase/client";

export async function fetchAllWithdrawalFeedback() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('withdrawal_feedback')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching withdrawal feedback:', error);
    throw error;
  }

  return data;
}

export interface AnnouncementData {
  category: string;
  title: string;
  content: string;
  target_user_ids?: string[];
  author_id?: string;
}

export async function createAnnouncement(data: AnnouncementData) {
  const supabase = createClient();

  // Get current user for author_id
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('announcements')
    .insert([{ ...data, author_id: user?.id }]);

  if (error) {
    console.error('Error creating announcement:', error);
    throw error;
  }
}

export async function fetchAnnouncements() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('announcements')
    .select('*, author:profiles(display_name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching announcements:', error);
    throw error;
  }

  return data;
}
