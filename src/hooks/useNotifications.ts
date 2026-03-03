import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAnnouncementsWithReadStatus, fetchUnreadAnnouncementsCount, markAsRead, markAllAsRead } from '@/lib/api/notifications';

export function useNotifications(userId: string | undefined) {
  const queryClient = useQueryClient();

  // 1. 안 읽은 공지 개수 조회
  const unreadCountQuery = useQuery({
    queryKey: ['unreadAnnouncementsCount', userId],
    queryFn: () => fetchUnreadAnnouncementsCount(userId!),
    enabled: !!userId,
    refetchInterval: 1000 * 60 * 5, // 5분마다 갱신
  });

  // 2. 전체 공지 목록 (읽음 상태 포함) 조회
  const announcementsQuery = useQuery({
    queryKey: ['announcementsWithReadStatus', userId],
    queryFn: () => fetchAnnouncementsWithReadStatus(userId!),
    enabled: !!userId,
  });

  // 3. 읽음 처리 Mutation
  const readMutation = useMutation({
    mutationFn: (announcementId: string) => markAsRead(userId!, announcementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unreadAnnouncementsCount', userId] });
      queryClient.invalidateQueries({ queryKey: ['announcementsWithReadStatus', userId] });
    },
  });

  // 4. 전체 읽음 처리 Mutation
  const readAllMutation = useMutation({
    mutationFn: (unreadIds: string[]) => markAllAsRead(userId!, unreadIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unreadAnnouncementsCount', userId] });
      queryClient.invalidateQueries({ queryKey: ['announcementsWithReadStatus', userId] });
    },
  });

  return {
    unreadCount: unreadCountQuery.data ?? 0,
    announcements: announcementsQuery.data ?? [],
    isLoading: unreadCountQuery.isLoading || announcementsQuery.isLoading,
    markAsRead: readMutation.mutate,
    markAllAsRead: readAllMutation.mutate,
  };
}
