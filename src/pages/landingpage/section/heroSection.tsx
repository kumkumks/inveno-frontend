import { Button } from '@/components/ui/button';
import Logo from '@/assets/logo (1).svg';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-svh w-full flex-col bg-[linear-gradient(90deg,#090909_0%,#000814_42%,#00104D_100%)]">
            <header className="flex shrink-0 justify-center px-4 pt-6 sm:pt-8 md:pt-10">
                <img
                    src={Logo}
                    alt="Inveno"
                    className="h-3.5 w-auto sm:h-4 md:h-4.5"
                />
            </header>

            <main className="flex flex-1 flex-col items-center justify-center px-5 pb-16 text-center sm:px-8">
                <div className="flex w-full max-w-5xl flex-col items-center">
                    <h1 className="text-[clamp(1.875rem,1.1rem+3.4vw,3.5rem)] font-semibold leading-[1.12] tracking-tight text-white">
                        Manage Your Inventory, Simply.
                    </h1>
                    <p className="mt-3 max-w-[38ch] text-[clamp(0.9375rem,1.4vw+0.55rem,1.25rem)] leading-relaxed text-white/90 sm:mt-4 sm:max-w-xl">
                        Keep track of your items, purchases, stock, and vendors — all in one
                        place.
                    </p>
                    <div className="mt-6 flex w-full max-w-xs flex-col items-stretch gap-3 sm:mt-8 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-4">
                        <Button variant="inverse" size="hero" onClick={() => navigate('/login')}>
                            Get started
                        </Button>
                        <Button variant="outline-inverse" size="hero" onClick={() => navigate('/learnmore')}>
                            Learn more
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default HeroSection