import { unwrapList } from '@/lib/list'
import type { PurchaseRequest, PurchaseTrailEvent } from '@/lib/types'
import api from './api'

export async function listPurchaseRequests() {
  const { data } = await api.get('/api/orgs/purchase-requests/')
  return unwrapList<PurchaseRequest>(data)
}

export async function getPurchaseRequest(slug: string) {
  const { data } = await api.get<PurchaseRequest>(`/api/orgs/purchase-requests/${slug}/`)
  return data
}

export async function listPurchaseTrail(slug: string) {
  const { data } = await api.get(`/api/orgs/purchase-requests/${slug}/trail/`)
  return unwrapList<PurchaseTrailEvent>(data)
}