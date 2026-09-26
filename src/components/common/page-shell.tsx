import type { ReactNode } from 'react'
import { cn } from 'cn'

export function PageShell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex min-w-0 w-full flex-col px-4 py-4 text-black sm:px-7 sm:py-6', className)}>
      {children}
    </div>
  )
}

export function PageTitle({
  children,
  description,
  action,
  className,
}: {
  children: ReactNode
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-6', action && 'flex items-start justify-between gap-3')}>
      <div>
        <h1 className={cn('text-xl font-normal text-black sm:text-2xl md:text-3xl', className)}>
          {children}
        </h1>
        {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}
