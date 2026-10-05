import { unwrapList } from '@/lib/list'
import type { PurchaseRequest } from '@/lib/types'
import api from './api'

export async function listPurchaseRequests() {
  const { data } = await api.get('/api/orgs/purchase-requests/')
  return unwrapList<PurchaseRequest>(data)
}

export async function getPurchaseRequest(slug: string) {
  const { data } = await api.get<PurchaseRequest>(`/api/orgs/purchase-requests/${slug}/`)
  return data
}