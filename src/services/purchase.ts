import type { CreatePurchasePayload } from "@/lib/types"
import api from "./api"
import type { PurchaseRequest as PurchaseRequestType } from "@/lib/types"

export async function createPurchaseRequest(payload: CreatePurchasePayload) {
    const { data } = await api.post<PurchaseRequestType>('/api/orgs/purchase-requests/', payload)
    return data
}