import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { FormField } from '@/components/common/form-field'
import { InlineStatus } from '@/components/common/inline-status'
import { purchaseLineFormSchema, type PurchaseLineForm } from '@/lib/schemas/purchase'
import type { Item } from '@/lib/types'

const fieldClass = 'h-8 w-full rounded-sm border border-gray-400 bg-white text-sm text-gray-800'

const emptyLine: PurchaseLineForm = {
  description: '',
  quantity: '',
  item: '',
  unit: '',
}

export function PurchaseLineDialog({
  open,
  onOpenChange,
  items,
  itemsLoading,
  itemsError,
  onAdd,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: Item[]
  itemsLoading: boolean
  itemsError: string
  onAdd: (line: PurchaseLineForm) => void
}) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<PurchaseLineForm>({
    resolver: zodResolver(purchaseLineFormSchema),
    defaultValues: emptyLine,
  })

  const close = (next: boolean) => {
    if (!next) reset(emptyLine)
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add line</DialogTitle>
          <DialogDescription>Add an item to this purchase request.</DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit((data) => {
            onAdd(data)
            reset(emptyLine)
            onOpenChange(false)
          })}
        >
          <FormField label="Description" htmlFor="line-description" error={errors.description?.message} labelClassName="text-gray-800">
            <Input id="line-description" className={fieldClass} {...register('description')} />
          </FormField>
          <FormField label="Qty" htmlFor="line-quantity" error={errors.quantity?.message} labelClassName="text-gray-800">
            <Input id="line-quantity" className={fieldClass} {...register('quantity')} />
          </FormField>
          <FormField label="Catalog item" htmlFor="line-item" error={errors.item?.message} labelClassName="text-gray-800">
            <Controller
              control={control}
              name="item"
              render={({ field }) => (
                <Select
                  value={field.value || null}
                  onValueChange={(value) => {
                    const slug = value ?? ''
                    field.onChange(slug)
                    const item = items.find((entry) => entry.slug === slug)
                    if (!item) return
                    if (!getValues('description')) setValue('description', item.name)
                    if (!getValues('unit')) setValue('unit', item.unit)
                  }}
                >
                  <SelectTrigger id="line-item" className={fieldClass}>
                    <SelectValue placeholder="Select catalog item" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item) => (
                      <SelectItem key={item.slug} value={item.slug}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <InlineStatus loading={itemsLoading} loadingLabel="Loading items…" />
          {itemsError ? <InlineStatus error={itemsError} /> : null}
          <FormField label="Unit" htmlFor="line-unit" error={errors.unit?.message} labelClassName="text-gray-800">
            <Input id="line-unit" className={fieldClass} {...register('unit')} />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => close(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="dark">
              Add line
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
