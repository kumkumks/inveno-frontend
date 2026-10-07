import { useEffect, useState } from 'react'
import { CircleCheck, CircleX, X } from 'lucide-react'
import { FormField } from '@/components/common/form-field'
import { InlineStatus } from '@/components/common/inline-status'
import { PermissionNotice } from '@/components/common/permission-notice'
import { statusLabel } from '@/components/common/list-table'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useAsyncResource } from '@/hooks/use-async-resource'
import { formatApiError, isPermissionError } from '@/lib/errors'
import { formatDate } from '@/lib/format'
import type { PurchaseTrailEvent } from '@/lib/types'
import { listPurchaseTrail, verifyProcessEvent } from '@/services/purchases'

function trailActionLabel(action: string) {
  if (action === 'create') return 'Draft'
  if (action === 'submit') return 'Submitted'
  if (action === 'submit_auto_approved' || action === 'approve') return 'Approved'
  if (action === 'decline') return 'Declined'
  if (action === 'request_revision') return 'Changes requested'
  return statusLabel(action)
}

function trailActionClass(action: string) {
  if (action === 'submit' || action === 'submit_auto_approved') return 'text-[#b8860b]'
  if (action === 'approve') return 'text-[#3d9a4a]'
  if (action === 'decline') return 'text-[#e11d48]'
  if (action === 'request_revision') return 'text-[#c47b5a]'
  return 'text-gray-400'
}

function TrailMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-gray-400">{label}</p>
      <p className="mt-0.5 break-all font-mono text-[11px] leading-4 text-gray-600">{value}</p>
    </div>
  )
}

export function PurchaseTrailDialog({
  open,
  onOpenChange,
  slug,
  spaceName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  slug?: string
  spaceName?: string
}) {
  const { data: events = [], error, loading } = useAsyncResource(
    () => listPurchaseTrail(slug as string),
    [slug, open],
    { enabled: open && Boolean(slug) },
  )
  const trail = [...events].reverse()
  const permissionDenied = Boolean(error && isPermissionError(error))
  const [selectedSlug, setSelectedSlug] = useState('')
  const [hash, setHash] = useState('')
  const [signature, setSignature] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState('')
  const [verifyOk, setVerifyOk] = useState('')
  const selected = trail.find((event) => event.slug === selectedSlug) ?? trail[0]

  useEffect(() => {
    if (open) return
    setSelectedSlug('')
    setHash('')
    setSignature('')
    setVerifyError('')
    setVerifyOk('')
  }, [open])

  const close = (next: boolean) => {
    onOpenChange(next)
  }

  const onVerify = async () => {
    setVerifyError('')
    setVerifyOk('')
    if (!hash.trim() || !signature.trim()) {
      setVerifyError('Enter a hash and signature.')
      return
    }
    setVerifying(true)
    try {
      const result = await verifyProcessEvent(hash.trim(), signature.trim())
      if (result.valid === true) {
        setVerifyOk('Signature is valid.')
      } else {
        setVerifyError(result.detail || 'Signature does not match')
      }
    } catch (err) {
      setVerifyError(formatApiError(err) || 'Signature does not match')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[90vh] max-w-xl gap-6 overflow-y-auto rounded-2xl p-5 sm:p-6"
      >
        <DialogTitle className="sr-only">Approval trail</DialogTitle>
        <DialogClose
          render={
            <Button
              type="button"
              variant="outline"
              className="h-8 w-fit rounded-full px-3 text-sm font-normal text-gray-700"
            />
          }
        >
          <X className="size-3.5" />
          Close
        </DialogClose>

        <InlineStatus loading={loading} loadingLabel="Loading trail…" />
        {permissionDenied && <PermissionNotice action="cannot view this purchase request trail" />}
        {!permissionDenied && <InlineStatus error={error} />}
        {!loading && !error && trail.length === 0 && (
          <p className="text-sm text-gray-400">No trail events yet.</p>
        )}

        {trail.length > 0 && (
          <ol>
            {trail.map((event, index) => {
              const active = event.slug === selected?.slug
              return (
                <li key={event.slug} className="grid grid-cols-[12px_minmax(0,1fr)] gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      className={
                        active
                          ? 'mt-1 size-3 shrink-0 rounded-full bg-[#8a6a12]'
                          : 'mt-1 size-3 shrink-0 rounded-full border-2 border-gray-300 bg-white'
                      }
                    />
                    {index < trail.length - 1 ? <span className="mt-1 w-px flex-1 bg-gray-200" /> : null}
                  </div>
                  <div className={index < trail.length - 1 ? 'pb-6' : ''}>
                    <button
                      type="button"
                      className="flex w-full items-start justify-between gap-3 text-left"
                      onClick={() => setSelectedSlug(event.slug)}
                    >
                      <div className="min-w-0">
                        <p className={`text-sm font-medium ${trailActionClass(event.action)}`}>
                          {trailActionLabel(event.action)}
                        </p>
                        <p className="mt-1 text-base font-medium text-neutral-900">{event.actor_slug}</p>
                        <p className="text-xs text-gray-400">{spaceName || 'Organization level'}</p>
                      </div>
                      <p className="shrink-0 pt-0.5 text-xs text-gray-400">
                        {formatDate(event.created_at, 'time').toLowerCase().replace(' ', '')}
                      </p>
                    </button>
                    {active ? <EventDetails event={event} /> : null}
                  </div>
                </li>
              )
            })}
          </ol>
        )}

        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-neutral-900">Verify one event</h3>
          {verifyError ? (
            <div className="flex items-center gap-2 rounded-lg bg-[#fde8e8] px-3 py-2.5 text-sm text-[#e11d48]">
              <CircleX className="size-4 shrink-0" />
              {verifyError}
            </div>
          ) : null}
          {verifyOk ? (
            <div className="flex items-center gap-2 rounded-lg bg-[#e7f6e4] px-3 py-2.5 text-sm text-[#3d9a4a]">
              <CircleCheck className="size-4 shrink-0" />
              {verifyOk}
            </div>
          ) : null}
          <FormField label="Hash" htmlFor="trail-hash" labelClassName="text-sm font-normal text-gray-800">
            <Input
              id="trail-hash"
              value={hash}
              onChange={(event) => setHash(event.target.value)}
              className="h-9 rounded-md border-gray-300"
            />
          </FormField>
          <FormField label="Signature" htmlFor="trail-signature" labelClassName="text-sm font-normal text-gray-800">
            <Input
              id="trail-signature"
              value={signature}
              onChange={(event) => setSignature(event.target.value)}
              className="h-9 rounded-md border-gray-300"
            />
          </FormField>
          <Button
            type="button"
            variant="dark"
            disabled={verifying}
            className="h-8 w-fit rounded-md px-3"
            onClick={onVerify}
          >
            {verifying ? 'Verifying…' : 'Verify'}
          </Button>
        </section>
      </DialogContent>
    </Dialog>
  )
}

function EventDetails({ event }: { event: PurchaseTrailEvent }) {
  return (
    <div className="mt-3 flex flex-col gap-3 rounded-xl bg-gray-50 px-4 py-3">
      <TrailMeta label="Hash" value={event.content_hash} />
      <TrailMeta label="Signature" value={event.signature} />
      <TrailMeta label="Previous" value={event.prev_hash} />
    </div>
  )
}
