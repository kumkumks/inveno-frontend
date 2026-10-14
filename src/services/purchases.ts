import { isAxiosError } from 'axios'
import { unwrapList } from '@/lib/list'
import { downloadBlob, filenameFromDisposition } from '@/lib/download'
import type {
  ProcessEventVerifyResult,
  PurchaseOrder,
  PurchaseRequest,
  PurchaseTrailEvent,
  QuoteRequest,
  RecordQuotePayload,
} from '@/lib/types'
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

export async function approvePurchaseRequest(slug: string) {
  const { data } = await api.post<PurchaseRequest>(`/api/orgs/purchase-requests/${slug}/approve/`)
  return data
}

export async function createQuoteRequest(purchaseRequest: string, vendorSlugs: string[]) {
  const { data } = await api.post<QuoteRequest>('/api/orgs/rfqs/', {
    purchase_request: purchaseRequest,
    vendor_slugs: vendorSlugs,
  })
  return data
}

export async function listQuoteRequests() {
  const { data } = await api.get('/api/orgs/rfqs/')
  return unwrapList<QuoteRequest>(data)
}

export async function getQuoteRequest(slug: string) {
  const { data } = await api.get<QuoteRequest>(`/api/orgs/rfqs/${slug}/`)
  return data
}

export async function getQuoteRequestForPurchase(purchaseSlug: string) {
  const listed = (await listQuoteRequests()).find((item) => item.purchase_request === purchaseSlug)
  try {
    return await getQuoteRequest(listed?.slug ?? `rfq-${purchaseSlug}`)
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 404) return undefined
    throw err
  }
}

export async function addQuoteRequestVendor(rfqSlug: string, vendor: string) {
  const { data } = await api.post<QuoteRequest>(`/api/orgs/rfqs/${rfqSlug}/vendors/`, { vendor })
  return data
}

export async function rejectQuoteRequestVendor(rfqSlug: string, vendorSlug: string, reason: string) {
  const { data } = await api.post<QuoteRequest>(`/api/orgs/rfqs/${rfqSlug}/vendors/${vendorSlug}/reject/`, {
    reason,
  })
  return data
}

export async function recordVendorQuote(rfqSlug: string, payload: RecordQuotePayload) {
  const { data } = await api.post<QuoteRequest>(`/api/orgs/rfqs/${rfqSlug}/quotes/`, payload)
  return data
}

export async function selectQuoteRequestLines(
  rfqSlug: string,
  selections: { line: string; vendor: string; quantity?: string }[],
) {
  const { data } = await api.post<QuoteRequest>(`/api/orgs/rfqs/${rfqSlug}/select-lines/`, {
    selections,
  })
  return data
}

export async function requestQuoteRequestRevision(rfqSlug: string) {
  const { data } = await api.post<QuoteRequest>(`/api/orgs/rfqs/${rfqSlug}/request-revision/`)
  return data
}

export async function createQuoteRequestPurchaseOrder(rfqSlug: string, vendor: string) {
  const { data } = await api.post<PurchaseOrder>(`/api/orgs/rfqs/${rfqSlug}/purchase-orders/`, {
    vendor,
    create_purchase_order: true,
  })
  return data
}

export async function listPurchaseOrders() {
  const { data } = await api.get('/api/orgs/purchase-orders/')
  return unwrapList<PurchaseOrder>(data)
}

export async function exportQuoteRequest(slug: string, format: 'pdf' | 'xlsx' = 'pdf', title?: string) {
  const response = await api.get(`/api/orgs/rfqs/${slug}/export/?format=${format}`, {
    responseType: 'blob',
    timeout: 30000,
  })
  const type = String(response.headers['content-type'] || '')
  if (type.includes('application/json')) {
    const text = await response.data.text()
    throw new Error(text || 'Unable to export this comparison.')
  }
  const filename = filenameFromDisposition(
    response.headers['content-disposition'],
    `${title || slug}.${format}`,
  )
  downloadBlob(response.data, filename)
}