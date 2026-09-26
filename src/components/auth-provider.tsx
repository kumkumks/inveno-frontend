import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getMe, login as apiLogin, logout as apiLogout, silentRefresh } from '@/services/auth';
import { clearAccessToken, getAccessToken } from '@/lib/auth';
import type { MeResponse, UserType } from '@/lib/types';

interface AuthContextValue {
  me: MeResponse | null;
  user: MeResponse | null;
  isLoading: boolean;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<MeResponse>;
  login: (email: string, password: string) => Promise<MeResponse>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
   hasRole: (roles: UserType | UserType[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [ready, setReady] = useState(false);

  const refreshMe = useCallback(async () => {
    const profile = await getMe();
    setMe(profile);
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        if (!getAccessToken()) await silentRefresh();
        await refreshMe();
      } catch {
        clearAccessToken();
        setMe(null);
      } finally {
        setReady(true);
      }
    })();
  }, [refreshMe]);

  const login = useCallback(
    async (email: string, password: string) => {
      const profile = await apiLogin(email, password);
      setMe(profile);
      return profile;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      setMe(null);
    }
  }, []);

  const hasRole = useCallback(
    (roles: UserType | UserType[]) => {
      const role = me?.profile?.user_type;
      if (!role) return false;
      return (Array.isArray(roles) ? roles : [roles]).includes(role);
    },
    [me],
  );

  const value = useMemo(
    () => ({
      me,
      user: me,
      isLoading: !ready,
      ready,
      signIn: login,
      login,
      signOut: logout,
      logout,
      refreshMe,
      hasRole,
    }),
    [me, ready, login, logout, refreshMe, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
