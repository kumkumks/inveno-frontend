import React from 'react'
import Navbar from '../components/common/navbar'
import { 
  Sidebar, 
  SidebarProvider, 
  SidebarContent
} from '../components/ui/sidebar'
import {
  Sheet,
  SheetContent
} from '../components/ui/sheet'
import { Outlet, NavLink } from 'react-router-dom'
import { Home, Package, Warehouse, MapPin, Users } from 'lucide-react'

const sidebarMenus = [
  {
    key: "home",
    label: "Home",
    icon: Home,
    href: "/dashboard",
  },

  {
    key: "items",
    label: "Items",
    icon: Package,
    href: "/items-list",
  },

  {
    key: "warehouses",
    label: "Warehouses",
    icon: Warehouse,
    href: "/warehouses",
  },
  {
    key: "space",
    label: "Space",
    icon: MapPin,
    href: "/space",
  },
  {
    key: "people",
    label: "People",
    icon: Users,
    href: "/people",
  },
];

// Custom styles for the sheet to not overlap navbar and scrollbar styling
const sheetOverlayStyles = `
  [data-slot="sheet-overlay"] {
    top: 65px !important;
    height: calc(100vh - 65px) !important;
  }
  
  /* Custom scrollbar styling for sidebar */
  .sidebar-scroll::-webkit-scrollbar {
    width: 6px;
  }
  
  .sidebar-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .sidebar-scroll::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
  }
  
  .sidebar-scroll::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
`

const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  // Sidebar Content Component (reusable for both desktop and mobile)
  const SidebarMenuContent = () => (
    <div className='bg-[#fafafa] h-full overflow-y-auto sidebar-scroll'>
      <div className='bg-[#fafafa] pt-4 pb-6'>
        <div className='text-[10px] font-medium text-gray-400 px-6 py-2 bg-[#fafafa] uppercase tracking-wider'>
          Platform
        </div>
        <div className='px-3 space-y-0.5'>
        {
          sidebarMenus.map((menu)=>(
            <div key={menu.key}>
            {/* Menu button */}
            <NavLink
              to={menu.href}
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <menu.icon className='h-4 w-4 text-gray-400' />
              <span className='font-normal'>{menu.label}</span>
            </NavLink>
          </div>
          ))
        }
        </div>
      </div>
    </div>
  )

  return (
    <div className='flex flex-col h-screen w-full bg-[#fafafa] overflow-hidden'>
      {/* Custom styles for sheet overlay */}
      <style dangerouslySetInnerHTML={{ __html: sheetOverlayStyles }} />
      
      {/* Navbar - Always on top with highest z-index */}
      <div className='sticky top-0 z-[100] w-full bg-[#fafafa]'>
        <Navbar onMenuClick={toggleMobileMenu} />
      </div>
      
      {/* Main Content Area with Sidebar */}
      <SidebarProvider className='flex-1 min-h-0 overflow-hidden'>
        <div className='flex min-h-0 min-w-0 flex-1 relative'>
          {/* Desktop Sidebar - stays visible beside the page content */}
          <aside className='hidden md:flex h-full w-[280px] shrink-0 border-r border-gray-200 bg-[#fafafa]'>
            <Sidebar collapsible="none" className='h-full w-full bg-[#fafafa]'>
              <SidebarContent className='bg-[#fafafa] h-full overflow-hidden flex flex-col w-full'>
                <SidebarMenuContent />
              </SidebarContent>
            </Sidebar>
          </aside>

          {/* Mobile Sidebar Sheet */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetContent side="left" className='w-[280px] p-0 bg-[#fafafa] !top-[65px] !h-[calc(100vh-65px)] overflow-hidden flex flex-col'>
              <SidebarMenuContent />
            </SheetContent>
          </Sheet>
          
          {/* Main Content - Scrollable content area */}
          <div className='h-full min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-white'>
            <Outlet />
          </div>
        </div>
      </SidebarProvider>
    </div>
  )
}

export default DashboardLayout