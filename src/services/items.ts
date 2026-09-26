import { formatApiError } from '@/lib/errors'
import { toNamedOptions, unwrapList } from '@/lib/list'
import type { AddItemPayload, Item, ItemDetail, NamedOption } from '@/lib/types'
import type { Dispatch, SetStateAction } from 'react'
import api from './api'

function namedOptionFromResponse(data: unknown, name: string): NamedOption {
  return toNamedOptions(Array.isArray(data) ? data : [data])[0] ?? { slug: name, name }
}

export function appendUniqueOption(list: NamedOption[], created: NamedOption) {
  if (list.some((item) => item.slug === created.slug)) return list
  return [...list, created]
}

export async function listItems() {
  const { data } = await api.get('/api/orgs/items/')
  return unwrapList<Item>(data)
}

export async function getItem(slug: string) {
  const { data } = await api.get<ItemDetail>(`/api/orgs/items/${slug}/`)
  return data
}

export async function createItem(payload: AddItemPayload) {
  const { data } = await api.post('/api/orgs/items/', payload)
  return data
}

export async function listCategories() {
  const { data } = await api.get('/api/orgs/item-categories/')
  return toNamedOptions(data)
}

export async function createCategory(name: string) {
  const { data } = await api.post('/api/orgs/item-categories/', { name })
  return namedOptionFromResponse(data, name)
}

export async function listWarehouses() {
  const { data } = await api.get('/api/orgs/warehouses/')
  return toNamedOptions(data)
}

export async function createWarehouse(name: string) {
  const { data } = await api.post('/api/orgs/warehouses/', { name })
  return namedOptionFromResponse(data, name)
}

export async function createNamedEntity({
  name,
  emptyMessage,
  create,
  setOptions,
  onSelect,
  setError,
  setSaving,
  reset,
}: {
  name: string
  emptyMessage: string
  create: (name: string) => Promise<NamedOption>
  setOptions: Dispatch<SetStateAction<NamedOption[] | undefined>>
  onSelect: (slug: string) => void
  setError: (message: string) => void
  setSaving: (saving: boolean) => void
  reset: () => void
}) {
  const trimmed = name.trim()
  if (!trimmed) {
    setError(emptyMessage)
    return
  }

  setSaving(true)
  setError('')
  try {
    const created = await create(trimmed)
    setOptions((current) => appendUniqueOption(current ?? [], created))
    onSelect(created.slug)
    reset()
  } catch (error) {
    setError(formatApiError(error))
  } finally {
    setSaving(false)
  }
}
