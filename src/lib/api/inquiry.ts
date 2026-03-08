import { createClient } from '@/lib/supabase/client';

export type InquiryData = {
  name: string;
  content: string;
  email: string;
};

export async function createInquiry(data: InquiryData) {
  const supabase = createClient();
  const { error } = await supabase
    .from('inquiries')
    .insert([
      {
        name: data.name,
        content: data.content,
        email: data.email,
      },
    ]);

  if (error) {
    console.error('Error creating inquiry:', error);
    throw error;
  }
}

export async function fetchInquiries() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching inquiries:', error);
    throw error;
  }
  return data;
}

export async function updateInquiryStatus(id: number, is_completed: boolean) {
  const supabase = createClient();
  const { error } = await supabase
    .from('inquiries')
    .update({
      is_completed,
      responded_at: is_completed ? new Date().toISOString() : null
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating inquiry status:', error);
    throw error;
  }
}
