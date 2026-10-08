import type { PurchaseStatus } from '@/lib/types'

const EDITABLE_STATUSES: PurchaseStatus[] = ['draft', 'revision_requested']

export function canEditPurchase(status?: PurchaseStatus | null) {
  return Boolean(status && EDITABLE_STATUSES.includes(status))
}
