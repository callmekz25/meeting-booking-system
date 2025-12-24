import api, { type ApiResponse } from '@/lib/axios';
import type { RoomFormType, RoomType } from '../types/room';

export type PaginationResponse<T> = {
  page: number;
  pageSize: number;
  total: number;
  items: T;
};

export const getRooms = async (startTime?: string, endTime?: string) => {
  const { data } = await api.get<ApiResponse<RoomType[]>>('/rooms', {
    params: {
      startTime,
      endTime,
    },
  });
  return data;
};

export const getAllRooms = async () => {
  const { data } = await api.get<ApiResponse<RoomType[]>>('/rooms/all');
  return data;
};

export const getRoomsQuery = async (page: number = 1, name?: string) => {
  const params: Record<string, any> = {
    page: page ?? 1,
  };

  if (name && name.trim() !== '') {
    params.name = name;
  }
  const { data } = await api.get<ApiResponse<PaginationResponse<RoomType[]>>>('/rooms/pagination', {
    params,
  });
  return data;
};

export const createRoom = async (payload: RoomFormType) => {
  const { data } = await api.post('/rooms', payload);
  return data;
};

export const updateRoom = async (payload: RoomFormType) => {
  const { data } = await api.put(`/rooms/${payload.roomID}`, payload);
  return data;
};
