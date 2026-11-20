import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: analyticsApi.getDashboard,
    staleTime: 30_000,
  });
}
