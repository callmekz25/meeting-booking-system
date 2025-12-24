import api, { type ApiResponse } from '@/lib/axios';
import type { InventoryType, InventoryFormType } from '../types/inventory';
import type { PaginationResponse } from '@/modules/room/api/room.api';

export type InventoryStatics = {
  total: number;
  totalAvailable: number;
  totalOutOfService: number;
  totalMaintenance: number;
};

export const uploadImportFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post<ApiResponse>('/upload', formData);
  return data;
};

export const getInventoryStatics = async () => {
  const { data } = await api.get<ApiResponse<InventoryStatics>>('/inventories/statics');
  return data;
};

export const getInventoriesBySearch = async (search?: string) => {
  const { data } = await api.get<ApiResponse<InventoryType[]>>('/inventories/query', {
    params: { search },
  });
  return data;
};

export const getInventories = async ({
  page,
  search,
  type,
  status,
}: {
  page: number;
  search?: string;
  type?: string;
  status?: string;
}) => {
  const { data } = await api.get<ApiResponse<PaginationResponse<InventoryType[]>>>('/inventories', {
    params: {
      page,
      search,
      typeName: type !== 'all' ? type : undefined,
      status: status !== 'all' ? status : undefined,
    },
  });
  return data;
};

export const getInventoryById = async (id: number) => {
  const { data } = await api.get<ApiResponse<InventoryType>>(`/inventories/${id}`);
  return data;
};

export const createInventory = async (payload: InventoryFormType) => {
  const { data } = await api.post<ApiResponse<InventoryType>>('/inventories', payload);
  return data;
};

export const updateInventory = async (id: number, payload: InventoryFormType) => {
  const { data } = await api.put<ApiResponse<InventoryType>>(`/inventories/${id}`, payload);
  return data;
};

export const deleteInventory = async (id: number) => {
  const { data } = await api.delete<ApiResponse<void>>(`/inventories/${id}`);
  return data;
};
