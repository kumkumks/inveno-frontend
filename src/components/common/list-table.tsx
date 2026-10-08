import type { ReactNode } from 'react'
import { ArrowUpDown, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TableHead } from '@/components/ui/table'
import { cn } from '@/lib/utils'

export const tableHeadClass =
  'h-11 px-3 text-left text-[11px] font-medium uppercase tracking-wide text-gray-500'

export function SortableHead({ label }: { label: string }) {
  return (
    <TableHead className={tableHeadClass}>
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown className="size-3 text-gray-400" />
      </span>
    </TableHead>
  )
}

export function ListSearch({ placeholder }: { placeholder: string }) {
  return (
    <section className="mb-6 mt-3">
      <div className="flex min-w-0 items-center gap-3">
        <Input className="w-1/2 rounded-md border-gray-300" type="text" placeholder={placeholder} />
        <Button variant="dark">
          Search
          <Search size={16} className="ml-2 text-white" />
        </Button>
      </div>
    </section>
  )
}

export function StatusPill({
  children,
  className,
}: {
  children: ReactNode
  className: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        className,
      )}
    >
      {children}
    </span>
  )
}

export const purchaseStatusStyle = {
  approved: 'bg-[#e7f6e4] text-[#3d9a4a]',
  submitted: 'bg-[#fff6d8] text-[#b8860b]',
  revision_requested: 'bg-[#fde8dc] text-[#c47b5a]',
  declined: 'bg-[#fde8e8] text-[#e11d48]',
  draft: 'bg-gray-100 text-gray-500',
} as const

export function statusLabel(status: string) {
  const text = status.replaceAll('_', ' ')
  return text.charAt(0).toUpperCase() + text.slice(1)
}
