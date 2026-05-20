import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../stores/auth';

const baseURL = import.meta.env.VITE_API_URL || '/';
export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401) {
      const path = window.location.pathname;
      if (path.startsWith('/admin')) {
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(error);
  },
);

export function apiErrorMessage(err: unknown): string {
  const e = err as AxiosError<{ message?: string }>;
  return e?.response?.data?.message || e?.message || 'Terjadi kesalahan';
}
