import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteProfile, fetchCurrentUserInfo, fetchUserList, forceDeleteAccount, updateMyProfile, upsertProfile, withdrawAccount } from '@/lib/api/user';

export function useUser() {
  const queryClient = useQueryClient();

  // 조회
  const query = useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUserInfo,
  });

  // 수정 (Mutation)
  const mutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      // 1. 내 정보 캐시 갱신
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      // 2. 만약 유저 리스트 페이지도 보고 있다면 함께 갱신
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return {
    user: query.data,
    isLoading: query.isLoading,
    updateProfile: mutation.mutate,
    isUpdating: mutation.isPending,
  };
}

export function useUserList() {
  const queryClient = useQueryClient();

  // 1. 조회 (Read)
  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: fetchUserList,
  });

  // 2. 생성 및 수정 (Create & Update)
  const upsertMutation = useMutation({
    mutationFn: upsertProfile,
    onSuccess: () => {
      // 데이터가 변했으므로 'users' 키를 가진 쿼리를 무효화해서 다시 불러오게 함
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // 3. 삭제 (Delete)
  const deleteMutation = useMutation({
    mutationFn: deleteProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  //4. 회원 탈퇴 (본인)
  const withdrawMutation = useMutation({
    mutationFn: withdrawAccount, // 아까 lib/api/user.ts에 만든 함수
    onSuccess: () => {
      queryClient.clear(); // 모든 캐시 삭제
      window.location.href = '/'; // 메인으로 리다이렉트
    }
  });

  // [추가] 관리자 전용 강제 탈퇴 Mutation
  const forceDeleteMutation = useMutation({
    mutationFn: (userId: string) => forceDeleteAccount(userId), // 아까 만든 RPC 호출 함수
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      alert('사용자가 완전히 삭제되었습니다.');
    },
    onError: (error: any) => alert(`실패: ${error.message}`)
  });

  return {
    users: usersQuery.data ?? [],
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    upsertUser: upsertMutation.mutate,
    deleteUser: deleteMutation.mutate,
    withdraw: withdrawMutation.mutate, // 추가
    forceDelete: forceDeleteMutation.mutate,
    isDeleting: forceDeleteMutation.isPending,
    isProcessing: upsertMutation.isPending || deleteMutation.isPending || withdrawMutation.isPending
  };

  // return {
  //   users: usersQuery.data ?? [],
  //   isLoading: usersQuery.isLoading,
  //   isError: usersQuery.isError,
  //   // 메서드들 추출
  //   upsertUser: upsertMutation.mutate,
  //   deleteUser: deleteMutation.mutate,
  //   isUpdating: upsertMutation.isPending,
  //   isDeleting: deleteMutation.isPending,
  // };
}