import { unwrapList } from '@/lib/list'
import type { ProcessEventVerifyResult, PurchaseRequest, PurchaseTrailEvent } from '@/lib/types'
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

export async function verifyProcessEvent(content_hash: string, signature: string) {
  const { data } = await api.post<ProcessEventVerifyResult>('/api/orgs/process-events/verify/', {
    content_hash,
    signature,
  })
  return data
}

export async function submitPurchaseRequest(slug: string) {
  const { data } = await api.post<PurchaseRequest>(`/api/orgs/purchase-requests/${slug}/submit/`)
  return data
}