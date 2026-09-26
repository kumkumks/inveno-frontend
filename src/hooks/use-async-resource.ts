import { useEffect, useState } from 'react'
import { formatApiError } from '@/lib/errors'

export function useAsyncResource<T>(
  loader: () => Promise<T>,
  deps: readonly unknown[],
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled ?? true
  const [data, setData] = useState<T | undefined>(undefined)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(enabled)

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError('')

    loader()
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((err) => {
        if (!cancelled) setError(formatApiError(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // Callers pass the values the loader closes over.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, setData, error, loading }
}
