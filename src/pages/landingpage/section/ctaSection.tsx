import React from 'react'

const CtaSection = () => {
  return (
     <section className='w-full bg-neutral-50 px-5 py-16 sm:px-8 md:py-24 lg:py-32'>
        <div className='mx-auto max-w-4xl text-center'>
          <h2 className='text-[clamp(1.75rem,0.9rem+2.8vw,2.75rem)] font-semibold leading-tight tracking-tight text-neutral-900'>
            Manage inventory. Stay organized.
          </h2>
          <p className='mt-4 text-[clamp(0.9375rem,0.8rem+0.5vw,1.125rem)] leading-relaxed text-neutral-600 sm:mt-5'>
            A simple way to track your stock, purchases, vendors, and locations — all in one place.
          </p>
        </div>
      </section>
  )
}

export default CtaSection