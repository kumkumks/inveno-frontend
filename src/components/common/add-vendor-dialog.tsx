import { useEffect, useState } from 'react'
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
import type { Vendor } from '@/lib/types'
import { createVendor, updateVendor } from '@/services/vendors'

const fieldClass = 'h-9 w-full rounded-lg border-gray-200 bg-white px-3 text-sm text-gray-800'

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
  const [name, setName] = useState('')
  const [contactName, setContactName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const editing = Boolean(vendor)

  useEffect(() => {
    if (!open) return
    setName(vendor?.name ?? '')
    setContactName(vendor?.contact_name ?? '')
    setPhone(vendor?.phone ?? '')
    setAddress(vendor?.address ?? '')
    setError('')
  }, [open, vendor])

  const reset = () => {
    setName('')
    setContactName('')
    setPhone('')
    setAddress('')
    setError('')
  }

  const close = (next: boolean) => {
    if (saving) return
    if (!next) reset()
    onOpenChange(next)
  }

  const onSave = async () => {
    if (saving) return
    setSaving(true)
    setError('')
    try {
      const payload = {
        name: name.trim(),
        contact_name: contactName.trim(),
        phone: phone.trim(),
        address: address.trim(),
      }
      const saved = vendor ? await updateVendor(vendor.slug, payload) : await createVendor(payload)
      onSaved(saved)
      reset()
      onOpenChange(false)
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setSaving(false)
    }
  }

  const canSave = Boolean(name.trim() && contactName.trim() && phone.trim() && address.trim())

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent overlayClassName="z-[220]" className="z-[220] max-w-md gap-4">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit vendor' : 'Add vendor'}</DialogTitle>
          <DialogDescription>
            {editing ? 'Update this contact.' : 'Save a contact, then choose them for this quote request.'}
          </DialogDescription>
        </DialogHeader>
        <FormField label="Name" htmlFor="vendor-name">
          <Input id="vendor-name" className={fieldClass} value={name} onChange={(event) => setName(event.target.value)} />
        </FormField>
        <FormField label="Contact name" htmlFor="vendor-contact">
          <Input id="vendor-contact" className={fieldClass} value={contactName} onChange={(event) => setContactName(event.target.value)} />
        </FormField>
        <FormField label="Phone" htmlFor="vendor-phone">
          <Input id="vendor-phone" className={fieldClass} value={phone} onChange={(event) => setPhone(event.target.value)} />
        </FormField>
        <FormField label="Address" htmlFor="vendor-address">
          <Input id="vendor-address" className={fieldClass} value={address} onChange={(event) => setAddress(event.target.value)} />
        </FormField>
        {error && isPermissionError(error) && (
          <PermissionNotice action={editing ? 'cannot edit a vendor' : 'cannot add a vendor'} />
        )}
        {error && !isPermissionError(error) && <InlineStatus error={error} />}
        <DialogFooter>
          <Button type="button" onClick={() => close(false)} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" disabled={saving || !canSave} onClick={() => void onSave()}>
            {saving ? 'Saving…' : 'Save vendor'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
