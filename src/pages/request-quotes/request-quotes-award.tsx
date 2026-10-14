import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ConfirmDeleteDialog } from '@/components/common/confirm-delete-dialog'
import { InlineStatus } from '@/components/common/inline-status'
import { quoteStatusStyle, statusLabel } from '@/components/common/list-table'
import { PageShell } from '@/components/common/page-shell'
import { PermissionNotice } from '@/components/common/permission-notice'
import { QuotesStepper } from '@/components/common/quotes-stepper'
import { Button } from '@/components/ui/button'
import { useAsyncResource } from '@/hooks/use-async-resource'
import { formatApiError, isPermissionError } from '@/lib/errors'
import { formatQuantity } from '@/lib/format'
import type { PurchaseRequest, QuoteLine, QuoteRequest } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  clearQuoteRequestAward,
  exportQuoteRequest,
  getPurchaseRequest,
  getQuoteRequestForPurchase,
  listPurchaseOrders,
  requestQuoteRequestRevision,
  selectQuoteRequestLines,
} from '@/services/purchases'
import { listVendors } from '@/services/vendors'

const outlineButton = 'h-8 w-fit shrink-0 px-3.5 text-sm font-normal'

function qty(value: string | number | null | undefined) {
  const numeric = Number(value)
  return Number.isNaN(numeric) ? 0 : numeric
}

function money(amount: number) {
  return `$${amount.toFixed(2)}`
}

function pendingKey(line: string, vendor: string) {
  return `${line}::${vendor}`
}

function savedQty(line: QuoteLine, vendor: string) {
  const awarded = (line.awards ?? []).filter((item) => item.vendor === vendor)
  if (awarded.length) return awarded.reduce((sum, item) => sum + qty(item.quantity), 0)
  if (line.awarded_vendor === vendor) return qty(line.quantity)
  return 0
}

function totalSaved(line: QuoteLine) {
  const awarded = line.awards ?? []
  if (awarded.length) return awarded.reduce((sum, item) => sum + qty(item.quantity), 0)
  if (line.awarded_vendor) return qty(line.quantity)
  return 0
}

function withPurchaseAwards(line: QuoteLine, purchase?: PurchaseRequest): QuoteLine {
  const fromPurchase = purchase?.lines?.find((item) => item.slug === line.slug)
  if (!fromPurchase) return line
  return {
    ...line,
    awards: fromPurchase.awards ?? line.awards,
    quantity_remaining: fromPurchase.quantity_remaining ?? line.quantity_remaining,
    awarded_vendor: fromPurchase.awarded_vendor ?? line.awarded_vendor,
  }
}

function quoteFor(line: QuoteLine, vendor: string) {
  return line.quotes.find((item) => item.vendor === vendor)
}

function cheapestVendor(line: QuoteLine) {
  const priced = [...line.quotes].sort((a, b) => Number(a.unit_price) - Number(b.unit_price))
  return priced[0]?.vendor ?? ''
}

const ITEM_COL = 'minmax(200px, 240px)'
const VENDOR_COL = 'minmax(200px, 1fr)'

const gridCols = (count: number) =>
  ({
    gridTemplateColumns: `${ITEM_COL} repeat(${Math.max(count, 1)}, ${VENDOR_COL})`,
  }) as const

const cellPad = 'px-4 py-5 sm:px-5'
const headerPad = 'px-4 py-3.5 sm:px-5'

