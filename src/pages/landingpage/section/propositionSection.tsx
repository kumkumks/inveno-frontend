import { Button } from '@/components/ui/button';

const PropositionSection = () => {
  return (
     <section className='w-full bg-[linear-gradient(90deg,#090909_0%,#000814_42%,#00104D_100%)] px-5 py-16 sm:px-8 md:py-24 lg:py-32'>
        <div className='mx-auto max-w-7xl'>
          <div className='grid gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16'>
            {/* Left Content */}
            <div className='flex flex-col justify-center'>
              <h2 className='text-[clamp(1.75rem,0.9rem+2.8vw,2.75rem)] font-semibold leading-tight tracking-tight text-white'>
                Built for Simple, Efficient Management
              </h2>
              <div className='mt-4 space-y-2 sm:mt-5'>
                <p className='text-[clamp(0.9375rem,0.8rem+0.5vw,1.125rem)] leading-relaxed text-white/80'>
                  Spend less time managing spreadsheets and paperwork.
                </p>
                <p className='text-[clamp(0.9375rem,0.8rem+0.5vw,1.125rem)] leading-relaxed text-white/80'>
                  Keep your inventory organized and your team on the same page.
                </p>
              </div>
              <p className='mt-6 text-[clamp(0.9375rem,0.8rem+0.5vw,1.125rem)] font-semibold leading-relaxed text-white sm:mt-8'>
                One system. One place. Better inventory management.
              </p>
              <div className='mt-6 sm:mt-8'>
                <Button variant='inverse' size='hero'>
                  Get started
                </Button>
              </div>
            </div>

            {/* Right Placeholder */}
            <div className='flex items-center justify-center'>
              <div className='aspect-4/3 w-full max-w-md rounded-2xl border-4 border-white/20 bg-white/5 backdrop-blur-sm lg:max-w-none' />
            </div>
          </div>
        </div>
      </section>
  )
}

export default PropositionSection