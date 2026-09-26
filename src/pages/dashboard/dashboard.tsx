import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { statsData, recentlyAddedData, alertdata } from '../../jsondata/json'
import { iconMap } from '../../jsondata/icon'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, ArrowRight } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import Statscard, { type StatsData } from '@/components/common/statscard'
import { PageShell } from '@/components/common/page-shell'

const Dashboard = () => {
  const { hash } = useLocation()
  const { me } = useAuth()
  const registered_on = new Date(me?.org?.registered_on || '');
  const registered_on_formatted = registered_on.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Scroll to the section matching the URL hash (react-router's Link doesn't
  // do this automatically since it only performs client-side navigation).
  useEffect(() => {
    if (!hash) return

    const id = hash.replace('#', '')
    const el = document.getElementById(id)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash])

  return (
    <PageShell className='max-w-full overflow-x-hidden'>
      {/* Header Section */}
      <section id="stats" className='w-full min-w-0'>
      <div className="mb-6 flex flex-col items-start justify-between gap-3 border-b border-gray-400 pb-6 sm:mb-8 sm:gap-4 md:flex-row md:items-start">
        {/* Welcome Message */}
        <div className='min-w-0'>
          <h1 className='h2 text-xl font-normal break-words text-black sm:text-2xl md:text-3xl'>Welcome back, {me?.profile?.full_name}</h1>
        </div>

        {/* Institution Info */}
        <div className='flex min-w-0 flex-col items-start gap-1 md:items-end'>
          <h3 className='paragraph-mini text-xs font-medium break-words text-black sm:text-sm'>{me?.org?.name}</h3>
          <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600'>
            <div className='flex items-center gap-1 paragraph-small'>
              <MapPin size={14} className='shrink-0 text-gray-500' />
              <span>{me?.org?.location}</span>
            </div>
            <div className='flex items-center gap-1 paragraph-small'>
              <Calendar size={14} className='shrink-0 text-gray-500' />
              <span>Since {registered_on_formatted}</span>
            </div>
          </div>
        </div>
      </div>
    
        {/* Stats Cards Section */}
        <Statscard data={statsData as unknown as StatsData[]} />
      </section>

      {/* Recently Added Section */}
      <section id="recently-added">
        <div className="mt-8">
          {/* Section Header */}
          <div className="flex justify-between items-center mb-6">
            <h4 className='text-base sm:text-lg font-medium text-black h4'>Recently added</h4>
            <Button variant="link" size="sm" className='flex items-center gap-1 paragraph-small font-medium text-black hover:underline'>
              <span>View all</span>
              <ArrowRight className='w-4 h-4' />
            </Button>
          </div>

          {/* Product Cards — horizontal snap scroll */}
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 [&::-webkit-scrollbar]:hidden">
            {
              recentlyAddedData.map((item) => (
                <Card key={item.id} className="relative w-[75%] sm:w-[45%] lg:w-[30%] shrink-0 snap-start pt-0 bg-white border border-gray-200 rounded-lg text-black">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="relative z-20 aspect-video w-full object-cover"
                  />
                  <CardHeader>
                    <CardTitle className='h4 font-medium text-black'>{item.title}</CardTitle>
                  </CardHeader>
                  <CardFooter className='bg-white'>
                    <Button variant="dark" className='w-full'>View Event</Button>
                  </CardFooter>
                </Card>
              ))
            }
          </div>
        </div>
      </section>

      {/* Recent Activities Section */}
      <section id="recent-activities">
        <div className="mt-8 mb-6">
          {/* Section Header */}
          <div className="flex justify-between items-center mb-6">
            <h4 className='text-base sm:text-lg font-medium h4 text-black'>Recent activities</h4>
            <Button variant="link" size="sm" className='flex items-center gap-1 paragraph-small font-medium text-black hover:underline'>
              <span>View all</span> <ArrowRight className='w-4 h-4' />
            </Button>
          </div>

          {/* Activities List */}
          <div className="flex flex-col gap-3">
            {/* Activity Item 1 */}
            {
              alertdata.map((item) => {
                const Icon = iconMap[item.icon]
                return (
                  <Alert key={item.id} variant="destructive" className='p-4 bg-white text-black border border-gray-200 rounded-lg'>
                    {Icon && <Icon className='h-4 w-4 text-gray-500' />}
                    <AlertTitle className='text-black font-bold'>{item.title}</AlertTitle>
                    <AlertDescription className='!text-gray-500 font-medium paragraph-small'>{item.description}</AlertDescription>
                  </Alert>
                )
              })
            }

          </div>
        </div>
      </section>
    </PageShell>
  )
}

export default Dashboard