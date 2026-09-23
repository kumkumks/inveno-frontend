import { Button } from '@/components/ui/button';

const PropositionSection = () => {
  return (
     <section className='w-full overflow-x-hidden bg-[linear-gradient(90deg,#090909_0%,#000814_42%,#00104D_100%)] px-5 py-12 sm:px-8 sm:py-16 md:px-10 md:py-24 lg:py-32'>
        <div className='mx-auto w-full max-w-7xl'>
          <div className='grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-10 lg:gap-12 xl:gap-16'>
            {/* Left Content */}
            <div className='flex min-w-0 flex-col justify-center'>
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
                <Button variant='inverse' size='hero' className='w-full sm:w-auto'>
                  Get started
                </Button>
              </div>
            </div>

            {/* Right Placeholder */}
            <div className='flex min-h-[12rem] min-w-0 w-full items-stretch sm:min-h-[16rem] md:h-full md:min-h-[20rem] lg:min-h-[24rem]'>
              <div className='aspect-4/3 w-full rounded-2xl border-4 border-white/20 bg-white/5 backdrop-blur-sm md:aspect-auto md:min-h-full' />
            </div>
          </div>
        </div>
      </section>
  )
}

export default PropositionSection