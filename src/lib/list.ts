import type { NamedOption } from '@/lib/types'
import api from '@/services/api'

export function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[]
  if (data && typeof data === 'object' && 'results' in data) {
    const results = (data as { results: unknown }).results
    if (Array.isArray(results)) return results as T[]
  }
  return []
}

export function toNamedOptions(data: unknown): NamedOption[] {
  return unwrapList<unknown>(data).flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const record = item as Record<string, unknown>
    const name = typeof record.name === 'string' ? record.name : ''
    const slug = 
      typeof record.slug === 'string'
        ? record.slug
        : typeof record.id === 'string' || typeof record.id === 'number'
          ? String(record.id)
          : name
    if (!name || !slug) return []
    return [{ slug, name }]
  })
}

export async function listSpaces() {
  const { data } = await api.get('/api/orgs/spaces/')
  return toNamedOptions(data)
}