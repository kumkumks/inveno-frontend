import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, FileDown, FileSpreadsheet, History, Pencil } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { InlineStatus } from '@/components/common/inline-status'
import { tableHeadClass } from '@/components/common/list-table'
import { PageShell, PageTitle } from '@/components/common/page-shell'
import { PermissionNotice } from '@/components/common/permission-notice'
import { PurchaseTrailDialog } from '@/components/common/purchase-trail-dialog'
import { useAsyncResource } from '@/hooks/use-async-resource'
import { formatApiError, isPermissionError } from '@/lib/errors'
import { listSpaces } from '@/lib/list'
import { canEditPurchase } from '@/lib/purchase'
import { ConfirmDeleteDialog } from '@/components/common/confirm-delete-dialog'
import { displayRole } from '@/lib/roles'
import type { PurchaseExportFormat } from '@/lib/types'
import { deletePurchaseRequest, exportPurchaseRequest } from '@/services/purchase'
import { getPurchaseRequest } from '@/services/purchases'

function ActionCard({
  title,
  description,
  tone,
  children,
}: {
  title: string
  description: string
  tone?: 'blue' | 'green' | 'amber'
  children: ReactNode
}) {
  const toneClass =
    tone === 'green'
      ? 'border-emerald-100 bg-emerald-50/70'
      : tone === 'amber'
        ? 'border-amber-100 bg-amber-50/80'
        : tone === 'blue'
          ? 'border-sky-100 bg-sky-50/80'
          : 'border-gray-200 bg-white'

  return (
    <section className={`rounded-2xl border p-4 sm:p-5 ${toneClass}`}>
      <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      <div className="mt-4 flex flex-wrap gap-2">{children}</div>
    </section>
  )
}

