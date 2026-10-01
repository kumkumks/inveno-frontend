import { useAuthenticatedImage } from '@/hooks/use-authenticated-image'
import { cn } from '@/lib/utils'

export function AuthImage({
  url,
  alt,
  className,
}: {
  url: string
  alt: string
  className?: string
}) {
  const src = useAuthenticatedImage(url)

  if (!src) {
    return <div className={cn('bg-[#ececec]', className)} aria-hidden />
  }

  return <img src={src} alt={alt} className={className} />
}
