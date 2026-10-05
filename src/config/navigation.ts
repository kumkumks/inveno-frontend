import { ClipboardList, Home, MapPin, Package, Users, Warehouse, type LucideIcon } from 'lucide-react'

export type SidebarMenu = {
  key: string
  label: string
  icon: LucideIcon
  href: string
}

export const sidebarMenus: SidebarMenu[] = [
  {
    key: 'home',
    label: 'Home',
    icon: Home,
    href: '/dashboard',
  },
  {
    key: 'items',
    label: 'Items',
    icon: Package,
    href: '/items-list',
  },
  {
    key: 'purchases',
    label: 'Purchases',
    icon: ClipboardList,
    href: '/purchase-requests',
  },
  {
    key: 'warehouses',
    label: 'Warehouses',
    icon: Warehouse,
    href: '/warehouses',
  },
  {
    key: 'space',
    label: 'Space',
    icon: MapPin,
    href: '/space',
  },
  {
    key: 'people',
    label: 'People',
    icon: Users,
    href: '/people',
  },
]
