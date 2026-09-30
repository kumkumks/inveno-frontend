import api from './api';
import { clearAccessToken, setAccessToken } from '@/lib/auth';
import type { AccessTokenResponse, MeResponse } from '@/lib/types';
export type { MeResponse };

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

export async function setPassword(payload: {
  uid: string
  token: string
  new_password: string
  new_password2: string
}) {
  const { data } = await api.post('/api/auth/password/set/', payload)
  return data
}

export async function logout() {
  try {
    await api.post('/api/auth/logout/');
  } finally {
    clearAccessToken();
  }
}
