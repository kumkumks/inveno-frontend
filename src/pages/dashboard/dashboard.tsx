import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { statsData, recentlyAddedData, alertdata } from '../../jsondata/json'
import { iconMap } from '../../jsondata/icon'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, ArrowRight } from 'lucide-react'


const Dashboard = () => {
  const { hash } = useLocation()

  // Scroll to the section matching the URL hash (react-router's Link doesn't
  // do this automatically since it only performs client-side navigation).
  useEffect(() => {
    if (!hash) return

    const id = hash.replace('#', '')
    const el = document.getElementById(id)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash])

  return (
    <div className='flex flex-col bg-white w-full text-black px-4 sm:px-7 py-4 sm:py-6'>
      {/* Header Section */}
      <section id="stats">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-start gap-4 mb-8 pb-6 border-b border-gray-200">
        {/* Welcome Message */}
        <div>
          <h1 className='h2 font-normal text-black'>Welcome back, Admin</h1>
        </div>

        {/* Institution Info */}
        <div className='flex flex-col items-start md:items-end gap-1'>
          <h3 className='text-sm font-medium text-black paragraph-mini'>SFS GROUP OF INSTITUTIONS</h3>
          <div className='flex flex-wrap items-center gap-3 text-xs text-gray-600'>
            <div className='flex items-center gap-1 paragraph-small'>
              <MapPin size={14} className='text-gray-500' />
              <span>Hebsagadi, Bangalore</span>
            </div>
            <div className='flex items-center gap-1 paragraph-small'>
              <Calendar size={14} className='text-gray-500' />
              <span>Since Mar 2025</span>
            </div>
          </div>
        </div>
      </div>
    
        {/* Stats Cards Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pb-6 border-b border-gray-200">
          {
            statsData.map((item) => (
              <div key={item.id} className='flex min-w-0 flex-col'>
                <div className=' text-center font-medium text-black mb-1 h3'>{item.value}</div>
                <div className=' text-gray-600 text-center paragraph break-words'>{item.description}</div>
              </div>
            ))
          }
        </div>
      </section>

      {/* Recently Added Section */}
      <section id="recently-added">
        <div className="mt-8">
          {/* Section Header */}
          <div className="flex justify-between items-center mb-6">
            <h4 className='text-base sm:text-lg font-medium text-black h4'>Recently added</h4>
            <button className='flex items-center gap-1 paragraph-small font-medium text-black hover:underline'>
              View all
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {
              recentlyAddedData.map((item) => (
                <Card key={item.id} className="relative w-full min-w-0 pt-0 bg-white border border-gray-200 rounded-lg text-black">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="relative z-20 aspect-video w-full object-cover"
                  />
                  <CardHeader>
                    <CardTitle className='h4 font-medium text-black'>{item.title}</CardTitle>
                  </CardHeader>
                  <CardFooter>
                    <Button className="w-full bg-black text-white hover:bg-black/80">View Event</Button>
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
            <button className='flex items-center gap-1 paragraph-small font-medium text-black hover:underline'>
              View all
              <ArrowRight size={16} />
            </button>
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
    </div>
  )
}

export default Dashboard