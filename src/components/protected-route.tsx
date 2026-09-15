import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './auth-provider';
import type { UserRole } from '@/services/auth';

export function ProtectedRoute({ roles }: { roles?: UserRole[] }) {
  const { user, isLoading, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (roles && !hasRole(roles)) return <Navigate to="/error" replace />;

  return <Outlet />;
}