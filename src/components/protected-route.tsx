import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './auth-provider';
import type { UserType } from '@/lib/types';
import { FullScreenStatus } from '@/components/common/full-screen-status';

const ORG_ROLES: UserType[] = [
  'central_admin',
  'operation_incharge',
  'warehouse_manager',
  'space_incharge',
];

export function ProtectedRoute({
  roles,
  orgOnly = false,
  requireSpace = false,
}: {
  roles?: UserType[];
  orgOnly?: boolean;
  requireSpace?: boolean;
}) {
  const { me, ready, hasRole } = useAuth();
  const location = useLocation();

  if (!ready) {
    return <FullScreenStatus>Loading…</FullScreenStatus>;
  }

  if (!me) return <Navigate to="/login" replace state={{ from: location }} />;

  if (roles && !hasRole(roles)) return <Navigate to="/error" replace />;

  if (orgOnly) {
    const role = me.profile?.user_type;
    if (!role || !ORG_ROLES.includes(role)) {
      return <Navigate to="/" replace />;
    }
    if (!me.org?.is_active) {
      return (
        <p className="flex min-h-screen items-center justify-center p-6 text-center">
          Your organisation has been suspended.
        </p>
      );
    }
  }

  // if (centralAdminOnly && role !== 'central_admin') {
  //   return <Navigate to="/" replace />;
  // }

  if (requireSpace && !me.profile?.space) {
    return (
      <FullScreenStatus>
        No space assigned yet. Contact your central admin.
      </FullScreenStatus>
    );
  }

  return <Outlet />;
}
