import { useEffect, useMemo, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { InlineStatus } from '@/components/common/inline-status'
import { quoteStatusStyle, statusLabel } from '@/components/common/list-table'
import { PageShell } from '@/components/common/page-shell'
import { PermissionNotice } from '@/components/common/permission-notice'
import { awardStepFor, QuotesStepper } from '@/components/common/quotes-stepper'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAsyncResource } from '@/hooks/use-async-resource'
import { formatApiError, isPermissionError } from '@/lib/errors'
import { formatQuantity, formatUnitPrice } from '@/lib/format'
import { awardLinesSchema, type AwardLinesForm } from '@/lib/schemas/purchase'
import type { PurchaseOrder, QuoteLine, QuoteRequest } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  createQuoteRequestPurchaseOrder,
  getPurchaseRequest,
  getQuoteRequestForPurchase,
  listPurchaseOrders,
  selectQuoteRequestLines,
} from '@/services/purchases'
import { listVendors } from '@/services/vendors'

const outlineButton = 'h-8 w-fit shrink-0 px-3.5 text-sm font-normal'
const headCell = 'h-10 px-3 text-left text-sm font-normal text-gray-500'

function remainingFor(line: QuoteLine) {
  if (line.awarded_vendor) return 0
  const remaining = Number(line.quantity_remaining ?? line.quantity)
  return Number.isNaN(remaining) ? Number(line.quantity) : remaining
}

function quotedVendors(line?: Pick<QuoteLine, 'quotes'>) {
  return line?.quotes.map((quote) => quote.vendor) ?? []
}

function cheapestVendor(line: QuoteLine) {
  const priced = [...line.quotes].sort((a, b) => Number(a.unit_price) - Number(b.unit_price))
  return priced[0]?.vendor ?? ''
}

function awardedVendorsOn(rfq: QuoteRequest) {
  const slugs = new Set<string>()
  for (const line of rfq.lines) {
    if (line.awarded_vendor) slugs.add(line.awarded_vendor)
    for (const award of line.awards ?? []) slugs.add(award.vendor)
  }
  return [...slugs]
}

