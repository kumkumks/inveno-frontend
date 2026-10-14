import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { AddRfqVendorDialog } from '@/components/common/add-rfq-vendor-dialog'
import { InlineStatus } from '@/components/common/inline-status'
import { PermissionNotice } from '@/components/common/permission-notice'
import { RecordQuoteDialog } from '@/components/common/record-quote-dialog'
import { RejectRfqVendorDialog } from '@/components/common/reject-rfq-vendor-dialog'
import { PageShell } from '@/components/common/page-shell'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAsyncResource } from '@/hooks/use-async-resource'
import { formatApiError, isPermissionError } from '@/lib/errors'
import { formatUnitPrice } from '@/lib/format'
import { statusLabel } from '@/components/common/list-table'
import type { QuoteLine, QuoteRequest, QuoteRequestStatus, QuoteVendorStatus } from '@/lib/types'
import { cn } from '@/lib/utils'
import { exportQuoteRequest, getPurchaseRequest, getQuoteRequestForPurchase } from '@/services/purchases'
import { listVendors } from '@/services/vendors'
import { useNavigate } from 'react-router-dom'

const STEPS = [
  { n: 1, label: 'Quotes' },
  { n: 2, label: 'Award' },
  { n: 3, label: 'Purchase orders' },
] as const


const outlineButton = 'h-8 w-fit shrink-0 px-3.5 text-sm font-normal'
const headCell = 'h-10 px-3 text-left text-sm font-normal text-gray-500'

const quoteStatusStyle: Record<string, string> = {
  preparing: 'bg-[#fde8d0] text-[#c47a3a]',
  in_review: 'bg-[#fde8d0] text-[#c47a3a]',
  awarding: 'bg-[#e7f6e4] text-[#3d9a4a]',
  cancelled: 'bg-[#fde8e8] text-[#e11d48]',
}

const vendorStatusLabel: Record<QuoteVendorStatus, string> = {
  invited: 'Pending',
  quoted: 'Quoted',
  rejected: 'Rejected',
  awarded: 'Awarded',
}

function stepFor(status?: QuoteRequestStatus) {
  if (status === 'awarding') return 2
  return 1
}

