import { useQuery } from '@tanstack/react-query';
import { dsaApi } from '../api/dsa';

export function useDSASearch(q: string, field: string, algorithm: string, enabled: boolean) {
  return useQuery({
    queryKey: ['dsa', 'search', q, field, algorithm],
    queryFn: () => dsaApi.search(q, field, algorithm),
    enabled,
  });
}

export function useDSASort(field: string, algorithm: string, enabled: boolean) {
  return useQuery({
    queryKey: ['dsa', 'sort', field, algorithm],
    queryFn: () => dsaApi.sort(field, algorithm),
    enabled,
  });
}

export function useQueueVisualize() {
  return useQuery({
    queryKey: ['dsa', 'visualize', 'queue'],
    queryFn: () => dsaApi.visualizeQueue(),
  });
}

export function useStackVisualize() {
  return useQuery({
    queryKey: ['dsa', 'visualize', 'stack'],
    queryFn: () => dsaApi.visualizeStack(),
  });
}
