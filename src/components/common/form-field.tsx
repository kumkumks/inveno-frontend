import type { ReactNode } from 'react'
import { cn } from 'cn'

export function FormField({
  label,
  htmlFor,
  error,
  action,
  children,
  className,
  labelClassName,
}: {
  label: string
  htmlFor?: string
  error?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  labelClassName?: string
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={htmlFor} className={cn('text-sm font-medium', labelClassName)}>
          {label}
        </label>
        {action}
      </div>
      {children}
      {error ? <span className="text-sm text-red-500">{error}</span> : null}
    </div>
  )
}
