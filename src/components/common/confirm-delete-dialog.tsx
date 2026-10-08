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

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  permissionAction,
  onConfirm,
  onDeleted,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  permissionAction: string
  onConfirm: () => Promise<unknown>
  onDeleted: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const confirmDelete = async () => {
    setSaving(true)
    setError('')
    try {
      await onConfirm()
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
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {error && isPermissionError(error) && <PermissionNotice action={permissionAction} />}
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
