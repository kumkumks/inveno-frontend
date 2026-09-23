import MiniCard from '../components/miniCard';
import { features } from '../json';

const FeatureSection = () => {
  return (
     <section className="w-full bg-neutral-50 px-5 py-16 sm:px-8 md:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 md:mb-16">
            <h2 className="text-[clamp(1.75rem,0.9rem+2.8vw,2.75rem)] font-semibold leading-tight tracking-tight text-neutral-900">
              Everything You Need to Manage Stock
            </h2>
            <p className="mt-3 text-[clamp(0.9375rem,0.8rem+0.5vw,1.125rem)] leading-relaxed text-neutral-600">
              A simple inventory system designed to make everyday stock management easier.
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4">
            {features.map((feature, index) => (
             <MiniCard key={index} feature={{
              icon: feature.icon,
              title: feature.title,
              description: feature.description
             }} />
            ))}
          </div>
        </div>
      </section>
  )
}

export default FeatureSection