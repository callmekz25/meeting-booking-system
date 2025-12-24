import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createUser,
  getMe,
  getRoles,
  getUsers,
  getUsersByEmail,
  updateUser,
} from '../api/user.api';
import type { UserFormType } from '../types/user';

export const useGetMe = () => {
  const token = localStorage.getItem('accessToken');
  return useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    enabled: !!token,
  });
};

export const useGetUsersByEmail = (email: string, startTime?: string, endTime?: string) => {
  return useQuery({
    queryKey: [
      'users',
      {
        email,
        startTime,
        endTime,
      },
    ],
    queryFn: () => getUsersByEmail(email, startTime, endTime),
    enabled: !!startTime && !!endTime,
    staleTime: 0,
    cacheTime: 0,
  });
};

export const useGetUsers = (page: number, email?: string) => {
  return useQuery({
    queryKey: [
      'users-all',
      {
        page,
        email,
      },
    ],
    queryFn: () => getUsers(page, email),
  });
};

export const useCreateUser = () => {
  return useMutation({
    mutationFn: (payload: UserFormType) => createUser(payload),
  });
};
export const useUpdateUser = () => {
  return useMutation({
    mutationFn: (payload: UserFormType) => updateUser(payload),
  });
};

export const useGetRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
  });
};
