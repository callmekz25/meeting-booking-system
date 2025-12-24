import api, { type ApiResponse } from '@/lib/axios';
import type { EquipmentType } from '@/modules/inventory/types/inventory';

export const getEquipmentType = async () => {
  const { data } = await api.get<ApiResponse<EquipmentType[]>>('/equipment-type');
  return data;
};
