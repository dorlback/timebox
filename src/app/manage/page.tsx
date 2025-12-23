'use client'

import { useUserList, useUser } from "@/hooks/useUser"; // 내 정보 확인용 useUser 추가 권장
import { createClient } from "@/lib/supabase/client";

// API 함수 (보통은 lib/api/user.ts에 두는 것이 좋으나 현재 위치 유지)
export async function toggleAdminRole(userId: string, currentStatus: boolean) {
  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ is_admin: !currentStatus })
    .eq('id', userId);

  if (error) throw error;
}

export default function UserManagement() {
  // forceDelete와 isDeleting을 추가로 구조분해 할당합니다.
  const {
    users,
    isLoading,
    upsertUser,
    deleteUser,
    withdraw,
    forceDelete,
    isDeleting,
    isProcessing
  } = useUserList();

  // 버튼 전체 비활성화를 위한 통합 로딩 상태
  const pending = isProcessing || isDeleting;

  if (isLoading) return <div className="p-10">데이터를 불러오는 중...</div>;

  console.log(users)

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">유저 관리 시스템</h1>
        <button
          onClick={() => { if (confirm('정말 탈퇴하시겠습니까?')) withdraw() }}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          회원 탈퇴 (내 계정 삭제)
        </button>
      </div>

      <table className="w-full border-collapse border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-3 text-left">ID</th>
            <th className="border p-3 text-left">이름</th>
            <th className="border p-3 text-left">이메일</th>
            <th className="border p-3 text-center">액션</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="border p-3 text-sm text-gray-500">{user.id.slice(0, 8)}...</td>
              <td className="border p-3 font-medium">
                {user.displayName}
                {user.isAdmin && <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-1 rounded">Admin</span>}
              </td>
              <td className="border p-3">{user.email}</td>
              <td className="border p-3 text-center space-x-2">
                {/* 수정 버튼 */}
                <button
                  onClick={() => {
                    const newName = prompt('새 이름을 입력하세요', user.displayName);
                    if (newName) upsertUser({ id: user.id, display_name: newName });
                  }}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm disabled:bg-gray-300"
                  disabled={pending}
                >
                  수정
                </button>

                {/* 관리자 권한 토글 */}
                <button
                  onClick={() => toggleAdminRole(user.id, user.isAdmin)}
                  className={`px-3 py-1 rounded text-sm disabled:opacity-50 ${user.isAdmin ? 'bg-orange-500' : 'bg-gray-400'} text-white`}
                  disabled={pending}
                >
                  {user.isAdmin ? '권한 해제' : '관리자 임명'}
                </button>

                {/* 강제 탈퇴 (Auth까지 삭제) */}
                <button
                  onClick={() => { if (confirm(`[경고] ${user.displayName}의 계정을 완전히 삭제하시겠습니까?`)) forceDelete(user.id) }}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:bg-gray-300"
                  disabled={pending}
                >
                  강제 탈퇴
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {users.length === 0 && <p className="text-center py-10 text-gray-500">유저가 없습니다.</p>}
    </div>
  );
}