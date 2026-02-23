// types/user.ts
import { ProfileResponse } from './profile';

export interface UserResponse {
  id: string;
  email: string;
  phone: string;
  created_at: string;
  profile: ProfileResponse | null; // Join된 프로필 데이터
}

export class User {
  constructor(
    public id: string,
    public email: string,
    public displayName: string,
    public avatarUrl: string,
    public location: string,
    public birthday: string,
    public description: string,
    public phone: string,
    public language: string,
    public isAdmin: boolean,
    public createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null
  ) { }

  /**
   * Supabase Auth 유저 객체와 Profile 객체를 받아서 User 인스턴스 생성
   */
  static fromSupabase(authData: any, profileData: ProfileResponse | null): User {
    return new User(
      authData.id,
      authData.email ?? '',
      profileData?.display_name ?? authData.raw_user_meta_data?.full_name ?? '익명 유저',
      profileData?.avatar_url ?? authData.raw_user_meta_data?.avatar_url ?? '',
      profileData?.location ?? '',
      profileData?.birthday ?? '',
      profileData?.description ?? '',
      authData.phone ?? '',
      profileData?.language ?? 'ko',
      profileData?.is_admin ?? false,
      new Date(authData.created_at),
      new Date(profileData?.updated_at ?? authData.created_at),
      profileData?.deleted_at ? new Date(profileData.deleted_at) : null
    );
  }
}