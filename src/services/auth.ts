import api from './api';

export type UserRole = 'admin' | 'staff' | 'user' | string;

export interface AuthUser {
  id: string | number;
  email: string;   
  role: UserRole;
  name?: string;
}

interface AuthResponse {
  user?: AuthUser;
  id?: string | number;
  email?: string;
  role?: UserRole;
  name?: string;
}

const toUser = (response: AuthResponse): AuthUser => {
  const user = response.user ?? response;

  if (!user.id || !user.email || !user.role) {
    throw new Error('The server returned an invalid authentication response.');
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };
};

export const login = async (email: string, password: string) => {
  const { data } = await api.post<AuthResponse>('/api/auth/login/', {
    email,
    password,
  });

  return toUser(data);
};

export const getCurrentUser = async () => {
  const { data } = await api.get<AuthResponse>('/api/auth/me/');
  return toUser(data);
};

export const logout = async () => {
  await api.post('/api/auth/logout/');
};