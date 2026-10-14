import { unwrapList } from '@/lib/list'
import type { Vendor, VendorCreatePayload } from '@/lib/types'
import api from './api'

async function fetchVendors() {
  const { data } = await api.get('/api/orgs/vendors/')
  return unwrapList<Vendor>(data)
}

export async function listVendors() {
  return (await fetchVendors()).filter((vendor) => vendor.is_active !== false)
}

export async function listAllVendors() {
  return fetchVendors()
}

export async function createVendor(payload: VendorCreatePayload) {
  const { data } = await api.post<Vendor>('/api/orgs/vendors/', payload)
  return data
}

export async function updateVendor(slug: string, payload: VendorCreatePayload) {
  const { data } = await api.patch<Vendor>(`/api/orgs/vendors/${slug}/`, payload)
  return data
}

export async function suspendVendor(slug: string) {
  await api.post(`/api/orgs/vendors/${slug}/suspend/`)
}

export async function unsuspendVendor(slug: string) {
  await api.post(`/api/orgs/vendors/${slug}/unsuspend/`)
}
