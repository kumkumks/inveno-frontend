import { z } from 'zod'

export const passwordField = z.string().min(8, 'Password must be at least 8 characters long')
export const emailField = z.string().email('Invalid email address')

export const LoginSchema = z.object({
  email: emailField,
  password: passwordField,
})

export const newPasswordSchema = z.object({
  password: passwordField,
  confirmPassword: passwordField,
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match',
})
