import api, { type ApiResponse } from '@/lib/axios';
import type { DashboardType } from '../types/dashboard';

export const getDashboardStatics = async () => {
  const { data } = await api.get<ApiResponse<DashboardType>>('/dashboard');
  return data;
};