const RequestQuotesAward = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const {
    data: purchase,
    setData: setPurchase,
    error: purchaseError,
    loading: purchaseLoading,
  } = useAsyncResource(() => getPurchaseRequest(slug as string), [slug], { enabled: Boolean(slug) })
  const {
    data: rfq,
    setData: setRfq,
    error: rfqError,
    loading: rfqLoading,
  } = useAsyncResource(() => getQuoteRequestForPurchase(slug as string), [slug], { enabled: Boolean(slug) })
  const { data: catalog = [] } = useAsyncResource(listVendors, [])
  const { data: orders = [] } = useAsyncResource(listPurchaseOrders, [])
  const [pending, setPending] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [clearing, setClearing] = useState('')
  const [resetOpen, setResetOpen] = useState(false)
  const [saveOpen, setSaveOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [actionError, setActionError] = useState('')

  const quotesPath = `/purchase-requests/${slug}/quotes`
  const ordersPath = `/purchase-requests/${slug}/quotes/orders`
  const vendorName = (vendorSlug: string) => catalog.find((item) => item.slug === vendorSlug)?.name ?? vendorSlug
  const loadError = slug ? purchaseError : 'Purchase request not found'
  const permissionDenied = Boolean(
    (loadError && isPermissionError(loadError)) || (rfqError && isPermissionError(rfqError)),
  )
  const lines = useMemo(
    () => (rfq?.lines ?? []).map((line) => withPurchaseAwards(line, purchase)),
    [rfq, purchase],
  )
  const relatedOrders = useMemo(
    () => orders.filter((order) => order.purchase_request === slug),
    [orders, slug],
  )
  const canAward = rfq?.status === 'in_review' || rfq?.status === 'awarding'
  const columns = useMemo(() => {
    const quoted = new Set(lines.flatMap((line) => line.quotes.map((item) => item.vendor)))
    return (rfq?.vendors ?? []).filter(
      (item) => item.status !== 'rejected' && (quoted.has(item.vendor) || item.status === 'awarded'),
    )
  }, [lines, rfq])

  const pendingQty = (lineSlug: string, vendor: string, store = pending) =>
    qty(store[pendingKey(lineSlug, vendor)])

  const availableFor = (line: QuoteLine, vendor: string, store = pending) => {
    const others = columns.reduce((sum, item) => {
      if (item.vendor === vendor) return sum
      return sum + pendingQty(line.slug, item.vendor, store)
    }, 0)
    return Math.max(0, qty(line.quantity) - totalSaved(line) - others)
  }

  const pendingOnLine = (line: QuoteLine) =>
    columns.reduce((sum, item) => sum + pendingQty(line.slug, item.vendor), 0)

  const leftOnLine = (line: QuoteLine) => Math.max(0, qty(line.quantity) - totalSaved(line) - pendingOnLine(line))

  const setPendingQty = (line: QuoteLine, vendor: string, value: string) => {
    const key = pendingKey(line.slug, vendor)
    setPending((current) => {
      const next = { ...current }
      const trimmed = value.trim()
      if (trimmed === '') {
        next[key] = ''
        return next
      }
      if (trimmed === '.' || trimmed.endsWith('.')) {
        if (/^\d*\.$/.test(trimmed)) next[key] = trimmed.startsWith('.') ? `0${trimmed}` : trimmed
        return next
      }
      if (!/^\d*\.?\d{0,3}$/.test(trimmed)) return current
      const numeric = Number(trimmed)
      if (Number.isNaN(numeric) || numeric < 0) return current
      next[key] = numeric === 0 ? trimmed : trimmed.replace(/^0+(?=\d)/, '')
      return next
    })
  }

  const qtyOverLimit = (line: QuoteLine, vendor: string) => {
    const amount = pendingQty(line.slug, vendor)
    return amount > 0 && amount > availableFor(line, vendor)
  }

  const fillRemaining = (line: QuoteLine, vendor: string) => {
    const key = pendingKey(line.slug, vendor)
    setPending((current) => {
      const available = availableFor(line, vendor, current)
      const next = { ...current }
      if (available <= 0) delete next[key]
      else next[key] = String(available)
      return next
    })
  }

  const pendingInput = (line: QuoteLine, vendor: string) => pending[pendingKey(line.slug, vendor)] ?? ''

  const pendingEntries = Object.entries(pending).filter(([, value]) => qty(value) > 0)
  const hasPending = pendingEntries.length > 0
  const hasQtyError = lines.some((line) => columns.some((column) => qtyOverLimit(line, column.vendor)))
  const canAct = Boolean(rfq) && canAward && !saving && !clearing && !resetOpen && !saveOpen

  const pendingAwards = pendingEntries.flatMap(([key, quantity]) => {
    const [lineSlug, vendor] = key.split('::')
    const line = lines.find((item) => item.slug === lineSlug)
    if (!line || !vendor) return []
    const amount = qty(quantity)
    const unitPrice = qty(quoteFor(line, vendor)?.unit_price)
    return [
      {
        key,
        line,
        vendor,
        amount,
        total: amount * unitPrice,
      },
    ]
  })

  const saveDescription = (() => {
    const notes = lines.flatMap((line) => {
      const waiting = pendingOnLine(line)
      if (waiting <= 0) return []
      const after = totalSaved(line) + waiting
      const requested = qty(line.quantity)
      if (after + 1e-9 < requested) return []
      const partners = columns
        .filter((column) => savedQty(line, column.vendor) + pendingQty(line.slug, column.vendor) > 0)
        .map((column) => vendorName(column.vendor))
      const split = partners.length > 1 ? `, split with ${partners.join(', ')}` : ''
      return [
        `This completes ${line.description} (${formatQuantity(after)} of ${formatQuantity(requested)} ${line.unit}${split}).`,
      ]
    })
    const tail = 'Each vendor with awarded items gets its own purchase order. Saved quantities are locked.'
    return notes.length ? `${notes.join(' ')} ${tail}` : tail
  })()

  const savedTotal = lines.reduce((sum, line) => {
    return (
      sum +
      columns.reduce((lineSum, item) => {
        const amount = savedQty(line, item.vendor)
        return lineSum + amount * qty(quoteFor(line, item.vendor)?.unit_price)
      }, 0)
    )
  }, 0)
  const pendingTotal = lines.reduce((sum, line) => {
    return (
      sum +
      columns.reduce((lineSum, item) => {
        const amount = pendingQty(line.slug, item.vendor)
        return lineSum + amount * qty(quoteFor(line, item.vendor)?.unit_price)
      }, 0)
    )
  }, 0)

  const vendorCards = columns
    .map((column) => {
      const items = lines
        .map((line) => {
          const saved = savedQty(line, column.vendor)
          const waiting = pendingQty(line.slug, column.vendor)
          const amount = saved + waiting
          if (amount <= 0) return null
          const price = qty(quoteFor(line, column.vendor)?.unit_price)
          return {
            description: line.description,
            unit: line.unit,
            amount,
            total: amount * price,
            pending: waiting > 0,
          }
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
      return {
        vendor: column.vendor,
        items,
        pending: items.some((item) => item.pending),
        total: items.reduce((sum, item) => sum + item.total, 0),
        orders: relatedOrders.filter((order) => order.vendor === column.vendor).length,
        order: relatedOrders.find((order) => order.vendor === column.vendor),
      }
    })
    .filter((card) => card.items.length > 0)

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

  const refresh = async (nextRfq: QuoteRequest) => {
    setRfq(nextRfq)
    if (slug) setPurchase(await getPurchaseRequest(slug))
  }

  const saveAwards = async () => {
    if (!rfq || !hasPending) return
    const saved = await selectQuoteRequestLines(
      rfq.slug,
      pendingEntries.map(([key, quantity]) => {
        const [line, vendor] = key.split('::')
        return { line, vendor, quantity }
      }),
    )
    setPending({})
    await refresh(saved)
  }

  const onClearAward = async (line: QuoteLine, vendor: string) => {
    if (!rfq || clearing) return
    const key = pendingKey(line.slug, vendor)
    setClearing(key)
    setActionError('')
    try {
      const saved = await clearQuoteRequestAward(rfq.slug, line.slug, vendor)
      await refresh(saved)
    } catch (err) {
      setActionError(formatApiError(err))
    } finally {
      setClearing('')
    }
  }

  const onSaveAwards = async () => {
    if (!rfq || !hasPending || saving) return false
    setSaving(true)
    setActionError('')
    try {
      await saveAwards()
      return true
    } catch (err) {
      setActionError(formatApiError(err))
      return false
    } finally {
      setSaving(false)
    }
  }

  const columnCount = Math.max(columns.length, 1)

  return (
    <PageShell className="flex min-h-full max-w-full flex-col bg-white">
      <InlineStatus loading={purchaseLoading || rfqLoading} loadingLabel="Loading award…" />
      {permissionDenied && <PermissionNotice action="cannot award this quote request" />}
      {!permissionDenied && <InlineStatus error={loadError} />}
      {!permissionDenied && rfqError ? <InlineStatus error={rfqError} /> : null}
      {actionError && isPermissionError(actionError) && <PermissionNotice action="cannot update this award" />}
      {actionError && !isPermissionError(actionError) && <InlineStatus error={actionError} />}

      {purchase && (
        <div className="flex flex-1 flex-col gap-8">
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
            <QuotesStepper current={2} />
          </header>

          {!rfq && !rfqLoading && !rfqError && (
            <p className="text-sm text-gray-500">Start a quote request from this purchase first.</p>
          )}
          {rfq && !canAward && (
            <p className="text-sm text-gray-500">Record vendor quotes before awarding lines.</p>
          )}

          {rfq ? (
            <section className="flex flex-col gap-5">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-neutral-900">Compare and award</h2>
                <p className="mt-1 max-w-3xl text-sm text-gray-500">
                  Award one item now and the rest later. Picked the wrong vendor? Use Clear choice to leave that line
                  for later. Only vendors who quoted an item can be chosen.
                </p>
              </div>

              <div className="-mx-4 overflow-x-auto overscroll-x-contain pb-1 sm:-mx-0">
                <div
                  className="inline-block min-w-full align-top"
                  style={{
                    minWidth: `calc(240px + ${Math.max(columnCount, 1)} * 200px)`,
                  }}
                >
                  <div className="grid border-b border-gray-200" style={gridCols(columnCount)}>
                    <div
                      className={cn(
                        headerPad,
                        'sticky left-0 z-10 border-r border-gray-100 bg-white text-sm font-medium text-gray-400',
                      )}
                    >
                      Item
                    </div>
                    {columns.map((item) => (
                      <div
                        key={item.vendor}
                        title={vendorName(item.vendor)}
                        className={cn(headerPad, 'truncate border-l border-gray-50 text-sm font-medium text-gray-400')}
                      >
                        {vendorName(item.vendor)}
                      </div>
                    ))}
                  </div>

                  {lines.map((line) => {
                    const requested = qty(line.quantity)
                    const saved = totalSaved(line)
                    const waiting = pendingOnLine(line)
                    const left = leftOnLine(line)
                    const lowest = cheapestVendor(line)
                    const lineComplete = saved >= requested && requested > 0
                    return (
                      <div
                        key={line.slug}
                        className="grid items-stretch border-b border-gray-100 last:border-b-0"
                        style={gridCols(columnCount)}
                      >
                        <div
                          className={cn(
                            cellPad,
                            'sticky left-0 z-10 border-r border-gray-100 bg-white',
                          )}
                        >
                          <p className="text-sm font-semibold text-neutral-900">{line.description}</p>
                          <p className="mt-1 text-xs text-gray-400">
                            {formatQuantity(line.quantity)} {line.unit} requested
                          </p>
                          <div className="mt-3 flex h-1.5 max-w-44 overflow-hidden rounded-full bg-gray-200">
                            <span
                              className="h-full bg-neutral-900"
                              style={{ width: `${requested ? (saved / requested) * 100 : 0}%` }}
                            />
                            <span
                              className="h-full bg-amber-300"
                              style={{ width: `${requested ? (waiting / requested) * 100 : 0}%` }}
                            />
                          </div>
                          <p className="mt-1.5 text-xs leading-relaxed text-gray-400">
                            {formatQuantity(saved)} saved · {formatQuantity(waiting)} pending ·{' '}
                            {formatQuantity(left)} left
                          </p>
                        </div>

                        {columns.map((column) => {
                          const quote = quoteFor(line, column.vendor)
                          const awarded = savedQty(line, column.vendor)
                          const waitingQty = pendingQty(line.slug, column.vendor)
                          const vendorCap = availableFor(line, column.vendor)
                          const unitPrice = qty(quote?.unit_price)
                          const leftoverAfter = Math.max(0, vendorCap - waitingQty)
                          const overLimit = qtyOverLimit(line, column.vendor)
                          const vendorCell = cn(cellPad, 'border-l border-gray-50')
                          if (!quote) {
                            return <div key={column.vendor} className={vendorCell} />
                          }
                          if (awarded > 0) {
                            const clearKey = pendingKey(line.slug, column.vendor)
                            const isClearing = clearing === clearKey
                            return (
                              <div key={column.vendor} className={cn(vendorCell, 'bg-[#e8e8e8]')}>
                                <span className="inline-flex max-w-full items-center rounded-full bg-neutral-800 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-white">
                                  {formatQuantity(awarded)} {line.unit} awarded
                                </span>
                                <p className="mt-3 text-sm leading-relaxed text-gray-500">
                                  {money(unitPrice)} / {line.unit}
                                </p>
                                <p className="mt-0.5 text-sm font-medium text-neutral-800">{money(awarded * unitPrice)}</p>
                                {canAward ? (
                                  <button
                                    type="button"
                                    className="mt-3 text-sm text-gray-500 underline disabled:opacity-50"
                                    disabled={!canAct || isClearing}
                                    onClick={() => void onClearAward(line, column.vendor)}
                                  >
                                    {isClearing ? 'Clearing…' : 'Clear choice'}
                                  </button>
                                ) : null}
                              </div>
                            )
                          }
                          if (lineComplete) {
                            return (
                              <div key={column.vendor} className={vendorCell}>
                                <p className="text-sm text-neutral-800">
                                  {money(unitPrice)} / {line.unit}
                                </p>
                                <p className="mt-1 text-sm text-gray-400">Fully awarded</p>
                              </div>
                            )
                          }
                          return (
                            <div key={column.vendor} className={vendorCell}>
                              {waitingQty > 0 ? (
                                <p className="text-sm font-medium text-neutral-800">{line.description}</p>
                              ) : (
                                <div className="flex flex-col gap-1.5">
                                  <p className="text-sm text-neutral-800">
                                    {money(unitPrice)} / {line.unit}
                                  </p>
                                  {lowest === column.vendor ? (
                                    <span className="inline-flex w-fit items-center rounded-full bg-[#e7f6e4] px-2 py-0.5 text-[11px] font-medium text-[#3d9a4a]">
                                      Lowest
                                    </span>
                                  ) : null}
                                </div>
                              )}
                              <div className="mt-3 flex flex-col gap-1.5">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500">
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    autoComplete="off"
                                    placeholder="0"
                                    aria-invalid={overLimit || undefined}
                                    className={cn(
                                      'h-8 w-16 shrink-0 rounded-md border bg-white px-2 text-center text-sm outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50',
                                      overLimit
                                        ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20'
                                        : 'border-gray-300 focus-visible:border-ring focus-visible:ring-ring/50',
                                    )}
                                    value={pendingInput(line, column.vendor)}
                                    disabled={!canAct}
                                    onFocus={(event) => {
                                      const input = event.currentTarget
                                      requestAnimationFrame(() => input.select())
                                    }}
                                    onClick={(event) => event.currentTarget.select()}
                                    onChange={(event) => setPendingQty(line, column.vendor, event.target.value)}
                                  />
                                  <span className="whitespace-nowrap">of {formatQuantity(left)} left</span>
                                </div>
                                {overLimit ? (
                                  <p className="text-xs text-destructive">
                                    Max {formatQuantity(vendorCap)} {line.unit}
                                  </p>
                                ) : null}
                              </div>
                              {waitingQty > 0 ? (
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                  <span className="inline-flex items-center rounded-md bg-[#fff1c2] px-2 py-1 text-xs text-[#c4a035]">
                                    Pending {money(waitingQty * unitPrice)}
                                  </span>
                                  <button
                                    type="button"
                                    className="text-xs text-gray-500"
                                    disabled={!canAct}
                                    onClick={() => setPendingQty(line, column.vendor, '')}
                                  >
                                    × Clear
                                  </button>
                                </div>
                              ) : leftoverAfter > 0 && canAct ? (
                                <button
                                  type="button"
                                  className="mt-3 text-sm text-gray-400 hover:text-neutral-800"
                                  onClick={() => fillRemaining(line, column.vendor)}
                                >
                                  Fill remaining ({formatQuantity(leftoverAfter)})
                                </button>
                              ) : null}
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>

              {vendorCards.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {vendorCards.map((card) => (
                    <article
                      key={card.vendor}
                      className={cn(
                        'rounded-2xl px-5 py-4',
                        card.pending ? 'bg-[#fff8e0]' : 'bg-[#e8f6ea]',
                      )}
                    >
                      <p className="text-sm font-medium text-neutral-900">
                        {vendorName(card.vendor)} - {card.items.length} {card.items.length === 1 ? 'item' : 'items'}
                        {card.pending ? ', pending' : ''}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {card.items
                          .map((item) => `${item.description} ${formatQuantity(item.amount)} ${item.unit}`)
                          .join(', ')}
                      </p>
                      <p className="mt-3 text-sm font-semibold text-neutral-900">
                        {money(card.total)} · {card.orders || 1} purchase order
                      </p>
                    </article>
                  ))}
                </div>
              ) : null}

              <p className="text-sm text-gray-500">
                Saved quantities are locked.{' '}
                <button
                  type="button"
                  className="font-medium text-neutral-900 underline disabled:opacity-50"
                  disabled={!rfq || saving}
                  onClick={() => setResetOpen(true)}
                >
                  Reset the RFQ
                </button>{' '}
                or fail a quality check to reopen a line.
              </p>
            </section>
          ) : null}
        </div>
      )}

      {purchase && rfq ? (
        <div className="-mx-4 mt-auto flex flex-col gap-3 border-t border-gray-200 bg-white px-4 py-4 sm:-mx-7 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <p className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
            <span>
              Saved <span className="font-semibold text-neutral-900">{money(savedTotal)}</span>
            </span>
            <span>
              Pending <span className="font-semibold text-neutral-900">{money(pendingTotal)}</span>
            </span>
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button type="button" variant="outline" className={outlineButton} onClick={() => navigate(quotesPath)}>
              Back to Quotes
            </Button>
            <Button
              type="button"
              variant="outline"
              className={outlineButton}
              disabled={!canAct || !hasPending || hasQtyError}
              onClick={() => setSaveOpen(true)}
            >
              {saving ? 'Saving…' : 'Save awards'}
            </Button>
            <Button
              type="button"
              variant="dark"
              className="h-8 w-full px-3.5 text-sm font-normal sm:w-auto"
              onClick={() => navigate(ordersPath)}
            >
              Continue to purchase order
            </Button>
          </div>
        </div>
      ) : null}

      {rfq ? (
        <>
          <ConfirmDeleteDialog
            open={saveOpen}
            onOpenChange={setSaveOpen}
            title="Save these awards?"
            description={saveDescription}
            permissionAction="cannot update this award"
            confirmLabel="Save awards"
            pendingLabel="Saving…"
            confirmVariant="dark"
            contentClassName="max-w-lg gap-5"
            onConfirm={saveAwards}
            onDeleted={() => setActionError('')}
          >
            <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
              {pendingAwards.map((row) => (
                <div
                  key={row.key}
                  className="flex flex-col gap-1 rounded-lg border border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <p className="min-w-0 text-sm text-neutral-800">
                    <span className="wrap-break-word">{row.line.description}</span>
                    <span className="text-gray-400"> · </span>
                    <span className="whitespace-nowrap">
                      {formatQuantity(row.amount)} {row.line.unit}
                    </span>
                  </p>
                  <p className="min-w-0 text-sm font-semibold text-neutral-900 sm:text-right">
                    <span className="wrap-break-word">{vendorName(row.vendor)}</span>
                    <span className="text-neutral-900"> · </span>
                    <span className="whitespace-nowrap">{money(row.total)}</span>
                  </p>
                </div>
              ))}
            </div>
          </ConfirmDeleteDialog>
          <ConfirmDeleteDialog
            open={resetOpen}
            onOpenChange={setResetOpen}
            title="Reset quote request"
            description="Are you sure you want to reset this RFQ? Saved awards on this request will need to be recorded again."
            permissionAction="cannot reset this quote request"
            confirmLabel="Reset"
            pendingLabel="Resetting…"
            onConfirm={async () => {
              const saved = await requestQuoteRequestRevision(rfq.slug)
              setPending({})
              await refresh(saved)
            }}
            onDeleted={() => setActionError('')}
          />
        </>
      ) : null}
    </PageShell>
  )
}

export default RequestQuotesAward
