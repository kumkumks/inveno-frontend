import React from 'react'
import Logo from '../../assets/logo.svg'
import profile from '../../assets/login-img.svg'
import { Menu } from 'lucide-react'

interface NavbarProps {
  onMenuClick?: () => void
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  return (
    <div className='flex justify-between items-center px-4 sm:px-6 py-4 bg-white border-b border-gray-200 w-full relative'>
        <div className='flex items-center gap-3'>
          {/* Mobile Menu Button */}
          <button 
            onClick={onMenuClick}
            className='lg:hidden p-2 hover:bg-gray-100 rounded-md transition-colors flex items-center justify-center'
            aria-label="Toggle menu"
          >
            <Menu className='h-5 w-5 text-gray-600' />
          </button>
          <img src={Logo} alt="Inveno" className='w-17' />
        </div>
        <div className='flex items-center'>
          <div className='flex items-center justify-center w-9 h-9 rounded-full overflow-hidden border border-gray-200 shadow-sm'>
            <img src={profile} alt="profile" className='w-full h-full object-cover' />
          </div>
        </div>
    </div>
  )
}

export default Navbar