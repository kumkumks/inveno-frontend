import api from '@/services/api'
import { Input } from '@/components/ui/input'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Controller, useForm } from 'react-hook-form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatApiError } from '@/lib/errors'
import { useNavigate } from 'react-router-dom'

type AddItemForm = {
  warehouse: string
  name: string
  unit: string
  description: string
  part_number: string
  alternate_part_number: string
  category: string
  location: string
  remarks: string
}

type NamedOption = {
  slug: string
  name: string
}

const fieldClass =
  'h-8 w-full rounded-sm border border-gray-400 bg-white text-sm text-gray-800'

function Field({
  label,
  htmlFor,
  children,
  action,
}: {
  label: string
  htmlFor: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={htmlFor} className="text-sm font-medium text-gray-800">
          {label}
        </label>
        {action}
      </div>
      {children}
    </div>
  )
}

function normalizeOptions(data: unknown): NamedOption[] {
  const list = Array.isArray(data)
    ? data
    : data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)
      ? data.results
      : []

  return list.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const record = item as Record<string, unknown>
    const name = typeof record.name === 'string' ? record.name : ''
    const slug =
      typeof record.slug === 'string'
        ? record.slug
        : typeof record.id === 'string' || typeof record.id === 'number'
          ? String(record.id)
          : name
    if (!name || !slug) return []
    return [{ slug, name }]
  })
}

