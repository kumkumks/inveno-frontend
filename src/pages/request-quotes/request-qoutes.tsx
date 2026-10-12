import { Plus } from 'lucide-react'
import { PageShell } from '@/components/common/page-shell'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

const STEPS = [
  { n: 1, label: 'Quotes' },
  { n: 2, label: 'Award' },
  { n: 3, label: 'Purchase orders' },
] as const

const VENDORS = ['Northstar', 'Paperlane', 'Desk Supply'] as const

const LINES = [
  {
    item: 'A4 recycled copier paper — 500 sheets',
    prices: ['US$5.80 / ream', 'US$5.45 / ream', 'US$6.10 / ream'],
  },
  {
    item: 'Blue gel pens, 0.7 mm — pack of 12',
    prices: ['US$8.40 / pack', 'US$8.95 / pack', 'US$7.80 / pack'],
  },
  {
    item: 'A5 spiral notebooks — 120 ruled pages',
    prices: ['US$3.20 / each', 'US$2.95 / each', 'US$3.40 / each'],
  },
]

const VENDOR_CARDS = ['Apex Supplies', 'Summit Trading', 'Atlas Industrial'] as const

const outlineButton = 'h-8 w-fit shrink-0 px-3.5 text-sm font-normal'

const headCell = 'h-10 px-3 text-left text-sm font-normal text-gray-500'

const RequestQuotes = () => {
  return (
    <PageShell className="max-w-full bg-white">
      <div className="flex flex-col gap-8 sm:gap-10">
        <header>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight wrap-break-word text-neutral-900 sm:text-[28px]">
                Q3 pantry restock
              </h1>
              <span className="mt-2 inline-flex items-center rounded-full bg-[#fde8d0] px-2.5 py-0.5 text-xs font-medium text-[#c47a3a]">
                In review
              </span>
            </div>
            <Button type="button" variant="outline" className={outlineButton}>
              Export comparison PDF
            </Button>
          </div>

          <ol className="mt-6 flex items-center gap-4 overflow-x-auto border-y border-gray-200 py-3 sm:mt-8 sm:gap-8">
            {STEPS.map((step) => {
              const active = step.n === 1
              return (
                <li key={step.n} className="flex shrink-0 items-center gap-2">
                  <span
                    className={cn(
                      'flex size-6 items-center justify-center rounded-full text-xs font-medium',
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
        </header>

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-neutral-900">Quotes recorded</h2>
              <p className="mt-1 text-sm text-gray-500">Prices per unit, as given by each vendor.</p>
            </div>
            <Button type="button" variant="outline" className={outlineButton}>
              Record quote
            </Button>
          </div>

          <div className="-mx-4 overflow-x-auto sm:mx-0">
            <Table className="w-full min-w-[640px]">
              <TableHeader>
                <TableRow className="border-b border-gray-200 hover:bg-transparent">
                  <TableHead className={`${headCell} min-w-52`}>Item</TableHead>
                  {VENDORS.map((vendor) => (
                    <TableHead key={vendor} className={`${headCell} min-w-32`}>
                      {vendor}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {LINES.map((line) => (
                  <TableRow key={line.item} className="border-b border-gray-200 hover:bg-transparent">
                    <TableCell className="max-w-80 px-3 py-3.5 text-sm whitespace-normal text-neutral-800">
                      {line.item}
                    </TableCell>
                    {line.prices.map((price, index) => (
                      <TableCell key={VENDORS[index]} className="px-3 py-3.5 text-sm whitespace-nowrap text-neutral-800">
                        {price}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
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
            <Button type="button" variant="outline" className={outlineButton}>
              <Plus className="size-4" />
              Add vendor
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
            {VENDOR_CARDS.map((name) => (
              <article
                key={name}
                className="flex min-w-0 flex-col gap-8 rounded-xl border border-gray-200 bg-white px-5 py-4"
              >
                <h3 className="text-base font-semibold wrap-break-word text-neutral-900">{name}</h3>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex h-6 items-center rounded-full bg-gray-100 px-2.5 text-xs text-gray-500">
                    Quoted
                  </span>
                  <button type="button" className="shrink-0 text-sm text-[#e11d48]">
                    Reject
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="flex justify-stretch sm:justify-end">
          <Button type="button" variant="dark" className="h-9 w-full px-4 sm:w-auto">
            Continue to award
          </Button>
        </div>
      </div>
    </PageShell>
  )
}

export default RequestQuotes
