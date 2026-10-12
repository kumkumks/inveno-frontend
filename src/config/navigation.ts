import { ClipboardList, Home, MapPin, Package, Users, Warehouse, type LucideIcon } from 'lucide-react'

export type SidebarChild = {
  key: string
  label: string
  href: string
  match?: (pathname: string) => boolean
}

export type SidebarMenu = {
  key: string
  label: string
  icon: LucideIcon
  href: string
  match?: (pathname: string) => boolean
  children?: SidebarChild[]
}

const isPurchaseListPath = (pathname: string) =>
  pathname === '/purchase-requests' ||
  pathname === '/purchase-add' ||
  (pathname.startsWith('/purchase-requests/') && !pathname.includes('/quotes'))

const isRequestQuotesPath = (pathname: string) =>
  pathname.startsWith('/request-quotes') || pathname.includes('/quotes')

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
    match: (pathname) => isPurchaseListPath(pathname) || isRequestQuotesPath(pathname),
    children: [
      {
        key: 'purchase-requests',
        label: 'Purchase requests',
        href: '/purchase-requests',
        match: isPurchaseListPath,
      },
      {
        key: 'request-quotes',
        label: 'Request quotes',
        href: '/request-quotes',
        match: isRequestQuotesPath,
      },
    ],
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
