import React from 'react'
import Logo from '../../assets/logo.png'
import profile from '../../assets/login-img.svg'
import { LogOut, Menu, UserRound } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface NavbarProps {
  onMenuClick?: () => void
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { logout, me } = useAuth()
  const displayName = me?.profile?.full_name?.trim() || me?.email || 'Account'

  return (
    <div className='flex justify-between items-center px-4 sm:px-6 py-4 bg-[#fafafa] border-b border-gray-200 w-full relative'>
        <div className='flex items-center gap-3'>
          {/* Mobile Menu Button */}
          <button 
            onClick={onMenuClick}
            className='md:hidden p-2 hover:bg-gray-100 rounded-md transition-colors flex items-center justify-center'
            aria-label="Toggle menu"
          >
            <Menu className='h-5 w-5 text-gray-600' />
          </button>
          <img src={Logo} alt="Inveno" className='h-3.5 w-auto sm:h-4 md:h-4.5' />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className='flex items-center justify-center w-9 h-9 rounded-full overflow-hidden border border-gray-200 shadow-sm outline-none'>
            <img src={profile} alt="profile" className='w-full h-full object-cover' />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={10}
            className='w-60 min-w-60 rounded-2xl bg-white p-0 text-gray-900 shadow-[0_8px_30px_rgba(15,23,42,0.10)] ring-black/5 [--accent:oklch(0.97_0_0)] [--accent-foreground:oklch(0.205_0_0)] [--popover:oklch(1_0_0)]'
          >
            <div className='flex items-center gap-3 px-3.5 py-3'>
              <div className='relative shrink-0'>
                <img
                  src={profile}
                  alt=""
                  className='size-10 rounded-full object-cover'
                />
                <span className='absolute right-0 bottom-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white' />
              </div>
              <div className='min-w-0'>
                <p className='truncate text-sm font-semibold leading-5 text-gray-900'>{displayName}</p>
                <p className='text-xs leading-4 text-gray-500'>Online</p>
              </div>
            </div>
            <DropdownMenuSeparator className='mx-0 my-0 bg-gray-200' />
            <div className='p-1.5'>
              <DropdownMenuItem
                className='gap-2.5 rounded-lg px-2.5 py-2 text-sm font-normal text-gray-800 focus:bg-gray-100 focus:text-gray-900'
              >
                <UserRound className='size-4 text-gray-500' />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                className='gap-2.5 rounded-lg px-2.5 py-2 text-sm font-normal text-gray-800 focus:bg-gray-100 focus:text-gray-900'
                onClick={() => void logout()}
              >
                <LogOut className='size-4 text-gray-500' />
                Log out
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
    </div>
  )
}

export default Navbar
