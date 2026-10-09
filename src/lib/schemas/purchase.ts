import { z } from 'zod'

export const SELECT_NONE = '-----'

export const purchaseLineFormSchema = z.object({
  description: z.string().trim().min(1, 'Enter a description.'),
  quantity: z
    .string()
    .min(1, 'Enter a quantity.')
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) > 0, 'Enter a number for quantity.')
    .refine((value) => {
      const decimals = value.split('.')[1]
      return !decimals || decimals.length <= 3
    }, 'Use at most 3 decimal places.'),
  item: z.string(),
  unit: z.string().trim().min(1, 'Enter a unit for quantity.'),
})

export type PurchaseLineForm = z.infer<typeof purchaseLineFormSchema>

export const purchaseAddSchema = z.object({
  title: z.string().trim().min(1, 'Enter a title.'),
  space: z.string(),
  notes: z.string(),
  lines: z.array(purchaseLineFormSchema).min(1, 'Add at least one line.'),
})

export type PurchaseAddForm = z.infer<typeof purchaseAddSchema>

