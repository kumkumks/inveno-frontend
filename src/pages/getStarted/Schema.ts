import  { z }  from 'zod';

export const newPasswordSchema = z.object({
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string().min(8, 'Confirm Password must be at least 8 characters long'),
}).refine((data) => data.password === data.confirmPassword, {   
    path: ['confirmPassword'],
    message: 'Passwords do not match',
});