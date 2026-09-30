import type { UserType } from '@/lib/types'

const roleLabels: Record<UserType, string> = {
  super_admin: 'Super admin',
  central_admin: 'Central admin',
  operation_incharge: 'Operation incharge',
  warehouse_manager: 'Warehouse manager',
  space_incharge: 'Space incharge',
}

export function displayRole(role?: UserType | null) {
  if (!role) return 'an unknown role'
  return roleLabels[role]
}
