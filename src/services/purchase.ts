import type { CreatePurchasePayload, PurchaseExportFormat, PurchaseRequest as PurchaseRequestType } from "@/lib/types"
import api from "./api"
import { downloadBlob, filenameFromDisposition } from "@/lib/download"

export async function createPurchaseRequest(payload: CreatePurchasePayload) {
    const { data } = await api.post<PurchaseRequestType>('/api/orgs/purchase-requests/', payload)
    return data
}

async function messageFromBlobError(error: unknown) {
  const data = (error as { response?: { data?: unknown } }).response?.data
  if (!(data instanceof Blob)) return null
  const text = await data.text()
  try {
    const body = JSON.parse(text) as { detail?: string; format?: string[] }
    return body.detail || body.format?.join(' ') || null
  } catch {
    return text.slice(0, 200) || null
  }
}

export async function exportPurchaseRequest(slug: string, format: PurchaseExportFormat, title?: string) {
  try {
    const response = await api.get(`/api/orgs/purchase-requests/${slug}/export/?format=${format}`, {
      responseType: 'blob',
      timeout: 30000,
    })

    const type = String(response.headers['content-type'] || '')
    if (type.includes('application/json')) {
      const text = await response.data.text()
      throw new Error(text || 'Unable to export this request.')
    }

    const filename = filenameFromDisposition(
      response.headers['content-disposition'],
      `${title || slug}.${format}`,
    )
    downloadBlob(response.data, filename)
  } catch (error) {
    const message = await messageFromBlobError(error)
    throw message ? new Error(message) : error
  }
}

export async function exportPurchaseRequestXlsx(slug: string, title?: string) {
  return exportPurchaseRequest(slug, 'xlsx', title)
}