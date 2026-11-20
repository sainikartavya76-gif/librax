import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { booksApi } from '../api/books';
import { useToast } from '../components/ui/Toast';

export function useBooks(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ['books', params],
    queryFn: () => booksApi.getBooks(params),
    staleTime: 30_000,
  });
}

export function useBook(id: string) {
  return useQuery({
    queryKey: ['books', id],
    queryFn: () => booksApi.getBook(id),
    enabled: !!id,
  });
}

export function useCreateBook() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: booksApi.createBook,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['books'] });
      toast.success('Book added successfully');
    },
    onError: (e: any) => toast.error(e.response?.data?.detail || 'Failed to add book'),
  });
}

export function useUpdateBook() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => booksApi.updateBook(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['books'] });
      qc.invalidateQueries({ queryKey: ['books', variables.id] });
      toast.success('Book updated successfully');
    },
    onError: (e: any) => toast.error(e.response?.data?.detail || 'Failed to update book'),
  });
}

export function useDeleteBook() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: booksApi.deleteBook,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['books'] });
      toast.success('Book deleted successfully');
    },
    onError: (e: any) => toast.error(e.response?.data?.detail || 'Failed to delete book'),
  });
}
