import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAllWithdrawalFeedback, createAnnouncement, fetchAnnouncements, updateAnnouncement, deleteAnnouncement } from '@/lib/api/admin';

export function useAdminFeedback() {
  const query = useQuery({
    queryKey: ['adminWithdrawalFeedback'],
    queryFn: fetchAllWithdrawalFeedback,
  });

  return {
    feedback: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useAnnouncements() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['adminAnnouncements'],
    queryFn: fetchAnnouncements,
  });

  const createMutation = useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAnnouncements'] });
    },
  });

  return {
    announcements: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    createAnnouncement: createMutation.mutateAsync, // mutationFn을 비동기로 사용하도록 mutateAsync 제공
    isCreating: createMutation.isPending,
    updateAnnouncement: useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) => updateAnnouncement(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['adminAnnouncements'] });
      },
    }).mutateAsync,
    deleteAnnouncement: useMutation({
      mutationFn: deleteAnnouncement,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['adminAnnouncements'] });
      },
    }).mutateAsync,
  };
}
