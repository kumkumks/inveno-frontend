import api from './api';
import { clearAccessToken, setAccessToken } from '@/lib/auth';
import type { AccessTokenResponse, MeResponse, UserType } from '@/lib/types';

export type { MeResponse, UserType };
export type UserRole = UserType;

export async function login(email: string, password: string) {
  const { data } = await api.post<AccessTokenResponse>('/api/auth/login/', {
    email,
    password,
  });
  setAccessToken(data.access);
  return getMe();
}

export async function silentRefresh() {
  const { data } = await api.post<AccessTokenResponse>('/api/auth/token/refresh/', {});
  setAccessToken(data.access);
  return data;
}

export async function getMe() {
  const { data } = await api.get<MeResponse>('/api/auth/me/');
  return data;
}

export async function logout() {
  try {
    await api.post('/api/auth/logout/');
  } finally {
    clearAccessToken();
  }
}
