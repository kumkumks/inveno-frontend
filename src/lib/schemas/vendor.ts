import { z } from 'zod'

const optionalText = z.string().trim()

export const vendorFormSchema = z.object({
  name: z.string().trim().min(1, 'Enter a name.'),
  contact_name: z.string().trim().min(1, 'Enter a contact name.'),
  phone: z.string().trim().min(1, 'Enter a phone number.'),
  address: z.string().trim().min(1, 'Enter an address.'),
  email: optionalText.refine(
    (value) => value === '' || z.string().email().safeParse(value).success,
    'Enter a valid email.',
  ),
  website: optionalText.refine((value) => {
    if (!value) return true
    return z.string().url().safeParse(value).success || z.string().url().safeParse(`https://${value}`).success
  }, 'Enter a valid website URL.'),
  gst: optionalText,
})

export type VendorForm = z.infer<typeof vendorFormSchema>

export const emptyVendorForm: VendorForm = {
  name: '',
  contact_name: '',
  phone: '',
  address: '',
  email: '',
  website: '',
  gst: '',
}
