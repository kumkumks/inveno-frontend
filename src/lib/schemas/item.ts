import { z } from 'zod'

export const namedEntityFormSchema = z.object({
  name: z.string().trim().min(1, 'Enter a name.'),
})

export type NamedEntityForm = z.infer<typeof namedEntityFormSchema>
