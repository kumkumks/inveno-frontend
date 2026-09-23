

const Footer = () => {
    return (
        <footer className='w-full bg-black px-2 md:px-5 py-4 sm:px-8'>
            <div className='mx-auto max-w-7xl md:max-w-full'>
                <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center sm:gap-6'>
                    {/* Left - Branding */}
                    <div className='text-left'>
                        <h3 className='text-base font-semibold text-white sm:text-lg'>Inveno</h3>
                        <p className='mt-1 text-sm text-white/70'>© 2026 All rights reserved.</p>
                    </div>

                    {/* Right - Quick Links */}
                    <div className='text-left sm:text-right'>
                        <h4 className='mb-2 text-sm font-semibold text-white'>Quick Links</h4>
                        <nav className='flex flex-wrap items-center justify-start gap-x-2 gap-y-1 text-sm text-white/70 sm:justify-end'>
                            <a href='#' className='transition-colors hover:text-white'>Home</a>
                            <span className='text-white/40'>·</span>
                            <a href='#' className='transition-colors hover:text-white'>Features</a>
                            <span className='text-white/40'>·</span>
                            <a href='#' className='transition-colors hover:text-white'>About</a>
                            <span className='text-white/40'>·</span>
                            <a href='#' className='transition-colors hover:text-white'>Contact</a>
                        </nav>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer