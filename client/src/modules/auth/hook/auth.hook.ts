import { useMutation } from '@tanstack/react-query';
import type { LoginFormType } from '../types/login';
import { changePassword, login, type LoginResponse } from '../api/auth.api';
import type { ChangePasswordFormType } from '@/modules/user/types/user';

export const useLogin = () => {
  return useMutation({
    mutationFn: (payload: LoginFormType) => login(payload),
    onSuccess: (data) => {
      console.log('Login successful!', data);
    },
    onError: (error) => {
      console.error('Login failed:', error);
      console.log('Error details:', error.message);
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (payload: ChangePasswordFormType) => changePassword(payload),
  });
};
