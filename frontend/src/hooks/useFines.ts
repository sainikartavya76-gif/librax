import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { finesApi } from '../api/fines';
import { useToast } from '../components/ui/Toast';

export function useFines(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ['fines', params],
    queryFn: () => finesApi.getFines(params),
    staleTime: 30_000,
  });
}

export function usePayFine() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => finesApi.payFine(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fines'] });
      toast.success('Fine paid successfully');
    },
    onError: (e: any) => toast.error(e.response?.data?.detail || 'Failed to pay fine'),
  });
}
