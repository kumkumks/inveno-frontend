import { useEffect } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormField } from '@/components/common/form-field'
import { InlineStatus } from '@/components/common/inline-status'
import { PermissionNotice } from '@/components/common/permission-notice'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatApiError, isPermissionError } from '@/lib/errors'
import { recordQuoteSchema, type RecordQuoteForm } from '@/lib/schemas/purchase'
import type { QuoteLine, QuoteRequestVendor, Vendor } from '@/lib/types'
import { recordVendorQuote } from '@/services/purchases'

export function RecordQuoteDialog({
  open,
  onOpenChange,
  rfqSlug,
  lines,
  vendors,
  names,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  rfqSlug: string
  lines: QuoteLine[]
  vendors: QuoteRequestVendor[]
  names: Vendor[]
  onSaved: (rfq: Awaited<ReturnType<typeof recordVendorQuote>>) => void
}) {
  const eligible = vendors.filter((item) => item.status !== 'rejected')
  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RecordQuoteForm>({
    resolver: zodResolver(recordQuoteSchema),
    defaultValues: { vendor: '', notes: '', lines: [] },
  })
  const { fields } = useFieldArray({ control, name: 'lines' })
  const vendor = watch('vendor')
  const error = errors.root?.message ?? errors.lines?.message ?? ''

  useEffect(() => {
    if (!open) return
    const first = vendors.find((item) => item.status !== 'rejected')?.vendor ?? ''
    reset({
      vendor: first,
      notes: '',
      lines: lines.map((line) => ({
        line: line.slug,
        description: line.description,
        unit: line.unit,
        unit_price: String(line.quotes.find((quote) => quote.vendor === first)?.unit_price ?? ''),
      })),
    })
  }, [open, lines, vendors, reset])

  useEffect(() => {
    if (!open || !vendor) return
    lines.forEach((line, index) => {
      const existing = line.quotes.find((quote) => quote.vendor === vendor)
      setValue(`lines.${index}.unit_price`, existing ? String(existing.unit_price) : '')
    })
  }, [vendor, lines, open, setValue])

  const close = (next: boolean) => {
    if (isSubmitting) return
    onOpenChange(next)
  }

  const onSave = async (data: RecordQuoteForm) => {
    clearErrors('root')
    try {
      const saved = await recordVendorQuote(rfqSlug, {
        vendor: data.vendor,
        notes: data.notes,
        lines: data.lines.map((line) => ({ line: line.line, unit_price: line.unit_price })),
      })
      onSaved(saved)
      onOpenChange(false)
    } catch (err) {
      setError('root', { type: 'server', message: formatApiError(err) })
    }
  }

  const vendorName = (slug: string) => names.find((item) => item.slug === slug)?.name ?? slug

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record quote</DialogTitle>
          <DialogDescription>Enter the unit prices this vendor gave you.</DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSave)}>
          <FormField label="Vendor" htmlFor="quote-vendor" error={errors.vendor?.message}>
            <Controller
              control={control}
              name="vendor"
              render={({ field }) => (
                <Select value={field.value || null} onValueChange={(value) => field.onChange(value ?? '')}>
                  <SelectTrigger id="quote-vendor">
                    <SelectValue placeholder="Choose a vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {eligible.map((item) => (
                      <SelectItem key={item.vendor} value={item.vendor}>
                        {vendorName(item.vendor)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          {fields.map((field, index) => (
            <FormField
              key={field.id}
              label={`${field.description} (${field.unit})`}
              htmlFor={`quote-price-${field.line}`}
              error={errors.lines?.[index]?.unit_price?.message}
            >
              <Input
                id={`quote-price-${field.line}`}
                inputMode="decimal"
                placeholder="0.00"
                {...register(`lines.${index}.unit_price`)}
              />
            </FormField>
          ))}
          <FormField label="Notes" htmlFor="quote-notes" error={errors.notes?.message}>
            <Input id="quote-notes" {...register('notes')} />
          </FormField>
          {error && isPermissionError(error) && <PermissionNotice action="cannot record a quote" />}
          {error && !isPermissionError(error) && <InlineStatus error={error} />}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => close(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || eligible.length === 0}>
              {isSubmitting ? 'Saving…' : 'Save quote'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
