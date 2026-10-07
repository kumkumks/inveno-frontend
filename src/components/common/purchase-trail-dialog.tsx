import { InlineStatus } from '@/components/common/inline-status'
import { PermissionNotice } from '@/components/common/permission-notice'
import { statusLabel } from '@/components/common/list-table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAsyncResource } from '@/hooks/use-async-resource'
import { isPermissionError } from '@/lib/errors'
import { formatDate } from '@/lib/format'
import { displayRole } from '@/lib/roles'
import { listPurchaseTrail } from '@/services/purchases'

export function PurchaseTrailDialog({
  open,
  onOpenChange,
  slug,
  title,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  slug?: string
  title?: string
}) {
  const { data: events = [], error, loading } = useAsyncResource(
    () => listPurchaseTrail(slug as string),
    [slug, open],
    { enabled: open && Boolean(slug) },
  )
  const permissionDenied = Boolean(error && isPermissionError(error))
  const trail = [...events].reverse()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Approval trail</DialogTitle>
          <DialogDescription>
            {title ? `History for ${title}.` : 'History for this purchase request.'}
          </DialogDescription>
        </DialogHeader>

        <InlineStatus loading={loading} loadingLabel="Loading trail…" />
        {permissionDenied && <PermissionNotice action="cannot view this purchase request trail" />}
        {!permissionDenied && <InlineStatus error={error} />}
        {!loading && !error && trail.length === 0 && (
          <p className="text-sm text-gray-400">No trail events yet.</p>
        )}

        {trail.length > 0 && (
          <ol className="flex flex-col gap-4">
            {trail.map((event) => (
              <li key={event.slug} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-neutral-900">{statusLabel(event.action)}</p>
                  <p className="shrink-0 text-xs text-gray-400">{formatDate(event.created_at, 'datetime')}</p>
                </div>
                <p className="mt-1 text-sm text-neutral-800">{event.actor_slug}</p>
                <p className="text-xs text-gray-500">{displayRole(event.actor_user_type)}</p>
                {event.resource_type && event.resource_type !== 'purchase_request' ? (
                  <p className="mt-1 text-xs text-gray-400">{statusLabel(event.resource_type)}</p>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </DialogContent>
    </Dialog>
  )
}
