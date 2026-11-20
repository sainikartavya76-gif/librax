import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi } from '../api/transactions';
import { useToast } from '../components/ui/Toast';

export function useTransactions(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => transactionsApi.getTransactions(params),
    staleTime: 30_000,
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ['transactions', id],
    queryFn: () => transactionsApi.getTransaction(id),
    enabled: !!id,
  });
}

export function useIssueBook() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ book_id, user_id, due_date, notes }: any) => transactionsApi.issueBook({ book_id, user_id, due_date, notes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['books'] });
      toast.success('Book issued successfully');
    },
    onError: (e: any) => toast.error(e.response?.data?.detail || 'Failed to issue book'),
  });
}

export function useReturnBook() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => transactionsApi.returnBook(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['books'] });
      qc.invalidateQueries({ queryKey: ['fines'] });
      toast.success('Book returned successfully');
    },
    onError: (e: any) => toast.error(e.response?.data?.detail || 'Failed to return book'),
  });
}

export function useOverdueTransactions() {
  return useQuery({
    queryKey: ['transactions', 'overdue'],
    queryFn: () => transactionsApi.getTransactions({ status: 'overdue' }),
    staleTime: 30_000,
  });
}