const RequestQuotesAward = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
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
  const { data: catalog = [] } = useAsyncResource(listVendors, [])
  const { data: orders = [], setData: setOrders } = useAsyncResource(listPurchaseOrders, [])
  const [creatingFor, setCreatingFor] = useState('')
  const [actionError, setActionError] = useState('')

  const vendorName = (vendorSlug: string) => catalog.find((item) => item.slug === vendorSlug)?.name ?? vendorSlug
  const loadError = slug ? purchaseError : 'Purchase request not found'
  const permissionDenied = Boolean(
    (loadError && isPermissionError(loadError)) || (rfqError && isPermissionError(rfqError)),
  )
  const openLines = useMemo(
    () => (rfq?.lines ?? []).filter((line) => remainingFor(line) > 0 && quotedVendors(line).length > 0),
    [rfq],
  )
  const relatedOrders = useMemo(
    () => orders.filter((order) => order.purchase_request === slug),
    [orders, slug],
  )
  const hasPurchaseOrder = relatedOrders.length > 0
  const canAward = rfq?.status === 'in_review' || rfq?.status === 'awarding'
  const awarded = rfq ? awardedVendorsOn(rfq) : []

  const {
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<AwardLinesForm>({
    resolver: zodResolver(awardLinesSchema),
    defaultValues: { selections: [] },
  })
  const { fields } = useFieldArray({ control, name: 'selections' })
  const formError = errors.root?.message ?? errors.selections?.message ?? ''

  useEffect(() => {
    reset({
      selections: openLines.map((line) => ({
        line: line.slug,
        description: line.description,
        unit: line.unit,
        quantity: String(remainingFor(line)),
        vendor: line.awarded_vendor || cheapestVendor(line),
      })),
    })
  }, [openLines, reset])

  const quotesPath = `/purchase-requests/${slug}/quotes`

  const onAward = async (data: AwardLinesForm) => {
    if (!rfq) return
    clearErrors('root')
    setActionError('')
    try {
      const saved = await selectQuoteRequestLines(
        rfq.slug,
        data.selections.map((item) => ({ line: item.line, vendor: item.vendor })),
      )
      setRfq(saved)
    } catch (err) {
      setError('root', { type: 'server', message: formatApiError(err) })
    }
  }

  const onCreateOrder = async (vendor: string) => {
    if (!rfq || creatingFor) return
    setCreatingFor(vendor)
    setActionError('')
    try {
      const created = await createQuoteRequestPurchaseOrder(rfq.slug, vendor)
      setOrders((current) => [created, ...(current ?? [])])
    } catch (err) {
      setActionError(formatApiError(err))
    } finally {
      setCreatingFor('')
    }
  }

  const orderFor = (vendor: string): PurchaseOrder | undefined =>
    relatedOrders.find((order) => order.vendor === vendor)

  return (
    <PageShell className="max-w-full bg-white">
      <InlineStatus loading={purchaseLoading || rfqLoading} loadingLabel="Loading award…" />
      {permissionDenied && <PermissionNotice action="cannot award this quote request" />}
      {!permissionDenied && <InlineStatus error={loadError} />}
      {!permissionDenied && rfqError ? <InlineStatus error={rfqError} /> : null}
      {actionError && isPermissionError(actionError) && <PermissionNotice action="cannot create a purchase order" />}
      {actionError && !isPermissionError(actionError) && <InlineStatus error={actionError} />}

      {purchase && (
        <div className="flex flex-col gap-8 sm:gap-10">
          <Button type="button" variant="outline" className={outlineButton} onClick={() => navigate(quotesPath)}>
            Back
          </Button>
          <header>
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
            <QuotesStepper current={awardStepFor(rfq?.status, hasPurchaseOrder)} />
          </header>

          {!rfq && !rfqLoading && !rfqError && (
            <p className="text-sm text-gray-500">Start a quote request from this purchase first.</p>
          )}
          {rfq && !canAward && (
            <p className="text-sm text-gray-500">Record vendor quotes before awarding lines.</p>
          )}

          {rfq && canAward ? (
            <section className="flex flex-col gap-4">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-neutral-900">Award lines</h2>
                <p className="mt-1 text-sm text-gray-500">Pick one quoted vendor for each remaining line.</p>
              </div>

              {openLines.length === 0 ? (
                <p className="text-sm text-gray-500">Every line on this request is already awarded.</p>
              ) : (
                <form className="flex flex-col gap-4" onSubmit={handleSubmit(onAward)}>
                  <div className="-mx-4 overflow-x-auto sm:mx-0">
                    <Table className="w-full min-w-[720px]">
                      <TableHeader>
                        <TableRow className="border-b border-gray-200 hover:bg-transparent">
                          <TableHead className={`${headCell} min-w-52`}>Item</TableHead>
                          <TableHead className={`${headCell} w-28`}>Remaining</TableHead>
                          <TableHead className={`${headCell} min-w-48`}>Vendor</TableHead>
                          <TableHead className={`${headCell} min-w-36`}>Unit price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fields.map((field, index) => {
                          const line = (rfq?.lines ?? []).find((item) => item.slug === field.line)
                          return (
                            <TableRow key={field.id} className="border-b border-gray-200 hover:bg-transparent">
                              <TableCell className="max-w-80 px-3 py-3.5 text-sm whitespace-normal text-neutral-800">
                                {field.description}
                              </TableCell>
                              <TableCell className="px-3 py-3.5 text-sm whitespace-nowrap text-neutral-800">
                                {formatQuantity(field.quantity)} {field.unit}
                              </TableCell>
                              <TableCell className="px-3 py-3.5">
                                <Controller
                                  control={control}
                                  name={`selections.${index}.vendor`}
                                  render={({ field: vendorField }) => (
                                    <Select
                                      value={vendorField.value || null}
                                      onValueChange={(value) => vendorField.onChange(value ?? '')}
                                    >
                                      <SelectTrigger id={`award-vendor-${field.line}`}>
                                        <SelectValue placeholder="Choose a vendor" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {quotedVendors(line).map((vendor) => (
                                          <SelectItem key={vendor} value={vendor}>
                                            {vendorName(vendor)}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}
                                />
                                {errors.selections?.[index]?.vendor?.message ? (
                                  <span className="mt-1 block text-sm text-red-500">
                                    {errors.selections[index]?.vendor?.message}
                                  </span>
                                ) : null}
                              </TableCell>
                              <TableCell className="px-3 py-3.5 text-sm whitespace-nowrap text-neutral-800">
                                <Controller
                                  control={control}
                                  name={`selections.${index}.vendor`}
                                  render={({ field: vendorField }) => (
                                    <span>
                                      {formatUnitPrice(
                                        line?.quotes.find((quote) => quote.vendor === vendorField.value)?.unit_price,
                                        field.unit,
                                      )}
                                    </span>
                                  )}
                                />
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  {formError && isPermissionError(formError) && <PermissionNotice action="cannot award these lines" />}
                  {formError && !isPermissionError(formError) && <InlineStatus error={formError} />}
                  <div className="flex justify-stretch sm:justify-end">
                    <Button type="submit" variant="dark" className="h-9 w-full px-4 sm:w-auto" disabled={isSubmitting}>
                      {isSubmitting ? 'Awarding…' : 'Confirm award'}
                    </Button>
                  </div>
                </form>
              )}
            </section>
          ) : null}

          {rfq && awarded.length > 0 ? (
            <section className="flex flex-col gap-4">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-neutral-900">Purchase orders</h2>
                <p className="mt-1 text-sm text-gray-500">Issue an order for each awarded vendor.</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {awarded.map((vendor) => {
                  const order = orderFor(vendor)
                  return (
                    <article key={vendor} className="flex min-w-0 flex-col gap-6 rounded-xl border border-gray-200 bg-white px-5 py-4">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold wrap-break-word text-neutral-900">{vendorName(vendor)}</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {order ? `${order.slug} · ${statusLabel(order.status)}` : 'No purchase order yet'}
                        </p>
                      </div>
                      {order ? null : (
                        <Button
                          type="button"
                          variant="dark"
                          className="h-8 w-fit px-3.5 text-sm font-normal"
                          disabled={Boolean(creatingFor)}
                          onClick={() => void onCreateOrder(vendor)}
                        >
                          {creatingFor === vendor ? 'Creating…' : 'Create purchase order'}
                        </Button>
                      )}
                    </article>
                  )
                })}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </PageShell>
  )
}

export default RequestQuotesAward
