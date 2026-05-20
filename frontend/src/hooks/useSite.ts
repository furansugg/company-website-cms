import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { SiteSummary } from '../lib/types';

export function useSite() {
  return useQuery({
    queryKey: ['public', 'site'],
    queryFn: async (): Promise<SiteSummary> => (await api.get('/api/public/site')).data,
    staleTime: 60_000,
  });
}
