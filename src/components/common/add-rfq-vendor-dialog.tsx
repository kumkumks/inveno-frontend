import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AddVendorDialog } from '@/components/common/add-vendor-dialog'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatApiError, isPermissionError } from '@/lib/errors'
import { addRfqVendorSchema, type AddRfqVendorForm } from '@/lib/schemas/purchase'
import type { Vendor } from '@/lib/types'
import { addQuoteRequestVendor } from '@/services/purchases'

export function AddRfqVendorDialog({
  open,
  onOpenChange,
  rfqSlug,
  vendors,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  rfqSlug: string
  vendors: Vendor[]
  onSaved: (rfq: Awaited<ReturnType<typeof addQuoteRequestVendor>>) => void
}) {
  const [createOpen, setCreateOpen] = useState(false)
  const {
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddRfqVendorForm>({
    resolver: zodResolver(addRfqVendorSchema),
    defaultValues: { vendor: '' },
  })
  const error = errors.root?.message ?? ''

  useEffect(() => {
    if (!open) return
    reset({ vendor: vendors[0]?.slug ?? '' })
  }, [open, vendors, reset])

  const close = (next: boolean) => {
    if (isSubmitting || createOpen) return
    onOpenChange(next)
  }

  const attach = async (slug: string) => {
    const saved = await addQuoteRequestVendor(rfqSlug, slug)
    onSaved(saved)
    onOpenChange(false)
  }

  const onSave = async (data: AddRfqVendorForm) => {
    clearErrors('root')
    try {
      await attach(data.vendor)
    } catch (err) {
      setError('root', { type: 'server', message: formatApiError(err) })
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={close}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add vendor</DialogTitle>
            <DialogDescription>Choose a contact for this quote request.</DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSave)}>
            <FormField label="Vendor" htmlFor="rfq-vendor" error={errors.vendor?.message}>
              <Controller
                control={control}
                name="vendor"
                render={({ field }) => (
                  <Select value={field.value || null} onValueChange={(value) => field.onChange(value ?? '')}>
                    <SelectTrigger id="rfq-vendor">
                      <SelectValue placeholder="Choose a vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor.slug} value={vendor.slug}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <button
              type="button"
              className="w-fit text-sm font-medium text-neutral-900"
              onClick={() => setCreateOpen(true)}
            >
              Need a new contact?
            </button>
            {error && isPermissionError(error) && <PermissionNotice action="cannot add a vendor to this quote request" />}
            {error && !isPermissionError(error) && <InlineStatus error={error} />}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => close(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || vendors.length === 0}>
                {isSubmitting ? 'Adding…' : 'Add vendor'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AddVendorDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSaved={(vendor) => {
          setValue('vendor', vendor.slug, { shouldValidate: true })
          void attach(vendor.slug).catch((err) => {
            setError('root', { type: 'server', message: formatApiError(err) })
          })
        }}
      />
    </>
  )
}
