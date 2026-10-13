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

export const rfqFormSchema = z.object({
  vendor_slugs: z.array(z.string()).min(1, 'Choose at least one vendor.'),
})

export type RfqForm = z.infer<typeof rfqFormSchema>

export const trailVerifySchema = z.object({
  hash: z.string().trim().min(1, 'Enter a hash.'),
  signature: z.string().trim().min(1, 'Enter a signature.'),
})

export type TrailVerifyForm = z.infer<typeof trailVerifySchema>

export const recordQuoteSchema = z.object({
  vendor: z.string().min(1, 'Choose a vendor.'),
  notes: z.string(),
  lines: z
    .array(
      z.object({
        line: z.string(),
        description: z.string(),
        unit: z.string(),
        unit_price: z
          .string()
          .trim()
          .min(1, 'Enter a unit price.')
          .refine((value) => !Number.isNaN(Number(value)) && Number(value) > 0, 'Enter a number for unit price.'),
      }),
    )
    .min(1, 'Enter prices for each line.'),
})

export type RecordQuoteForm = z.infer<typeof recordQuoteSchema>

export const rejectRfqVendorSchema = z.object({
  reason: z.string().trim().min(1, 'Enter a reason.'),
})

export type RejectRfqVendorForm = z.infer<typeof rejectRfqVendorSchema>

export const addRfqVendorSchema = z.object({
  vendor: z.string().min(1, 'Choose a vendor.'),
})

export type AddRfqVendorForm = z.infer<typeof addRfqVendorSchema>

export const awardLinesSchema = z.object({
  selections: z
    .array(
      z.object({
        line: z.string(),
        description: z.string(),
        unit: z.string(),
        quantity: z.string(),
        vendor: z.string().min(1, 'Choose a vendor.'),
      }),
    )
    .min(1, 'Choose a vendor for each remaining line.'),
})

export type AwardLinesForm = z.infer<typeof awardLinesSchema>

