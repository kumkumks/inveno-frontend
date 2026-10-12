import { useState } from 'react'
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
import { ManageVendorsDialog } from '@/components/common/manage-vendors-dialog'
import { InlineStatus } from '@/components/common/inline-status'
import { PermissionNotice } from '@/components/common/permission-notice'
import { useAsyncResource } from '@/hooks/use-async-resource'
import { formatApiError, isPermissionError } from '@/lib/errors'
import { rfqFormSchema, type RfqForm } from '@/lib/schemas/purchase'
import type { Vendor } from '@/lib/types'
import { createQuoteRequest } from '@/services/purchases'
import { listVendors } from '@/services/vendors'

const emptyRfq: RfqForm = { vendor_slugs: [] }

export function StartRfqDialog({
  open,
  onOpenChange,
  purchaseSlug,
  title,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  purchaseSlug: string
  title: string
}) {
  const navigate = useNavigate()
  const { data: vendors = [], setData, error: loadError, loading } = useAsyncResource(listVendors, [open], {
    enabled: open,
  })
  const [manageOpen, setManageOpen] = useState(false)
  const {
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<RfqForm>({
    resolver: zodResolver(rfqFormSchema),
    defaultValues: emptyRfq,
    mode: 'onChange',
  })
  const selected = watch('vendor_slugs')
  const error = errors.root?.message ?? errors.vendor_slugs?.message ?? ''

  const close = (next: boolean) => {
    if (isSubmitting || manageOpen) return
    if (!next) {
      reset(emptyRfq)
      clearErrors()
    }
    onOpenChange(next)
  }

  const setSelected = (next: string[] | ((current: string[]) => string[])) => {
    const current = getValues('vendor_slugs')
    const vendor_slugs = typeof next === 'function' ? next(current) : next
    setValue('vendor_slugs', vendor_slugs, { shouldValidate: true, shouldDirty: true })
  }

  const refreshVendors = async () => {
    const latest = await listVendors()
    setData(latest)
    setSelected((current) => current.filter((slug) => latest.some((item) => item.slug === slug)))
  }

  const onVendorSaved = async (vendor: Vendor) => {
    const latest = await listVendors()
    const saved = latest.find((item) => item.slug === vendor.slug) ?? latest.find((item) => item.name === vendor.name) ?? vendor
    setData(latest.length ? latest : [...vendors, saved])
    if (saved.slug) {
      setSelected((current) => (current.includes(saved.slug) ? current : [...current, saved.slug]))
    }
  }

  const toggle = (slug: string) => {
    setSelected((current) =>
      current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug],
    )
  }

  const onCreate = async (data: RfqForm) => {
    if (!purchaseSlug) return
    clearErrors('root')
    try {
      await createQuoteRequest(purchaseSlug, data.vendor_slugs)
      reset(emptyRfq)
      onOpenChange(false)
    } catch (err) {
      setError('root', { type: 'server', message: formatApiError(err) })
    }
  }

  return (
    <>
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-md gap-4">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onCreate)}>
        <DialogHeader>
          <p className="text-xs font-medium tracking-wide text-gray-400 uppercase">Start RFQ</p>
          <DialogTitle className="text-lg font-semibold text-neutral-900">{title}</DialogTitle>
          <DialogDescription>Vendors never log in — choose from your existing contacts.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-neutral-900">Choose Vendors</h3>
          <p className="text-sm text-gray-400">{selected.length} selected</p>
        </div>

        <InlineStatus loading={loading} loadingLabel="Loading vendors…" />
        {loadError && isPermissionError(loadError) && <PermissionNotice action="cannot view vendors" />}
        {loadError && !isPermissionError(loadError) && <InlineStatus error={loadError} />}

        <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
          {vendors.map((vendor) => {
            const checked = selected.includes(vendor.slug)
            return (
              <label
                key={vendor.slug}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm ${
                  checked ? 'border-neutral-900' : 'border-gray-200'
                }`}
              >
                <input
                  type="checkbox"
                  className="size-4 accent-black"
                  checked={checked}
                  onChange={() => toggle(vendor.slug)}
                />
                <span className="text-neutral-900">{vendor.name}</span>
              </label>
            )
          })}
        </div>

        <div className="flex items-center justify-between gap-3 text-sm">
          <p className="text-gray-500">Need a new contact?</p>
          <button type="button" className="shrink-0 font-medium text-neutral-900" onClick={() => setManageOpen(true)}>
            Manage vendors
          </button>
        </div>

        {error && isPermissionError(error) && <PermissionNotice action="cannot create a quote request" />}
        {error && !isPermissionError(error) && <InlineStatus error={error} />}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => close(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || selected.length === 0}>
            {isSubmitting ? 'Creating…' : 'Create RFQ'}
          </Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    <ManageVendorsDialog
      open={manageOpen}
      onOpenChange={setManageOpen}
      onVendorSaved={(vendor) => void onVendorSaved(vendor)}
      onVendorsChanged={() => void refreshVendors()}
    />
    </>
  )
}
