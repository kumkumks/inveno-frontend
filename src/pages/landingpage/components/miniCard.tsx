import React from 'react'

interface MiniCardProps {
    feature: {
        icon: React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }>
        title: string
        description: string
    }
}

const MiniCard = ({ feature }: MiniCardProps) => {
    return (
        <div
            className="rounded-xl border border-neutral-200 w-100 bg-white p-6 transition-shadow hover:shadow-md sm:p-7"
        >
            <div className='flex items-center gap-4'>
                <div className='bg-gray-100 rounded-2xl p-5'>
                    {feature?.icon && <feature.icon className='text-gray-500' size={25} strokeWidth={2} />}
                </div>
                <div>
                    <h3 className='text-lg font-medium text-gray-900'>{feature.title}</h3>
                    <p className='text-sm text-gray-500'>{feature.description}</p>
                </div>
            </div>
        </div>
    )
}


export default MiniCard
