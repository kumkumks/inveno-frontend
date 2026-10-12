import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CircleAlert, CircleCheck, X } from 'lucide-react'
import { FormField } from '@/components/common/form-field'
import { InlineStatus } from '@/components/common/inline-status'
import { PermissionNotice } from '@/components/common/permission-notice'
import { statusLabel } from '@/components/common/list-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetClose, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { useAsyncResource } from '@/hooks/use-async-resource'
import { formatApiError, isPermissionError } from '@/lib/errors'
import { formatDate } from '@/lib/format'
import { trailVerifySchema, type TrailVerifyForm } from '@/lib/schemas/purchase'
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
  const [verifyOk, setVerifyOk] = useState('')
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<TrailVerifyForm>({
    resolver: zodResolver(trailVerifySchema),
    defaultValues: { hash: '', signature: '' },
    mode: 'onChange',
  })
  const verifyError = errors.root?.message ?? ''
  const selected = trail.find((event) => event.slug === selectedSlug) ?? trail[0]

  useEffect(() => {
    if (open) return
    setSelectedSlug('')
    setVerifyOk('')
    reset({ hash: '', signature: '' })
    clearErrors()
  }, [open, reset, clearErrors])

  const close = (next: boolean) => {
    onOpenChange(next)
  }

  const onVerify = async (data: TrailVerifyForm) => {
    clearErrors('root')
    setVerifyOk('')
    try {
      const result = await verifyProcessEvent(data.hash, data.signature)
      if (result.valid === true) {
        setVerifyOk('Signature is valid.')
      } else {
        setError('root', { type: 'server', message: result.detail || 'Signature does not match' })
      }
    } catch (err) {
      setError('root', { type: 'server', message: formatApiError(err) || 'Signature does not match' })
    }
  }

  return (
    <Sheet open={open} onOpenChange={close}>
      <SheetContent
        side="right"
        showCloseButton={false}
        overlayClassName="bg-black/40 supports-backdrop-filter:backdrop-blur-none"
        className="top-[65px]! h-[calc(100vh-65px)]! w-full gap-0 data-[side=right]:w-full overflow-y-auto border-l border-gray-200 bg-white p-0 sm:max-w-xl!"
      >
        <SheetTitle className="sr-only">Approval trail</SheetTitle>
        <div className="flex min-h-64 flex-1 flex-col gap-6 overflow-y-auto px-4 pt-4 pb-6 sm:px-5">
        <SheetClose
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
        </SheetClose>

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
                        <p className="mt-3 text-lg font-medium text-neutral-800">{event.actor_slug}</p>
                        <p className="text-sm text-gray-400">{spaceName || 'Organization level'}</p>
                      </div>
                      <p className="shrink-0 pt-0.5 font-mono text-xs text-gray-500">
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
        </div>

        <form
          className="flex shrink-0 flex-col gap-3 border-t border-gray-200 bg-white px-4 py-4 sm:px-5"
          onSubmit={handleSubmit(onVerify)}
        >
          <h3 className="text-sm font-semibold text-neutral-900">Verify one event</h3>
          {verifyError ? (
            <div className="flex items-center gap-2 rounded-lg border border-[#f5b5b5] bg-[#fde8e8] px-3 py-2 text-sm text-[#e11d48]">
              <CircleAlert className="size-4 shrink-0" />
              {verifyError}
            </div>
          ) : null}
          {verifyOk ? (
            <div className="flex items-center gap-2 rounded-lg border border-[#bfe3b9] bg-[#e7f6e4] px-3 py-2 text-sm text-[#3d9a4a]">
              <CircleCheck className="size-4 shrink-0" />
              {verifyOk}
            </div>
          ) : null}
          <FormField
            label="Hash"
            htmlFor="trail-hash"
            error={errors.hash?.message}
            labelClassName="text-sm font-normal text-gray-800"
          >
            <Input
              id="trail-hash"
              className="h-9 rounded-md border-gray-300 text-black"
              {...register('hash')}
            />
          </FormField>
          <FormField
            label="Signature"
            htmlFor="trail-signature"
            error={errors.signature?.message}
            labelClassName="text-sm font-normal text-gray-800"
          >
            <Input
              id="trail-signature"
              className="h-9 rounded-md border-gray-300 text-black"
              {...register('signature')}
            />
          </FormField>
          <Button type="submit" variant="dark" disabled={isSubmitting} className="h-8 w-fit rounded-md px-3">
            {isSubmitting ? 'Verifying…' : 'Verify'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
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
