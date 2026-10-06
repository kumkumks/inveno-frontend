import { useState, type FormEvent } from 'react'
import { Controller, useForm } from 'react-hook-form'
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
import { PermissionNotice } from '@/components/common/permission-notice'
import { useAsyncResource } from '@/hooks/use-async-resource'
import { formatApiError, isPermissionError } from '@/lib/errors'
import type { UpdateItemPayload } from '@/lib/types'
import {
  createCategory,
  createNamedEntity,
  createWarehouse,
  listCategories,
  listWarehouses,
} from '@/services/items'
import { SELECT_NONE } from '@/lib/schemas/purchase'

const fieldClass =
  'h-8 w-full rounded-sm border border-gray-400 bg-white text-sm text-gray-800'

const textareaClass =
  'w-full resize-y rounded-sm border border-gray-400 bg-white px-2.5 py-2 text-sm text-gray-800 outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

function NamedEntityDialog({
  open,
  onOpenChange,
  title,
  description,
  label,
  htmlFor,
  placeholder,
  name,
  onNameChange,
  error,
  saving,
  submitLabel,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  label: string
  htmlFor: string
  placeholder: string
  name: string
  onNameChange: (value: string) => void
  error: string
  saving: boolean
  submitLabel: string
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <FormField label={label} htmlFor={htmlFor} className="gap-1.5" labelClassName="text-gray-800">
            <Input
              id={htmlFor}
              type="text"
              placeholder={placeholder}
              className={fieldClass}
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              autoFocus
            />
          </FormField>
          <InlineStatus error={error} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export const emptyItemFormValues: UpdateItemPayload = {
  warehouse: '',
  name: '',
  unit: '',
  description: '',
  part_number: '',
  alternate_part_number: '',
  category: '',
  location: '',
  remarks: '',
  last_purchase_date: '',
  last_purchase_quantity: '',
}

export function ItemForm({
  defaultValues,
  submitLabel,
  onSubmit,
  onCancel,
  includeLastPurchase = false,
  className,
}: {
  defaultValues: UpdateItemPayload
  submitLabel: string
  onSubmit: (data: UpdateItemPayload) => Promise<void>
  onCancel: () => void
  includeLastPurchase?: boolean
  className?: string
}) {
  const { data: categories = [], setData: setCategories } = useAsyncResource(listCategories, [])
  const { data: warehouses = [], setData: setWarehouses } = useAsyncResource(listWarehouses, [])
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [categoryName, setCategoryName] = useState('')
  const [categoryError, setCategoryError] = useState('')
  const [savingCategory, setSavingCategory] = useState(false)
  const [warehouseOpen, setWarehouseOpen] = useState(false)
  const [warehouseName, setWarehouseName] = useState('')
  const [warehouseError, setWarehouseError] = useState('')
  const [savingWarehouse, setSavingWarehouse] = useState(false)
  const [formError, setFormError] = useState('')

  const { register, handleSubmit, control, setValue, formState: { isSubmitting } } = useForm<UpdateItemPayload>({
    defaultValues,
  })

  const addCategory = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    return createNamedEntity({
      name: categoryName,
      emptyMessage: 'Enter a category name.',
      create: createCategory,
      setOptions: setCategories,
      onSelect: (slug) => setValue('category', slug),
      setError: setCategoryError,
      setSaving: setSavingCategory,
      reset: () => {
        setCategoryName('')
        setCategoryOpen(false)
      },
    })
  }

  const addWarehouse = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    return createNamedEntity({
      name: warehouseName,
      emptyMessage: 'Enter a warehouse name.',
      create: createWarehouse,
      setOptions: setWarehouses,
      onSelect: (slug) => setValue('warehouse', slug),
      setError: setWarehouseError,
      setSaving: setSavingWarehouse,
      reset: () => {
        setWarehouseName('')
        setWarehouseOpen(false)
      },
    })
  }

  const submit = async (data: UpdateItemPayload) => {
    setFormError('')
    const payload: UpdateItemPayload = {
      warehouse: data.warehouse,
      name: data.name,
      unit: data.unit,
      description: data.description,
      part_number: data.part_number,
      alternate_part_number: data.alternate_part_number,
      category: data.category,
      location: data.location,
      remarks: data.remarks,
    }
    if (includeLastPurchase) {
      payload.last_purchase_date = data.last_purchase_date || null
      payload.last_purchase_quantity = data.last_purchase_quantity || null
    }
    try {
      await onSubmit(payload)
    } catch (error) {
      setFormError(formatApiError(error))
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(submit)} className={className}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Item name" htmlFor="name" className="gap-1.5" labelClassName="text-gray-800">
            <Input id="name" type="text" placeholder="Item name" className={fieldClass} {...register('name')} />
          </FormField>
          <FormField
            label="Warehouse"
            htmlFor="warehouse"
            className="gap-1.5"
            labelClassName="text-gray-800"
            action={
              <Button
                type="button"
                onClick={() => {
                  setWarehouseError('')
                  setWarehouseOpen(true)
                }}
              >
                Add warehouse
              </Button>
            }
          >
            <Controller
              control={control}
              name="warehouse"
              render={({ field }) => (
                <Select
                  value={field.value || null}
                  onValueChange={(value) => field.onChange(value ?? '')}
                >
                  <SelectTrigger id="warehouse" className={fieldClass}>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent className="text-gray-800">
                    {warehouses.length === 0 ? (
                      <SelectItem value="__empty" disabled>
                        No warehouses yet
                      </SelectItem>
                    ) : (
                      warehouses.map((warehouse) => (
                        <SelectItem key={warehouse.slug} value={warehouse.slug}>
                          {warehouse.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <FormField label="Unit" htmlFor="unit" className="gap-1.5" labelClassName="text-gray-800">
            <Input id="unit" type="text" placeholder="pcs, kg, box" className={fieldClass} {...register('unit')} />
          </FormField>
          <FormField label="Location" htmlFor="location" className="gap-1.5" labelClassName="text-gray-800">
            <Input id="location" type="text" placeholder="Location" className={fieldClass} {...register('location')} />
          </FormField>
          <FormField label="Part number" htmlFor="part_number" className="gap-1.5" labelClassName="text-gray-800">
            <Input id="part_number" type="text" placeholder="Part number" className={fieldClass} {...register('part_number')} />
          </FormField>
          <FormField label="Alternate part number" htmlFor="alternate_part_number" className="gap-1.5" labelClassName="text-gray-800">
            <Input
              id="alternate_part_number"
              type="text"
              placeholder="Alternate part number"
              className={fieldClass}
              {...register('alternate_part_number')}
            />
          </FormField>
          <FormField
            label="Category"
            htmlFor="category"
            className="gap-1.5"
            labelClassName="text-gray-800"
            action={
              <Button
                type="button"
                onClick={() => {
                  setCategoryError('')
                  setCategoryOpen(true)
                }}
              >
                Add category
              </Button>
            }
          >
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select
                  value={field.value || SELECT_NONE}
                  onValueChange={(value) => field.onChange(value === SELECT_NONE ? '' : value ?? '')}
                >
                  <SelectTrigger id="category" className={fieldClass}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="text-gray-800">
                  <SelectItem value={SELECT_NONE}>No space</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.slug} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          {includeLastPurchase && (
            <>
              <FormField label="Last purchase date" htmlFor="last_purchase_date" className="gap-1.5" labelClassName="text-gray-800">
                <Input id="last_purchase_date" type="date" className={fieldClass} {...register('last_purchase_date')} />
              </FormField>
              <FormField label="Last purchase quantity" htmlFor="last_purchase_quantity" className="gap-1.5" labelClassName="text-gray-800">
                <Input
                  id="last_purchase_quantity"
                  type="text"
                  placeholder="10.000"
                  className={fieldClass}
                  {...register('last_purchase_quantity')}
                />
              </FormField>
            </>
          )}
        </div>

        <FormField label="Description" htmlFor="description" className="gap-1.5" labelClassName="text-gray-800">
          <textarea
            id="description"
            rows={3}
            placeholder="Description"
            className={textareaClass}
            {...register('description')}
          />
        </FormField>

        <FormField label="Remarks" htmlFor="remarks" className="gap-1.5" labelClassName="text-gray-800">
          <textarea
            id="remarks"
            rows={3}
            placeholder="Remarks"
            className={textareaClass}
            {...register('remarks')}
          />
        </FormField>

        {formError && isPermissionError(formError) && (
          <PermissionNotice action="cannot save this item" />
        )}
        {formError && !isPermissionError(formError) && <InlineStatus error={formError} />}

        <div className="flex items-center justify-end gap-2 border-t border-gray-200 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : submitLabel}
          </Button>
        </div>
      </form>

      <NamedEntityDialog
        open={categoryOpen}
        onOpenChange={(open) => {
          setCategoryOpen(open)
          if (!open) {
            setCategoryName('')
            setCategoryError('')
          }
        }}
        title="Add category"
        description="Create a category, then use it on this item."
        label="Category name"
        htmlFor="new-category"
        placeholder="Category name"
        name={categoryName}
        onNameChange={setCategoryName}
        error={categoryError}
        saving={savingCategory}
        submitLabel="Save category"
        onSubmit={addCategory}
      />

      <NamedEntityDialog
        open={warehouseOpen}
        onOpenChange={(open) => {
          setWarehouseOpen(open)
          if (!open) {
            setWarehouseName('')
            setWarehouseError('')
          }
        }}
        title="Add warehouse"
        description="Create a warehouse, then use it on this item."
        label="Warehouse name"
        htmlFor="new-warehouse"
        placeholder="Warehouse name"
        name={warehouseName}
        onNameChange={setWarehouseName}
        error={warehouseError}
        saving={savingWarehouse}
        submitLabel="Save warehouse"
        onSubmit={addWarehouse}
      />
    </>
  )
}
