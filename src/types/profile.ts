export interface ProfileResponse {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  is_admin: boolean | false;
  updated_at: string;
}