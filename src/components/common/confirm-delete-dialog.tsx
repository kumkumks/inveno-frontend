import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { VariantProps } from 'class-variance-authority'
import { Button, buttonVariants } from '@/components/ui/button'
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
  confirmLabel = 'Delete',
  pendingLabel = 'Deleting…',
  confirmVariant = 'destructive',
  overlayClassName,
  contentClassName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  permissionAction: string
  onConfirm: () => Promise<unknown>
  onDeleted: () => void
  confirmLabel?: string
  pendingLabel?: string
  confirmVariant?: VariantProps<typeof buttonVariants>['variant']
  overlayClassName?: string
  contentClassName?: string
}) {
  const {
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm()
  const error = errors.root?.message ?? ''

  useEffect(() => {
    if (!open) return
    reset()
    clearErrors()
  }, [open, reset, clearErrors])

  const confirmDelete = async () => {
    clearErrors('root')
    try {
      await onConfirm()
      onOpenChange(false)
      onDeleted()
    } catch (deleteFailure) {
      setError('root', { type: 'server', message: formatApiError(deleteFailure) })
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isSubmitting) {
          clearErrors()
          onOpenChange(next)
        }
      }}
    >
      <DialogContent overlayClassName={overlayClassName} className={contentClassName}>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(confirmDelete)}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {error && isPermissionError(error) && <PermissionNotice action={permissionAction} />}
          {error && !isPermissionError(error) && <InlineStatus error={error} />}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant={confirmVariant} disabled={isSubmitting}>
              {isSubmitting ? pendingLabel : confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
