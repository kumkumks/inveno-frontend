import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FormField } from '@/components/common/form-field'
import { tableHeadClass } from '@/components/common/list-table'
import { PageShell, PageTitle } from '@/components/common/page-shell'

const fieldClass = 'h-10 w-full rounded-xl border-gray-200 bg-white px-4 text-sm text-gray-800'
const textareaClass =
  'min-h-24 w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

const spaces = [
  { slug: 'sfs-public-school', name: 'SFS Public School' },
  { slug: 'sfs-academy', name: 'SFS Academy' },
  { slug: 'sfs-high-school', name: 'SFS High School' },
  { slug: 'organization', name: 'Organization level' },
]

type LineDraft = {
  id: string
  description: string
  quantity: string
  item: string
  unit: string
}

function newLine(partial?: Partial<LineDraft>): LineDraft {
  return {
    id: crypto.randomUUID(),
    description: '',
    quantity: '',
    item: '',
    unit: '',
    ...partial,
  }
}

const Purchase_add = () => {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [space, setSpace] = useState('')
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<LineDraft[]>([
    newLine({ description: 'A4 Paper', quantity: '10', item: 'a4-paper', unit: 'ream' }),
  ])

  const goBack = () => navigate('/purchase-requests')

  return (
    <PageShell className="max-w-full bg-white">
      <PageTitle
        className="h2 break-words"
        description="Create a new purchase request"
        action={
          <Button type="button" variant="outline" className="h-9 rounded-full px-4" onClick={goBack}>
            <ArrowLeft className="size-4" />
            Go back
          </Button>
        }
      >
        New Purchase Request
      </PageTitle>

      <form
        className="flex flex-col gap-8"
        onSubmit={(event) => {
          event.preventDefault()
        }}
      >
        <div className="grid gap-6 md:grid-cols-2">
          <FormField label="Title" htmlFor="title" labelClassName="text-gray-800">
            <Input id="title" className={fieldClass} value={title} onChange={(event) => setTitle(event.target.value)} />
          </FormField>
          <FormField label="Space" htmlFor="space" labelClassName="text-gray-800">
            <Select value={space || null} onValueChange={(value) => setSpace(value ?? '')}>
              <SelectTrigger id="space" className={fieldClass}>
                <SelectValue placeholder="Select space" />
              </SelectTrigger>
              <SelectContent>
                {spaces.map((option) => (
                  <SelectItem key={option.slug} value={option.slug}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <FormField label="Note" htmlFor="notes" labelClassName="text-gray-800">
          <textarea
            id="notes"
            className={textareaClass}
            placeholder="Type your message here."
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </FormField>

        <section>
          <h2 className="text-sm font-medium text-gray-800">Line items</h2>
          <Table className="mt-3 w-full min-w-[720px]">
            <TableHeader>
              <TableRow className="border-b border-gray-200 hover:bg-transparent">
                <TableHead className={tableHeadClass}>Description</TableHead>
                <TableHead className={tableHeadClass}>Qty</TableHead>
                <TableHead className={tableHeadClass}>Catalog item</TableHead>
                <TableHead className={tableHeadClass}>Unit</TableHead>
                <TableHead className={`${tableHeadClass} w-16`}>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((line) => (
                <TableRow key={line.id} className="border-b border-gray-200 hover:bg-transparent">
                  <TableCell className="px-3 py-3 text-sm text-neutral-800">{line.description || '—'}</TableCell>
                  <TableCell className="px-3 py-3 text-sm text-neutral-800">{line.quantity || '—'}</TableCell>
                  <TableCell className="px-3 py-3">
                    {line.item ? (
                      <Badge variant="dark" className="h-6 rounded-full px-2.5">
                        {line.item}
                      </Badge>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-3 py-3 text-sm text-neutral-800">{line.unit || '—'}</TableCell>
                  <TableCell className="px-3 py-3">
                    <button
                      type="button"
                      aria-label="Remove line"
                      className="text-[#e11d48] disabled:opacity-40"
                      disabled={lines.length === 1}
                      onClick={() => setLines((current) => current.filter((item) => item.id !== line.id))}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button
            type="button"
            variant="outline"
            className="mt-4 h-9 rounded-full px-4"
            onClick={() => setLines((current) => [...current, newLine()])}
          >
            <Plus className="size-4" />
            Add line
          </Button>
        </section>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" className="h-9 rounded-full px-4" onClick={goBack}>
            Cancel
          </Button>
          <Button type="submit" variant="dark" className="h-9 rounded-full px-4">
            Save draft
          </Button>
        </div>
      </form>
    </PageShell>
  )
}

export default Purchase_add
