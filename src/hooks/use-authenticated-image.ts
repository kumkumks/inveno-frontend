import { useEffect, useState } from 'react'
import { fetchItemPhoto } from '@/services/items'

const photoUrls = new Map<string, string>()
const pendingPhotos = new Map<string, Promise<string>>()

function loadPhoto(url: string) {
  const cached = photoUrls.get(url)
  if (cached) return Promise.resolve(cached)

  const pending = pendingPhotos.get(url)
  if (pending) return pending

  const request = fetchItemPhoto(url)
    .then((blob) => {
      const objectUrl = URL.createObjectURL(blob)
      photoUrls.set(url, objectUrl)
      pendingPhotos.delete(url)
      return objectUrl
    })
    .catch((error) => {
      pendingPhotos.delete(url)
      throw error
    })

  pendingPhotos.set(url, request)
  return request
}

export function useAuthenticatedImage(url?: string) {
  const [src, setSrc] = useState(() => (url ? photoUrls.get(url) ?? '' : ''))

  useEffect(() => {
    if (!url) {
      setSrc('')
      return
    }

    const cached = photoUrls.get(url)
    if (cached) {
      setSrc(cached)
      return
    }

    let cancelled = false
    loadPhoto(url)
      .then((objectUrl) => {
        if (!cancelled) setSrc(objectUrl)
      })
      .catch(() => {
        if (!cancelled) setSrc('')
      })

    return () => {
      cancelled = true
    }
  }, [url])

  return src
}
