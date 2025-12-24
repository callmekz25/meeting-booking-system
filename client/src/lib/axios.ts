import { toast } from 'sonner';
import { API_URL } from './../core/env';
import axios from 'axios';

export type ApiResponse<T = any> = {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
};

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    const message = response?.data?.message;
    if (message && message !== '') {
      toast.success(message);
    }

    return response;
  },
  async (error) => {
    const original = error.config;

    const message = error?.response?.data?.message ?? error?.response?.message ?? '';

    if (message !== '') {
      toast.error(message);
    }

    if (error.response?.status === 401 && message === 'Invalid or expired token') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken: localStorage.getItem('refreshToken'),
        });
        const newToken = data?.data?.accessToken;

        if (newToken) {
          localStorage.setItem('accessToken', newToken);
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        }
      } catch (refreshErr) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

export default api;
