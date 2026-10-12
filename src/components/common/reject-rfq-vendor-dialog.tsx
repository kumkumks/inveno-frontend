import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormField } from '@/components/common/form-field'
import { InlineStatus } from '@/components/common/inline-status'
import { PermissionNotice } from '@/components/common/permission-notice'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { formatApiError, isPermissionError } from '@/lib/errors'
import { rejectRfqVendorSchema, type RejectRfqVendorForm } from '@/lib/schemas/purchase'
import { rejectQuoteRequestVendor } from '@/services/purchases'

export function RejectRfqVendorDialog({
  open,
  onOpenChange,
  rfqSlug,
  vendorSlug,
  vendorName,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  rfqSlug: string
  vendorSlug: string
  vendorName: string
  onSaved: (rfq: Awaited<ReturnType<typeof rejectQuoteRequestVendor>>) => void
}) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<RejectRfqVendorForm>({
    resolver: zodResolver(rejectRfqVendorSchema),
    defaultValues: { reason: '' },
  })
  const error = errors.root?.message ?? ''

  useEffect(() => {
    if (!open) return
    reset({ reason: '' })
  }, [open, reset])

  const close = (next: boolean) => {
    if (isSubmitting) return
    onOpenChange(next)
  }

  const onSave = async (data: RejectRfqVendorForm) => {
    clearErrors('root')
    try {
      const saved = await rejectQuoteRequestVendor(rfqSlug, vendorSlug, data.reason)
      onSaved(saved)
      onOpenChange(false)
    } catch (err) {
      setError('root', { type: 'server', message: formatApiError(err) })
    }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject vendor</DialogTitle>
          <DialogDescription>
            Remove {vendorName || 'this vendor'} from this quote request. Enter a reason.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSave)}>
          <FormField label="Reason" htmlFor="reject-reason" error={errors.reason?.message}>
            <Input id="reject-reason" {...register('reason')} />
          </FormField>
          {error && isPermissionError(error) && <PermissionNotice action="cannot reject this vendor" />}
          {error && !isPermissionError(error) && <InlineStatus error={error} />}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => close(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting ? 'Rejecting…' : 'Reject'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
