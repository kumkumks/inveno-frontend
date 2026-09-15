import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getCurrentUser, login, logout, type AuthUser, type UserRole } from '@/services/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = async (email: string, password: string) => {
    const authenticatedUser = await login(email, password);
    setUser(authenticatedUser);
    return authenticatedUser;
  };

  const signOut = async () => {
    try {
      await logout();
    } finally {
      setUser(null);
    }
  };

  const hasRole = (roles: UserRole | UserRole[]) => {
    if (!user) return false;
    return (Array.isArray(roles) ? roles : [roles]).includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}