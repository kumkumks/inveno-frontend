import { cn } from '@/lib/utils'

export function InlineStatus({
  loading,
  error,
  loadingLabel,
  className,
}: {
  loading?: boolean
  error?: string
  loadingLabel?: string
  className?: string
}) {
  if (loading) {
    return <p className={cn('text-sm text-gray-500', className)}>{loadingLabel}</p>
  }

  if (error) {
    return <p className={cn('text-sm text-red-500', className)}>{error}</p>
  }

  return null
}
