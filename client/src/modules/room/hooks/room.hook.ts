import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createRoom, getAllRooms, getRooms, getRoomsQuery, updateRoom } from '../api/room.api';
import type { RoomFormType } from '../types/room';

export const useGetRooms = (startTime?: string, endTime?: string) => {
  return useQuery({
    queryKey: ['rooms', { endTime, startTime }],
    queryFn: () => getRooms(startTime, endTime),
    enabled: !!startTime && !!endTime,
    staleTime: 0,
    cacheTime: 0,
  });
};
export const useGetAllRooms = () => {
  return useQuery({
    queryKey: ['rooms-all'],
    queryFn: getAllRooms,
  });
};

export const useGetRoomsQuery = (page: number, name?: string) => {
  return useQuery({
    queryKey: [
      'rooms-query',
      {
        page,
        name,
      },
    ],
    queryFn: () => getRoomsQuery(page, name),
  });
};

export const useCreateRoom = () => {
  return useMutation({
    mutationFn: (payload: RoomFormType) => createRoom(payload),
  });
};

export const useUpdateRoom = () => {
  return useMutation({
    mutationFn: (payload: RoomFormType) => updateRoom(payload),
  });
};