function QuotesStepper({ current }: { current: number }) {
  return (
    <ol className="mt-6 flex items-center gap-4 overflow-x-auto border-y border-gray-200 py-3 sm:mt-8 sm:gap-8">
      {STEPS.map((step) => {
        const active = step.n === current
        return (
          <li key={step.n} className="flex shrink-0 items-center gap-2">
            <span
              className={cn(
                'flex size-6 items-center justify-center rounded-md text-xs font-medium',
                active ? 'bg-neutral-900 text-white' : 'bg-gray-100 text-gray-500',
              )}
            >
              {step.n}
            </span>
            <span className={cn('text-sm whitespace-nowrap', active ? 'font-medium text-neutral-900' : 'text-gray-400')}>
              {step.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function quoteFor(line: QuoteLine, vendorSlug: string) {
  return line.quotes.find((quote) => quote.vendor === vendorSlug)
}

const RequestQuotes = () => {
  const navigate = useNavigate();
  const { slug } = useParams()
  const { data: purchase, error: purchaseError, loading: purchaseLoading } = useAsyncResource(
    () => getPurchaseRequest(slug as string),
    [slug],
    { enabled: Boolean(slug) },
  )
  const {
    data: rfq,
    setData: setRfq,
    error: rfqError,
    loading: rfqLoading,
  } = useAsyncResource(() => getQuoteRequestForPurchase(slug as string), [slug], { enabled: Boolean(slug) })
  const { data: catalog = [], setData: setCatalog } = useAsyncResource(listVendors, [])
  const [recordOpen, setRecordOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [rejecting, setRejecting] = useState<{ slug: string; name: string } | null>(null)
  const [exporting, setExporting] = useState(false)
  const [actionError, setActionError] = useState('')

  const vendors = rfq?.vendors ?? []
  const lines = rfq?.lines ?? []
  const vendorName = (vendorSlug: string) => catalog.find((item) => item.slug === vendorSlug)?.name ?? vendorSlug
  const availableToAdd = useMemo(() => {
    const onRequest = new Set(vendors.map((item) => item.vendor))
    return catalog.filter((item) => !onRequest.has(item.slug))
  }, [catalog, vendors])
  const loadError = slug ? purchaseError : 'Purchase request not found'
  const permissionDenied = Boolean(
    (loadError && isPermissionError(loadError)) || (rfqError && isPermissionError(rfqError)),
  )
  const canAct = Boolean(rfq) && rfq?.status !== 'cancelled' && rfq?.status !== 'awarding'
  const canRecord = canAct && vendors.some((item) => item.status !== 'rejected')
  const canContinue = rfq?.status === 'in_review' || rfq?.status === 'awarding'
  const awardPath = `/purchase-requests/${slug}/quotes/award`

  const onRfqSaved = (next: QuoteRequest) => {
    setRfq(next)
    setActionError('')
  }

  const onExport = async () => {
    if (!rfq || exporting) return
    setExporting(true)
    setActionError('')
    try {
      await exportQuoteRequest(rfq.slug, 'pdf', purchase?.title)
    } catch (err) {
      setActionError(formatApiError(err))
    } finally {
      setExporting(false)
    }
  }

  return (
    <PageShell className="max-w-full bg-white">
      <InlineStatus loading={purchaseLoading || rfqLoading} loadingLabel="Loading quote request…" />
      {permissionDenied && <PermissionNotice action="cannot open this quote request" />}
      {!permissionDenied && <InlineStatus error={loadError} />}
      {!permissionDenied && rfqError ? <InlineStatus error={rfqError} /> : null}
      {actionError && isPermissionError(actionError) && <PermissionNotice action="cannot update this quote request" />}
      {actionError && !isPermissionError(actionError) && <InlineStatus error={actionError} />}

      {purchase && (
        <div className="flex flex-col gap-8 sm:gap-10">
            <Button type="button" variant="outline" className={outlineButton} onClick={() => navigate('/purchase-requests')}>Back</Button>
          <header>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight wrap-break-word text-neutral-900 sm:text-[28px]">
                  {purchase.title}
                </h1>
                {rfq ? (
                  <span
                    className={cn(
                      'mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      quoteStatusStyle[rfq.status] ?? quoteStatusStyle.preparing,
                    )}
                  >
                    {statusLabel(rfq.status)}
                  </span>
                ) : null}
              </div>
              <Button
                type="button"
                variant="outline"
                className={outlineButton}
                disabled={!rfq || exporting}
                onClick={() => void onExport()}
              >
                {exporting ? 'Exporting…' : 'Export comparison PDF'}
              </Button>
            </div>
            <QuotesStepper current={stepFor(rfq?.status)} />
          </header>

          {!rfq && !rfqLoading && !rfqError && (
            <p className="text-sm text-gray-500">Start a quote request from this purchase first.</p>
          )}

          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-neutral-900">Quotes recorded</h2>
                <p className="mt-1 text-sm text-gray-500">Prices per unit, as given by each vendor.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                className={outlineButton}
                disabled={!canRecord}
                onClick={() => setRecordOpen(true)}
              >
                Record quote
              </Button>
            </div>

            <div className="-mx-4 overflow-x-auto sm:mx-0">
              <Table className="w-full min-w-[640px]">
                <TableHeader>
                  <TableRow className="border-b border-gray-200 hover:bg-transparent">
                    <TableHead className={`${headCell} min-w-52`}>Item</TableHead>
                    {vendors.map((item) => (
                      <TableHead key={item.vendor} className={`${headCell} min-w-32`}>
                        {vendorName(item.vendor)}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lines.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={Math.max(vendors.length + 1, 1)} className="px-3 py-6 text-sm text-gray-400">
                        No lines on this request yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    lines.map((line) => (
                      <TableRow key={line.slug} className="border-b border-gray-200 hover:bg-transparent">
                        <TableCell className="max-w-80 px-3 py-3.5 text-sm whitespace-normal text-neutral-800">
                          {line.description}
                        </TableCell>
                        {vendors.map((item) => (
                          <TableCell key={item.vendor} className="px-3 py-3.5 text-sm whitespace-nowrap text-neutral-800">
                            {formatUnitPrice(quoteFor(line, item.vendor)?.unit_price, line.unit)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-neutral-900">Vendors</h2>
                <p className="mt-1 text-sm text-gray-500">Contacts only. Vendors never log in.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                className={outlineButton}
                disabled={!canAct}
                onClick={() => setAddOpen(true)}
              >
                <Plus className="size-4" />
                Add vendor
              </Button>
            </div>

            {vendors.length === 0 ? (
              <p className="text-sm text-gray-400">No vendors on this quote request yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
                {vendors.map((item) => (
                  <article
                    key={item.vendor}
                    className="flex min-w-0 flex-col gap-8 rounded-xl border border-gray-200 bg-white px-5 py-4"
                  >
                    <h3 className="text-base font-semibold wrap-break-word text-neutral-900">{vendorName(item.vendor)}</h3>
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex h-6 items-center rounded-full bg-gray-100 px-2.5 text-xs text-gray-500">
                        {vendorStatusLabel[item.status]}
                      </span>
                      {item.status !== 'rejected' && canAct ? (
                        <button
                          type="button"
                          className="shrink-0 text-sm text-[#e11d48]"
                          onClick={() => setRejecting({ slug: item.vendor, name: vendorName(item.vendor) })}
                        >
                          Reject
                        </button>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <div className="flex justify-stretch sm:justify-end">
            <Button
              type="button"
              variant="dark"
              className="h-9 w-full px-4 sm:w-auto"
              disabled={!canContinue}
              onClick={() => navigate(awardPath)}
            >
              Continue to award
            </Button>
          </div>
        </div>
      )}

      {rfq ? (
        <>
          <RecordQuoteDialog
            open={recordOpen}
            onOpenChange={setRecordOpen}
            rfqSlug={rfq.slug}
            lines={lines}
            vendors={vendors}
            names={catalog}
            onSaved={onRfqSaved}
          />
          <AddRfqVendorDialog
            open={addOpen}
            onOpenChange={setAddOpen}
            rfqSlug={rfq.slug}
            vendors={availableToAdd}
            onSaved={(next) => {
              onRfqSaved(next)
              setAddOpen(false)
              void listVendors().then(setCatalog)
            }}
          />
          <RejectRfqVendorDialog
            open={Boolean(rejecting)}
            onOpenChange={(open) => {
              if (!open) setRejecting(null)
            }}
            rfqSlug={rfq.slug}
            vendorSlug={rejecting?.slug ?? ''}
            vendorName={rejecting?.name ?? ''}
            onSaved={onRfqSaved}
          />
        </>
      ) : null}
    </PageShell>
  )
}

export default RequestQuotes
