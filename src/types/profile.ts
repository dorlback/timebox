export interface ProfileResponse {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  location: string | null;
  birthday: string | null;
  description: string | null;
  is_admin: boolean | false;
  language?: string;
  updated_at: string;
  deleted_at: string | null;
}