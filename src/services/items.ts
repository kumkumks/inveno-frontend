import { formatApiError } from '@/lib/errors'
import { toNamedOptions, unwrapList } from '@/lib/list'
import type { AddItemPayload, Item, ItemDetail, ItemPhoto, NamedOption } from '@/lib/types'
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

export async function uploadItemPhoto(slug: string, file: File) {
  const body = new FormData()
  body.append('image', file)
  const { data } = await api.post<ItemPhoto>(`/api/orgs/items/${slug}/photos/`, body, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  })
  return data
}

export async function fetchItemPhoto(url: string) {
  const { data } = await api.get<Blob>(url, { responseType: 'blob' })
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
