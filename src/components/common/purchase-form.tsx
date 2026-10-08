import { useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FormField } from '@/components/common/form-field'
import { InlineStatus } from '@/components/common/inline-status'
import { tableHeadClass } from '@/components/common/list-table'
import { PermissionNotice } from '@/components/common/permission-notice'
import { PurchaseLineDialog } from '@/components/common/purchase-line-dialog'
import { useAsyncResource } from '@/hooks/use-async-resource'
import { fieldMessage, formatApiError, isPermissionError } from '@/lib/errors'
import { listSpaces } from '@/lib/list'
import { purchaseAddSchema, SELECT_NONE, type PurchaseAddForm } from '@/lib/schemas/purchase'
import { listItems } from '@/services/items'
import type { CreatePurchasePayload, PurchaseLinePayload, PurchaseRequest } from '@/lib/types'

const fieldClass = 'h-10 w-full rounded-xl border-gray-200 bg-white px-4 text-sm text-gray-800'
const textareaClass =
  'min-h-24 w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

export function purchaseFormValues(request?: PurchaseRequest | null): PurchaseAddForm {
  return {
    title: request?.title ?? '',
    space: request?.space ?? '',
    notes: request?.notes ?? '',
    lines: (request?.lines ?? []).map((line) => ({
      description: line.description,
      quantity: String(Number(line.quantity)),
      unit: line.unit,
      item: line.item ?? '',
    })),
  }
}

type PurchaseFormProps = {
  defaultValues: PurchaseAddForm
  submitLabel: string
  permissionAction: string
  onSubmit: (payload: CreatePurchasePayload) => Promise<unknown>
  onCancel: () => void
}

export function PurchaseForm({ defaultValues, submitLabel, permissionAction, onSubmit, onCancel }: PurchaseFormProps) {
  const [lineOpen, setLineOpen] = useState(false)
  const { data: spaceOptions = [], error: spaceError, loading: spaceLoading } = useAsyncResource(listSpaces, [])
  const { data: catalogItems = [], error: itemsError, loading: itemsLoading } = useAsyncResource(listItems, [])
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PurchaseAddForm>({
    resolver: zodResolver(purchaseAddSchema),
    defaultValues,
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'lines' })
  const catalogSlugs = new Set(catalogItems.map((item) => item.slug))
  const rootError = errors.root?.message

  const onSave = async (data: PurchaseAddForm) => {
    const payload: CreatePurchasePayload = {
      title: data.title.trim(),
      notes: data.notes.trim(),
      lines: data.lines
        .filter((line) => line.description && line.quantity && line.unit)
        .map(({ description, quantity, unit, item }): PurchaseLinePayload => {
          const line: PurchaseLinePayload = { description, quantity, unit }
          if (item && catalogSlugs.has(item)) line.item = item
          return line
        }),
    }
    if (data.space) payload.space = data.space

    try {
      await onSubmit(payload)
    } catch (error) {
      const body = isAxiosError(error) ? error.response?.data : undefined
      let hasFieldError = false

      if (body && typeof body === 'object') {
        const record = body as Record<string, unknown>
        for (const key of ['title', 'space', 'notes'] as const) {
          const message = fieldMessage(record[key])
          if (message) {
            setError(key, { type: 'server', message })
            hasFieldError = true
          }
        }

        const topItemError = fieldMessage(record.item)
        const lines = record.lines
        if (topItemError) {
          setError('lines', { type: 'server', message: topItemError })
          hasFieldError = true
        } else if (typeof lines === 'string') {
          setError('lines', { type: 'server', message: lines })
          hasFieldError = true
        } else if (Array.isArray(lines)) {
          const message = lines
            .map((row, index) => {
              if (typeof row === 'string') return `Line ${index + 1}: ${row}`
              if (!row || typeof row !== 'object') return ''
              const messages = Object.values(row).flatMap((value) => fieldMessage(value) ?? [])
              return messages.length ? `Line ${index + 1}: ${messages.join(' ')}` : ''
            })
            .filter(Boolean)
            .join(' ')
          if (message) {
            setError('lines', { type: 'server', message })
            hasFieldError = true
          }
        }
      }

      if (!hasFieldError) {
        setError('root', {
          type: 'server',
          message: formatApiError(error) || 'Unable to save this purchase request.',
        })
      }
    }
  }

  return (
    <>
      <InlineStatus loading={spaceLoading} loadingLabel="Loading spaces…" />
      {spaceError && <InlineStatus error={spaceError} />}

      <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSave)}>
        <div className="grid gap-6 md:grid-cols-2">
          <FormField label="Title" htmlFor="title" error={errors.title?.message} labelClassName="text-gray-800">
            <Input id="title" className={fieldClass} disabled={isSubmitting} {...register('title')} />
          </FormField>
          <FormField label="Space" htmlFor="space" error={errors.space?.message} labelClassName="text-gray-800">
            <Controller
              control={control}
              name="space"
              render={({ field }) => (
                <Select
                  value={field.value || SELECT_NONE}
                  onValueChange={(value) => field.onChange(value === SELECT_NONE ? '' : value ?? '')}
                >
                  <SelectTrigger id="space" className={fieldClass} disabled={isSubmitting}>
                    <SelectValue placeholder="Select space">
                      {(value: string) =>
                        value === SELECT_NONE
                          ? 'No space'
                          : spaceOptions.find((option) => option.slug === value)?.name ?? value
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SELECT_NONE}>No space</SelectItem>
                    {spaceOptions.map((option) => (
                      <SelectItem key={option.slug} value={option.slug}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
        </div>

        <FormField label="Note" htmlFor="notes" error={errors.notes?.message} labelClassName="text-gray-800">
          <textarea
            id="notes"
            className={textareaClass}
            placeholder="Type your message here."
            disabled={isSubmitting}
            {...register('notes')}
          />
        </FormField>

        <section className="overflow-x-auto">
          <h2 className="text-sm font-medium text-gray-800">Line items</h2>
          {errors.lines?.message ? <p className="mt-1 text-sm text-red-500">{errors.lines.message}</p> : null}
          {errors.lines?.root?.message ? (
            <p className="mt-1 text-sm text-red-500">{errors.lines.root.message}</p>
          ) : null}
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
              {fields.map((line, index) => (
                <TableRow key={line.id} className="border-b border-gray-200 hover:bg-transparent">
                  <TableCell className="px-3 py-3 text-sm text-neutral-800">{line.description || '—'}</TableCell>
                  <TableCell className="px-3 py-3 text-sm text-neutral-800">{line.quantity || '—'}</TableCell>
                  <TableCell className="px-3 py-3">
                    {line.item ? (
                      <Badge variant="dark" className="h-6 rounded-full px-2.5">
                        {catalogItems.find((item) => item.slug === line.item)?.name ?? line.item}
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
                      disabled={isSubmitting}
                      onClick={() => remove(index)}
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
            disabled={isSubmitting}
            onClick={() => setLineOpen(true)}
          >
            <Plus className="size-4" />
            Add line
          </Button>
        </section>

        {rootError && isPermissionError(rootError) && <PermissionNotice action={permissionAction} />}
        {rootError && !isPermissionError(rootError) && <InlineStatus error={rootError} />}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" className="h-9 rounded-full px-4" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="dark" className="h-9 rounded-full px-4" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : submitLabel}
          </Button>
        </div>
      </form>
      <PurchaseLineDialog
        open={lineOpen}
        onOpenChange={setLineOpen}
        items={catalogItems}
        itemsLoading={itemsLoading}
        itemsError={itemsError}
        onAdd={(line) => append(line)}
      />
    </>
  )
}