const Purchase_detail = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { data: request, error: loadError, loading } = useAsyncResource(
    () => getPurchaseRequest(slug as string),
    [slug],
    { enabled: Boolean(slug) },
  )
  const { data: spaces = [] } = useAsyncResource(listSpaces, [])
  const error = slug ? loadError : 'Purchase request not found'
  const permissionDenied = Boolean(error && isPermissionError(error))
  const spaceName = spaces.find((space) => space.slug === request?.space)?.name
  const createdBy = [request?.created_by, request?.created_by_role ? `(${displayRole(request.created_by_role)})` : '']
    .filter(Boolean)
    .join(' ')
  const subtitle = [spaceName || request?.space || 'Organization level', createdBy && `Created by ${createdBy}`]
    .filter(Boolean)
    .join(', ')
  const lines = request?.lines ?? []
  const showRevisionBanner = request?.status === 'revision_requested'

  const [exporting, setExporting] = useState<PurchaseExportFormat | null>(null)
  const [exportError, setExportError] = useState('')
  const [trailOpen, setTrailOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const onExport = async (format: PurchaseExportFormat) => {
    if (!slug || exporting) return
    setExporting(format)
    setExportError('')
    try {
      await exportPurchaseRequest(slug, format, request?.title)
    } catch (err) {
      setExportError(formatApiError(err))
    } finally {
      setExporting(null)
    }
  }

  return (
    <PageShell className="max-w-full bg-white">
      <PageTitle
        className="h2 wrap-break-word pr-2"
        description={request ? subtitle : 'Purchase request details'}
        action={
          <Button
          variant="gray"
          className="h-8 w-fit rounded-lg bg-gray-100 px-3 text-sm font-normal text-gray-800 hover:bg-gray-200"
          onClick={() => navigate('/purchase-requests')}
        >
          <ArrowLeft className="size-4" />
          Go back
      </Button>
        }
      >
        {request?.title || 'Purchase request'}
      </PageTitle>

      <InlineStatus loading={loading} loadingLabel="Loading purchase request…" />
      {permissionDenied && <PermissionNotice action="cannot open this purchase request" />}
      {!permissionDenied && <InlineStatus error={error} />}

      {request && (
        <div className="flex flex-col gap-6">
          {request.notes ? <p className="max-w-4xl text-sm leading-6 text-neutral-800">{request.notes}</p> : null}

          {showRevisionBanner && (
            <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-300 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-medium text-amber-900">
                  <Pencil className="size-3.5" />
                  Changes requested
                </p>
                <p className="mt-1 text-sm text-amber-800">
                  {request.review_reason || 'Please update this request before resubmission.'}
                </p>
              </div>
              <Button type="button" variant="outline" className="h-8 shrink-0 rounded-full px-3 text-xs">
                Learn more
              </Button>
            </div>
          )}

          <div className="overflow-x-auto">
            <Table className="w-full min-w-160">
              <TableHeader>
                <TableRow className="border-b border-gray-200 hover:bg-transparent">
                  <TableHead className={tableHeadClass}>Description</TableHead>
                  <TableHead className={tableHeadClass}>Qty</TableHead>
                  <TableHead className={tableHeadClass}>Unit</TableHead>
                  <TableHead className={tableHeadClass}>Catalog item</TableHead>
                  <TableHead className={tableHeadClass}>Awarded vendor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={5} className="px-3 py-6 text-sm text-gray-400">
                      No lines yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  lines.map((line, index) => (
                    <TableRow key={line.slug || `${line.description}-${index}`} className="border-b border-gray-200 hover:bg-transparent">
                      <TableCell className="px-3 py-3 text-sm text-neutral-800">{line.description || '—'}</TableCell>
                      <TableCell className="px-3 py-3 text-sm text-neutral-800">{line.quantity || '—'}</TableCell>
                      <TableCell className="px-3 py-3 text-sm text-neutral-800">{line.unit || '—'}</TableCell>
                      <TableCell className="px-3 py-3">
                        {line.item ? (
                          <Badge variant="dark" className="h-6 rounded-full px-2.5">
                            {line.item}
                          </Badge>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-sm text-neutral-800">{line.awarded_vendor || '—'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <ActionCard title="Operation actions" description="Select the next step for this request." tone="blue">
              <Button type="button" variant="dark" className="h-9 rounded-full px-4">
                Approve
              </Button>
              <Button type="button"  className="h-9 rounded-full px-4 bg-transparent border-blue-200 hover:bg-blue-100 hover:text-gray-900">
                Request revision
              </Button>
              <Button type="button" variant="destructive" className="rounded-2xl">
                Decline
              </Button>
            </ActionCard>

            <ActionCard title="Export & Audit" description="Download this request or review the approval history." tone="green">
              <Button
                type="button"
                variant="dark"
                disabled={Boolean(exporting)}
                className="h-9 rounded-full px-4"
                onClick={() => onExport('pdf')}
              >
                <FileDown className="size-4" />
                {exporting === 'pdf' ? 'Exporting…' : 'Export PDF'}
              </Button>
              <Button
                type="button"
                disabled={Boolean(exporting)}
                className="h-9 rounded-full bg-emerald-700 px-4 text-white hover:bg-emerald-800"
                onClick={() => onExport('xlsx')}
              >
                <FileSpreadsheet className="size-4" />
                {exporting === 'xlsx' ? 'Exporting…' : 'Export XLSX'}
              </Button>
              <Button
                type="button"
                className="h-9 rounded-full px-4 bg-amber-50 hover:bg-gray-300 hover:text-gray-700"
                onClick={() => setTrailOpen(true)}
              >
                <History className="size-4" />
                View trail
              </Button>
              <InlineStatus
                loading={Boolean(exporting)}
                loadingLabel={exporting === 'pdf' ? 'Preparing PDF…' : 'Preparing spreadsheet…'}
                className="w-full"
              />
              {exportError && isPermissionError(exportError) ? (
                <PermissionNotice action="cannot export this purchase request" />
              ) : (
                <InlineStatus error={exportError} className="w-full" />
              )}
            </ActionCard>

            <ActionCard title="Manage purchase request" description="Review the details, then choose your next step." tone="amber">
              <Button type="button" variant="dark" className="h-9 rounded-full px-4">
                Submit request
              </Button>
              <Button
                type="button"
                className="bg-amber-100 hover:bg-amber-200  h-9 rounded-full px-4"
                disabled={!canEditPurchase(request?.status)}
                title={canEditPurchase(request?.status) ? undefined : 'Only drafts and requests with changes requested can be edited'}
                onClick={() => navigate(`/purchase-requests/${slug}/edit`)}
              >
                Edit details
              </Button>
              <Button type="button" onClick={() => setDeleteOpen(true)} variant="destructive" className="h-9 rounded-full bg-[#fde8e8] px-4 text-[#e11d48] hover:bg-[#f8d0d0]">
                Delete request
              </Button>
            </ActionCard>
          </div>
        </div>
      )}

      <PurchaseTrailDialog
        open={trailOpen}
        onOpenChange={setTrailOpen}
        slug={slug}
        spaceName={spaceName || request?.space || undefined}
      />
      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete purchase request"
        description={`Delete ${request?.title || 'this purchase request'}? This cannot be undone from this screen.`}
        permissionAction="cannot delete this purchase request"
        onConfirm={() => deletePurchaseRequest(slug as string)}
        onDeleted={() => navigate('/purchase-requests')}
      />
    </PageShell>
  )
}

export default Purchase_detail
