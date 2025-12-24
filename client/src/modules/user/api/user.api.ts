import api, { type ApiResponse } from '@/lib/axios';
import type { User, UserFormType } from '../types/user';
import type { PaginationResponse } from '@/modules/room/api/room.api';

export const getMe = async () => {
  const { data } = await api.get<ApiResponse<User>>('/users/me');
  return data;
};

export const getUsersByEmail = async (email: string, startTime?: string, endTime?: string) => {
  const { data } = await api.get<ApiResponse<User[]>>('/users', {
    params: {
      email,
      startTime,
      endTime,
    },
  });
  return data;
};

export const getUsers = async (page: number = 1, email?: string) => {
  const params: Record<string, any> = {
    page: page ?? 1,
  };

  if (email && email.trim() !== '') {
    params.email = email;
  }
  const { data } = await api.get<ApiResponse<PaginationResponse<User[]>>>('/users/all', {
    params,
  });
  return data;
};

export const getRoles = async () => {
  const { data } = await api.get<
    ApiResponse<
      {
        id: string;
        name: string;
      }[]
    >
  >('/users/roles');
  return data;
};

export const createUser = async (payload: UserFormType) => {
  const { data } = await api.post('/auth/register', payload);
  return data;
};

export const updateUser = async (payload: UserFormType) => {
  const { data } = await api.put<ApiResponse<User>>(`/users/${payload.userID}`, payload);
  return data;
};
