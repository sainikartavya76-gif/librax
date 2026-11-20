import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationsApi } from '../api/reservations';
import { useToast } from '../components/ui/Toast';

export function useReservations(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ['reservations', params],
    queryFn: () => reservationsApi.getReservations(params),
    staleTime: 30_000,
  });
}

export function useCreateReservation() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (book_id: string) => reservationsApi.createReservation(book_id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reservations'] });
      toast.success('Reservation created successfully');
    },
    onError: (e: any) => toast.error(e.response?.data?.detail || 'Failed to create reservation'),
  });
}

export function useCancelReservation() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => reservationsApi.cancelReservation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reservations'] });
      toast.success('Reservation cancelled');
    },
    onError: (e: any) => toast.error(e.response?.data?.detail || 'Failed to cancel reservation'),
  });
}

export function useBookQueue(bookId: string) {
  return useQuery({
    queryKey: ['reservations', 'queue', bookId],
    queryFn: () => reservationsApi.getBookQueue(bookId),
    enabled: !!bookId,
  });
}
