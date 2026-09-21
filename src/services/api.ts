import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/auth';
import type { AccessTokenResponse } from '@/lib/types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const PUBLIC_AUTH_PATHS = [
  '/api/auth/login/',
  '/api/auth/token/refresh/',
  '/api/auth/password/set/',
  '/api/auth/password/reset/',
  '/api/auth/password/reset/confirm/',
];

function isPublicAuthRequest(url?: string) {
  if (!url) return false;
  return PUBLIC_AUTH_PATHS.some((path) => url.includes(path));
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const access = getAccessToken();
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

let refreshing: Promise<string> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;
    const url = original?.url ?? '';

    if (
      status === 401 &&
      original &&
      !original._retry &&
      !isPublicAuthRequest(url)
    ) {
      original._retry = true;

      try {
        if (!refreshing) {
          refreshing = axios
            .post<AccessTokenResponse>(
              `${API_BASE_URL}/api/auth/token/refresh/`,
              {},
              { withCredentials: true },
            )
            .then((response) => {
              setAccessToken(response.data.access);
              return response.data.access;
            })
            .finally(() => {
              refreshing = null;
            });
        }

        const access = await refreshing;
        original.headers.Authorization = `Bearer ${access}`;
        return api(original);
      } catch {
        clearAccessToken();
        if (window.location.pathname !== '/login') {
          window.location.assign('/login');
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
