import type { ReactNode } from 'react'
import { cn } from 'cn'

export function FullScreenStatus({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex min-h-screen items-center justify-center text-sm text-gray-600', className)}>
      {children}
    </div>
  )
}
