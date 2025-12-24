import type { ApiResponse } from '@/lib/axios';
import api from '@/lib/axios';
import type { LoginFormType } from '../types/login';
import type { ForgotPasswordType } from '../types/forgotPassword';
import { useMutation } from '@tanstack/react-query';
import type { ChangePasswordFormType } from '@/modules/user/types/user';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: boolean;
}

export interface ValidateTokenPayload {
  token: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export const login = async (payload: LoginFormType): Promise<ApiResponse<LoginResponse>> => {
  const { data } = await api.post<ApiResponse<LoginResponse>>('/auth/login', payload);
  return data;
};

export const logout = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  const { data } = await api.post('/auth/logout', {
    token: refreshToken,
  });
  return data;
};
export const useLogout = () => {
  return useMutation({
    mutationFn: logout,
  });
};

export const forgotPassword = async (
  payload: ForgotPasswordType,
): Promise<ApiResponse<ForgotPasswordResponse>> => {
  const correctedPayload = { EmailOrUsername: payload.email };
  const { data } = await api.post<ApiResponse<ForgotPasswordResponse>>(
    '/auth/forgot-password',
    correctedPayload,
  );
  return data;
};

export const validatePasswordResetToken = async (
  payload: ValidateTokenPayload,
): Promise<ApiResponse<any>> => {
  const { data } = await api.post<ApiResponse<any>>('/auth/validate-password-reset-token', payload);
  return data;
};

export const resetPassword = async (payload: ResetPasswordPayload): Promise<ApiResponse<any>> => {
  const { data } = await api.post<ApiResponse<any>>('/auth/reset-password', payload);
  return data;
};

export const changePassword = async (payload: ChangePasswordFormType) => {
  const { data } = await api.post('auth/change-password', payload);
  return data;
};
