'use client'

import { useUser } from '@/hooks/useUser';

export default function MyPage() {
  const { user, updateProfile, isUpdating } = useUser();

  const handleUpdate = () => {
    updateProfile({ display_name: '새로운 닉네임' });
  };

  if (!user) return <div>로그인 하세요</div>;

  return (
    <div>
      <h1>마이페이지</h1>
      <p>현재 닉네임: {user.displayName}</p>
      <button onClick={handleUpdate} disabled={isUpdating}>
        {isUpdating ? '수정 중...' : '닉네임 변경'}
      </button>
    </div>
  );
}