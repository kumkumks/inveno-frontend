import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { FormField } from '@/components/common/form-field'
import { InlineStatus } from '@/components/common/inline-status'
import { PermissionNotice } from '@/components/common/permission-notice'
import { formatApiError, isPermissionError } from '@/lib/errors'
import { emptyVendorForm, vendorFormSchema, type VendorForm } from '@/lib/schemas/vendor'
import type { Vendor } from '@/lib/types'
import { createVendor, updateVendor } from '@/services/vendors'

const fieldClass = 'h-9 w-full rounded-lg border-gray-200 bg-white px-3 text-sm text-gray-800'

function valuesFromVendor(vendor?: Vendor): VendorForm {
  if (!vendor) return emptyVendorForm
  return {
    name: vendor.name ?? '',
    contact_name: vendor.contact_name ?? '',
    phone: vendor.phone ?? '',
    address: vendor.address ?? '',
    email: vendor.email ?? '',
    website: vendor.website ?? '',
    gst: vendor.gst ?? '',
  }
}

export function AddVendorDialog({
  open,
  onOpenChange,
  onSaved,
  vendor,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (vendor: Vendor) => void
  vendor?: Vendor
}) {
  const editing = Boolean(vendor)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    trigger,
    formState: { errors, isSubmitting, isValid },
  } = useForm<VendorForm>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: emptyVendorForm,
    mode: 'onChange',
  })

  useEffect(() => {
    if (!open) return
    reset(valuesFromVendor(vendor))
    void trigger()
  }, [open, vendor, reset, trigger])

  const close = (next: boolean) => {
    if (isSubmitting) return
    if (!next) reset(emptyVendorForm)
    onOpenChange(next)
  }

  const onSave = async (data: VendorForm) => {
    clearErrors('root')
    try {
      const saved = vendor ? await updateVendor(vendor.slug, data) : await createVendor(data)
      onSaved(saved)
      reset(emptyVendorForm)
      onOpenChange(false)
    } catch (err) {
      setError('root', { type: 'server', message: formatApiError(err) })
    }
  }

  const error = errors.root?.message ?? ''

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent overlayClassName="z-[220]" className="z-[220] max-w-md gap-4 flex">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit vendor' : 'Add vendor'}</DialogTitle>
          <DialogDescription>
            {editing ? 'Update this contact.' : 'Save a contact, then choose them for this quote request.'}
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSave)}>
          <FormField label="Name" htmlFor="vendor-name" error={errors.name?.message}>
            <Input id="vendor-name" className={fieldClass} {...register('name')} />
          </FormField>
          <FormField label="Contact name" htmlFor="vendor-contact" error={errors.contact_name?.message}>
            <Input id="vendor-contact" className={fieldClass} {...register('contact_name')} />
          </FormField>
          <FormField label="Phone" htmlFor="vendor-phone" error={errors.phone?.message}>
            <Input id="vendor-phone" className={fieldClass} {...register('phone')} />
          </FormField>
          <FormField label="Address" htmlFor="vendor-address" error={errors.address?.message}>
            <Input id="vendor-address" className={fieldClass} {...register('address')} />
          </FormField>
          <FormField label="Email" htmlFor="vendor-email" error={errors.email?.message}>
            <Input id="vendor-email" type="email" className={fieldClass} {...register('email')} />
          </FormField>
          <FormField label="Website" htmlFor="vendor-website" error={errors.website?.message}>
            <Input id="vendor-website" className={fieldClass} {...register('website')} />
          </FormField>
          <FormField label="GST" htmlFor="vendor-gst" error={errors.gst?.message}>
            <Input id="vendor-gst" className={fieldClass} {...register('gst')} />
          </FormField>
          {error && isPermissionError(error) && (
            <PermissionNotice action={editing ? 'cannot edit a vendor' : 'cannot add a vendor'} />
          )}
          {error && !isPermissionError(error) && <InlineStatus error={error} />}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => close(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !isValid}>
              {isSubmitting ? 'Saving…' : 'Save vendor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
