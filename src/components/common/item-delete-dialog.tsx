import { ConfirmDeleteDialog } from '@/components/common/confirm-delete-dialog'
import { deleteItem, deleteItemPhoto } from '@/services/items'

export function ItemDeleteDialog({
  open,
  onOpenChange,
  title,
  slug,
  photoSlug,
  name,
  onDeleted,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  slug: string
  name?: string
  photoSlug?: string
  onDeleted: () => void
}) {
  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={
        photoSlug
          ? 'Are you sure you want to delete this image?'
          : name
            ? `Delete ${name}? This cannot be undone from this screen.`
            : 'Delete this item?'
      }
      permissionAction={photoSlug ? "cannot change this item's photos" : 'cannot delete this item'}
      onConfirm={() => (photoSlug ? deleteItemPhoto(slug, photoSlug) : deleteItem(slug))}
      onDeleted={onDeleted}
    />
  )
}
