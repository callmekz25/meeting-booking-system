import { useMutation, useQuery } from '@tanstack/react-query';
import {
  getInventories,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
  getInventoryStatics,
  getInventoriesBySearch,
  uploadImportFile,
} from '../api/inventory.api';
import type { InventoryFormType } from '../types/inventory';

export const useUploadImportFile = () => {
  return useMutation({
    mutationFn: (file: File) => uploadImportFile(file),
  });
};

export const useGetInventoriesBySearch = (search?: string) => {
  return useQuery({
    queryKey: ['inventories-query', { search }],
    queryFn: () => getInventoriesBySearch(search),
  });
};

export const useGetInventoryStatics = () => {
  return useQuery({
    queryKey: ['inventory-statics'],
    queryFn: getInventoryStatics,
  });
};

export const useGetInventories = ({
  page,
  searchQuery,
  typeFilter,
  statusFilter,
}: {
  page: number;
  searchQuery: string;
  typeFilter: string;
  statusFilter: string;
}) => {
  return useQuery({
    queryKey: ['inventories', { page, searchQuery, typeFilter, statusFilter }],
    queryFn: () =>
      getInventories({
        page,
        search: searchQuery,
        type: typeFilter,
        status: statusFilter,
      }),
  });
};

export const useGetInventoryById = (id: number) => {
  return useQuery({
    queryKey: ['inventory', id],
    queryFn: () => getInventoryById(id),
    enabled: !!id,
  });
};

export const useCreateInventory = () => {
  return useMutation({
    mutationFn: (payload: InventoryFormType) => createInventory(payload),
  });
};

export const useUpdateInventory = () => {
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: InventoryFormType }) =>
      updateInventory(id, payload),
  });
};

export const useDeleteInventory = () => {
  return useMutation({
    mutationFn: (id: number) => deleteInventory(id),
  });
};
