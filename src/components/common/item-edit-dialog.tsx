import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ItemForm } from '@/components/common/item-form'
import { namedSlug, toDateInputValue } from '@/lib/format'
import type { ItemDetail, UpdateItemPayload } from '@/lib/types'
import { updateItem } from '@/services/items'

function valuesFromItem(item: ItemDetail): UpdateItemPayload {
  return {
    warehouse: namedSlug(item.warehouse),
    name: item.name ?? '',
    unit: item.unit ?? '',
    description: item.description ?? '',
    part_number: item.part_number ?? '',
    alternate_part_number: item.alternate_part_number ?? '',
    category: namedSlug(item.category),
    location: typeof item.location === 'string' ? item.location : namedSlug(item.location),
    remarks: item.remarks ?? '',
    last_purchase_date: toDateInputValue(item.last_purchase_date),
    last_purchase_quantity:
      item.last_purchase_quantity === undefined || item.last_purchase_quantity === null
        ? ''
        : String(item.last_purchase_quantity),
  }
}

export function ItemEditDialog({
  open,
  onOpenChange,
  item,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: ItemDetail
  onSaved: (item: ItemDetail) => void
}) {
  const slug = item.slug
  if (!slug) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit item</DialogTitle>
          <DialogDescription>Update the catalog details, then save.</DialogDescription>
        </DialogHeader>
        {open && (
          <ItemForm
            key={slug}
            defaultValues={valuesFromItem(item)}
            submitLabel="Save changes"
            includeLastPurchase
            className="flex flex-col gap-5"
            onCancel={() => onOpenChange(false)}
            onSubmit={async (payload) => {
              const saved = await updateItem(slug, payload)
              onSaved(saved)
              onOpenChange(false)
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
