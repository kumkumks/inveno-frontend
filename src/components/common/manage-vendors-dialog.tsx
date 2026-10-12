import { useEffect, useState } from 'react'
import { XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AddVendorDialog } from '@/components/common/add-vendor-dialog'
import { ConfirmDeleteDialog } from '@/components/common/confirm-delete-dialog'
import { InlineStatus } from '@/components/common/inline-status'
import { PermissionNotice } from '@/components/common/permission-notice'
import { useAsyncResource } from '@/hooks/use-async-resource'
import { formatApiError, isPermissionError } from '@/lib/errors'
import type { Vendor } from '@/lib/types'
import { listAllVendors, suspendVendor, unsuspendVendor } from '@/services/vendors'

const detailRows = [
  { label: 'Contact name', key: 'contact_name' },
  { label: 'Phone', key: 'phone' },
  { label: 'Email', key: 'email' },
  { label: 'Address', key: 'address' },
  { label: 'GST', key: 'gst' },
  { label: 'Website', key: 'website' },
] as const

export function ManageVendorsDialog({
  open,
  onOpenChange,
  onVendorSaved,
  onVendorsChanged,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onVendorSaved: (vendor: Vendor) => void
  onVendorsChanged: () => void
}) {
  const { data: vendors = [], setData, error, loading } = useAsyncResource(listAllVendors, [open], {
    enabled: open,
  })
  const [addOpen, setAddOpen] = useState(false)
  const [editing, setEditing] = useState<Vendor | null>(null)
  const [suspending, setSuspending] = useState<Vendor | null>(null)
  const [pendingSlug, setPendingSlug] = useState('')
  const [actionError, setActionError] = useState('')
  const [selectedSlug, setSelectedSlug] = useState('')

  const formOpen = addOpen || Boolean(editing)
  const selected = vendors.find((vendor) => vendor.slug === selectedSlug) ?? null

  useEffect(() => {
    if (!open || vendors.length === 0) return
    setSelectedSlug((current) => (vendors.some((vendor) => vendor.slug === current) ? current : vendors[0].slug))
  }, [open, vendors])

  const close = (next: boolean) => {
    if (formOpen || suspending || pendingSlug) return
    if (!next) {
      setActionError('')
      setSelectedSlug('')
    }
    onOpenChange(next)
  }

  const reload = async () => {
    const latest = await listAllVendors()
    setData(latest)
    return latest
  }

  const onSaved = async (vendor: Vendor) => {
    const wasEdit = Boolean(editing)
    try {
      await reload()
    } catch {
      setData(wasEdit ? vendors.map((item) => (item.slug === vendor.slug ? { ...item, ...vendor } : item)) : [...vendors, vendor])
    }
    if (vendor.slug) setSelectedSlug(vendor.slug)
    if (wasEdit) onVendorsChanged()
    else onVendorSaved(vendor)
  }

  const onFormOpenChange = (next: boolean) => {
    if (next) return
    setAddOpen(false)
    setEditing(null)
  }

  const onSuspended = async () => {
    try {
      await reload()
    } catch (err) {
      setActionError(formatApiError(err))
    }
    onVendorsChanged()
  }

  const onUnsuspend = async (vendor: Vendor) => {
    if (pendingSlug) return
    setPendingSlug(vendor.slug)
    setActionError('')
    try {
      await unsuspendVendor(vendor.slug)
      await reload()
      onVendorsChanged()
    } catch (err) {
      setActionError(formatApiError(err))
    } finally {
      setPendingSlug('')
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={close}>
        <DialogContent
          showCloseButton={false}
          overlayClassName="z-[210]"
          className="inset-0! top-0! left-0! z-[210] flex h-dvh! w-screen! max-w-none! translate-none! flex-col gap-0 rounded-none p-0"
        >
          <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4 sm:px-7">
            <DialogHeader className="pr-0">
              <DialogTitle>Manage vendors</DialogTitle>
              <DialogDescription>Contacts you can choose for quote requests.</DialogDescription>
            </DialogHeader>
            <div className="flex shrink-0 items-center gap-2">
              <Button type="button" onClick={() => { setEditing(null); setAddOpen(true) }}>
                Add vendor
              </Button>
              <DialogClose
                render={<Button type="button" size="icon-sm" />}
              >
                <XIcon />
                <span className="sr-only">Close</span>
              </DialogClose>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)]">
            <div className="min-h-0 overflow-y-auto border-b border-gray-200 md:border-r md:border-b-0">
              <InlineStatus loading={loading} loadingLabel="Loading vendors…" className="px-5 py-4" />
              {error && isPermissionError(error) && <div className="px-5 py-4"><PermissionNotice action="cannot view vendors" /></div>}
              {error && !isPermissionError(error) && <InlineStatus error={error} className="px-5 py-4" />}
              {!loading && !error && vendors.length === 0 && (
                <p className="px-5 py-4 text-sm text-gray-500">No vendors yet. Add one to get started.</p>
              )}
              {vendors.map((vendor) => {
                const active = vendor.slug === selected?.slug
                const suspended = vendor.is_active === false
                return (
                  <button
                    key={vendor.slug}
                    type="button"
                    className={`flex w-full flex-col items-start gap-0.5 border-b border-gray-100 px-5 py-3 text-left ${active ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                    onClick={() => setSelectedSlug(vendor.slug)}
                  >
                    <span className="text-sm font-medium text-neutral-900">{vendor.name}</span>
                    <span className="text-xs text-gray-500">{suspended ? 'Suspended' : vendor.contact_name || vendor.phone || 'Active'}</span>
                  </button>
                )
              })}
            </div>

            <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-8">
              {actionError && isPermissionError(actionError) && <PermissionNotice action="cannot update a vendor" />}
              {actionError && !isPermissionError(actionError) && <InlineStatus error={actionError} className="mb-4" />}
              {!selected && !loading && (
                <p className="text-sm text-gray-500">Select a vendor to see their details.</p>
              )}
              {selected && (
                <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-neutral-900">{selected.name}</h3>
                      <p className={`mt-1 text-sm ${selected.is_active === false ? 'text-amber-700' : 'text-gray-500'}`}>
                        {selected.is_active === false ? 'Suspended' : 'Active'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" onClick={() => { setAddOpen(false); setEditing(selected) }}>
                        Edit
                      </Button>
                      {selected.is_active === false ? (
                        <Button type="button" disabled={pendingSlug === selected.slug} onClick={() => void onUnsuspend(selected)}>
                          {pendingSlug === selected.slug ? 'Restoring…' : 'Unsuspend'}
                        </Button>
                      ) : (
                        <Button type="button" onClick={() => setSuspending(selected)}>
                          Suspend
                        </Button>
                      )}
                    </div>
                  </div>
                  <dl className="grid gap-4">
                    {detailRows.map((row) => (
                      <div key={row.key} className="grid gap-1 border-b border-gray-100 pb-3 sm:grid-cols-[140px_minmax(0,1fr)]">
                        <dt className="text-xs font-medium tracking-wide text-gray-400 uppercase">{row.label}</dt>
                        <dd className="text-sm break-words text-neutral-900">{selected[row.key] || '—'}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <AddVendorDialog
        open={formOpen}
        onOpenChange={onFormOpenChange}
        vendor={editing ?? undefined}
        onSaved={(vendor) => void onSaved(vendor)}
      />
      <ConfirmDeleteDialog
        open={Boolean(suspending)}
        onOpenChange={(next) => { if (!next) setSuspending(null) }}
        title="Suspend vendor"
        description={`Suspend ${suspending?.name || 'this vendor'}? They will no longer appear when you choose vendors for a quote.`}
        permissionAction="cannot suspend a vendor"
        confirmLabel="Suspend"
        pendingLabel="Suspending…"
        overlayClassName="z-[220]"
        contentClassName="z-[220]"
        onConfirm={() => suspendVendor(suspending?.slug ?? '')}
        onDeleted={() => void onSuspended()}
      />
    </>
  )
}
