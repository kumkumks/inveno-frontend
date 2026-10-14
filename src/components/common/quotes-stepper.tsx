import type { QuoteRequestStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

const STEPS = [
  { n: 1, label: 'Quotes' },
  { n: 2, label: 'Award' },
  { n: 3, label: 'Purchase orders' },
] as const

export function awardStepFor(status?: QuoteRequestStatus, hasPurchaseOrder = false) {
  if (hasPurchaseOrder) return 3
  if (status === 'in_review' || status === 'awarding') return 2
  return 1
}

export function QuotesStepper({ current }: { current: number }) {
  return (
    <ol className="mt-6 flex items-center gap-4 overflow-x-auto border-y border-gray-200 py-3 sm:mt-8 sm:gap-8">
      {STEPS.map((step) => {
        const active = step.n === current
        return (
          <li key={step.n} className="flex shrink-0 items-center gap-2">
            <span
              className={cn(
                'flex size-6 items-center justify-center rounded-full text-xs font-medium',
                active ? 'bg-neutral-900 text-white' : 'bg-gray-100 text-gray-400',
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