const Item_add = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<NamedOption[]>([])
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [categoryName, setCategoryName] = useState('')
  const [categoryError, setCategoryError] = useState('')
  const [savingCategory, setSavingCategory] = useState(false)
  const [warehouses, setWarehouses] = useState<NamedOption[]>([])
  const [warehouseOpen, setWarehouseOpen] = useState(false)
  const [warehouseName, setWarehouseName] = useState('')
  const [warehouseError, setWarehouseError] = useState('')
  const [savingWarehouse, setSavingWarehouse] = useState(false)
  const [formError, setFormError] = useState('')

  const { register, handleSubmit, control, setValue, formState: { isSubmitting } } = useForm<AddItemForm>({
    defaultValues: {
      warehouse: '',
      name: '',
      unit: '',
      description: '',
      part_number: '',
      alternate_part_number: '',
      category: '',
      location: '',
      remarks: '',
    },
  })

  useEffect(() => {
    let cancelled = false

    api
      .get('/api/orgs/item-categories/')
      .then((response) => {
        if (!cancelled) setCategories(normalizeOptions(response.data))
      })
      .catch(() => {
        if (!cancelled) setCategories([])
      })

    api
      .get('/api/orgs/warehouses/')
      .then((response) => {
        if (!cancelled) setWarehouses(normalizeOptions(response.data))
      })
      .catch(() => {
        if (!cancelled) setWarehouses([])
      })

    return () => {
      cancelled = true
    }
  }, [])

  const onSubmit = async (data: AddItemForm) => {
    setFormError('')
    try {
      await api.post('/api/orgs/items/', data)
      navigate('/items-list')
    } catch (error) {
      setFormError(formatApiError(error))
    }
  }

  const addCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = categoryName.trim()
    if (!name) {
      setCategoryError('Enter a category name.')
      return
    }

    setSavingCategory(true)
    setCategoryError('')
    try {
      const response = await api.post('/api/orgs/item-categories/', { name })
      const created = normalizeOptions(
        Array.isArray(response.data) ? response.data : [response.data],
      )[0] ?? { slug: name, name }

      setCategories((current) => {
        if (current.some((category) => category.slug === created.slug)) return current
        return [...current, created]
      })
      setValue('category', created.slug)
      setCategoryName('')
      setCategoryOpen(false)
    } catch (error) {
      setCategoryError(formatApiError(error))
    } finally {
      setSavingCategory(false)
    }
  }

  const addWarehouse = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = warehouseName.trim()
    if (!name) {
      setWarehouseError('Enter a warehouse name.')
      return
    }

    setSavingWarehouse(true)
    setWarehouseError('')
    try {
      const response = await api.post('/api/orgs/warehouses/', { name })
      const created = normalizeOptions(
        Array.isArray(response.data) ? response.data : [response.data],
      )[0] ?? { slug: name, name }

      setWarehouses((current) => {
        if (current.some((warehouse) => warehouse.slug === created.slug)) return current
        return [...current, created]
      })
      setValue('warehouse', created.slug)
      setWarehouseName('')
      setWarehouseOpen(false)
    } catch (error) {
      setWarehouseError(formatApiError(error))
    } finally {
      setSavingWarehouse(false)
    }
  }

  return (
    <div className="flex min-w-0 w-full flex-col bg-white px-4 py-4 text-black sm:px-7 sm:py-6">
      <div className="mb-6">
        <h1 className="text-xl font-normal text-black sm:text-2xl md:text-3xl">Add Item</h1>
        <p className="mt-1 text-sm text-gray-500">Enter the item details, then save it to inventory.</p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full max-w-3xl flex-col gap-5 rounded-lg border border-gray-200 p-4 sm:p-6"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Item name" htmlFor="name">
            <Input id="name" type="text" placeholder="Item name" className={fieldClass} {...register('name')} />
          </Field>
          <Field
            label="Warehouse"
            htmlFor="warehouse"
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
          </Field>
          <Field label="Unit" htmlFor="unit">
            <Input id="unit" type="text" placeholder="pcs, kg, box" className={fieldClass} {...register('unit')} />
          </Field>
          <Field label="Location" htmlFor="location">
            <Input id="location" type="text" placeholder="Location" className={fieldClass} {...register('location')} />
          </Field>
          <Field label="Part number" htmlFor="part_number">
            <Input id="part_number" type="text" placeholder="Part number" className={fieldClass} {...register('part_number')} />
          </Field>
          <Field label="Alternate part number" htmlFor="alternate_part_number">
            <Input
              id="alternate_part_number"
              type="text"
              placeholder="Alternate part number"
              className={fieldClass}
              {...register('alternate_part_number')}
            />
          </Field>
          <Field
            label="Category"
            htmlFor="category"
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
                  value={field.value || null}
                  onValueChange={(value) => field.onChange(value ?? '')}
                >
                  <SelectTrigger id="category" className={fieldClass}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="text-gray-800">
                    {categories.length === 0 ? (
                      <SelectItem value="__empty" disabled>
                        No categories yet
                      </SelectItem>
                    ) : (
                      categories.map((category) => (
                        <SelectItem key={category.slug} value={category.slug}>
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
        </div>

        <Field label="Description" htmlFor="description">
          <textarea
            id="description"
            rows={3}
            placeholder="Description"
            className="w-full resize-y rounded-sm border border-gray-400 bg-white px-2.5 py-2 text-sm text-gray-800 outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            {...register('description')}
          />
        </Field>

        <Field label="Remarks" htmlFor="remarks">
          <textarea
            id="remarks"
            rows={3}
            placeholder="Remarks"
            className="w-full resize-y rounded-sm border border-gray-400 bg-white px-2.5 py-2 text-sm text-gray-800 outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            {...register('remarks')}
          />
        </Field>

        {formError && <p className="text-sm text-red-500">{formError}</p>}

        <div className="flex items-center justify-end gap-2 border-t border-gray-200 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate('/items-list')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Add item'}
          </Button>
        </div>
      </form>

      <Dialog
        open={categoryOpen}
        onOpenChange={(open) => {
          setCategoryOpen(open)
          if (!open) {
            setCategoryName('')
            setCategoryError('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add category</DialogTitle>
            <DialogDescription>Create a category, then use it on this item.</DialogDescription>
          </DialogHeader>
          <form onSubmit={addCategory} className="flex flex-col gap-4">
            <Field label="Category name" htmlFor="new-category">
              <Input
                id="new-category"
                type="text"
                placeholder="Category name"
                className={fieldClass}
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                autoFocus
              />
            </Field>
            {categoryError && <p className="text-sm text-red-500">{categoryError}</p>}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCategoryOpen(false)}
                disabled={savingCategory}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={savingCategory}>
                {savingCategory ? 'Saving…' : 'Save category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={warehouseOpen}
        onOpenChange={(open) => {
          setWarehouseOpen(open)
          if (!open) {
            setWarehouseName('')
            setWarehouseError('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add warehouse</DialogTitle>
            <DialogDescription>Create a warehouse, then use it on this item.</DialogDescription>
          </DialogHeader>
          <form onSubmit={addWarehouse} className="flex flex-col gap-4">
            <Field label="Warehouse name" htmlFor="new-warehouse">
              <Input
                id="new-warehouse"
                type="text"
                placeholder="Warehouse name"
                className={fieldClass}
                value={warehouseName}
                onChange={(event) => setWarehouseName(event.target.value)}
                autoFocus
              />
            </Field>
            {warehouseError && <p className="text-sm text-red-500">{warehouseError}</p>}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setWarehouseOpen(false)}
                disabled={savingWarehouse}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={savingWarehouse}>
                {savingWarehouse ? 'Saving…' : 'Save warehouse'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Item_add
