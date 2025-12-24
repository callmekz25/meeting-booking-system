import { useQuery } from '@tanstack/react-query';
import { getDashboardStatics } from '../api/dashboard.api';

export const useGetDashboardStatics = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardStatics,
  });
};
