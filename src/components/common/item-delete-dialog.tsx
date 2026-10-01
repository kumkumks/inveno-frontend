import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { InlineStatus } from '@/components/common/inline-status'
import { PermissionNotice } from '@/components/common/permission-notice'
import { formatApiError, isPermissionError } from '@/lib/errors'
import { deleteItem } from '@/services/items'

export function ItemDeleteDialog({
  open,
  onOpenChange,
  slug,
  name,
  onDeleted,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  slug: string
  name?: string
  onDeleted: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const confirmDelete = async () => {
    setSaving(true)
    setError('')
    try {
      await deleteItem(slug)
      onOpenChange(false)
      onDeleted()
    } catch (deleteFailure) {
      setError(formatApiError(deleteFailure))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!saving) {
          setError('')
          onOpenChange(next)
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete item</DialogTitle>
          <DialogDescription>
            {name ? `Delete ${name}? This cannot be undone from this screen.` : 'Delete this item?'}
          </DialogDescription>
        </DialogHeader>
        {error && isPermissionError(error) && <PermissionNotice action="cannot delete this item" />}
        {error && !isPermissionError(error) && <InlineStatus error={error} />}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={() => void confirmDelete()} disabled={saving}>
            {saving ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
