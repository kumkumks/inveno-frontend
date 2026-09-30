import { useSearchParams, useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { newPasswordSchema } from '@/lib/schemas/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { isAxiosError } from 'axios'
import { fieldMessage, formatApiError } from '@/lib/errors'
import { setPassword } from '@/services/auth'
import { FormField } from '@/components/common/form-field'

type FormData = z.infer<typeof newPasswordSchema>

const NewPassword = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')
    const uid = searchParams.get('uid')

    const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(newPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    })

    const handleLogin = async (data: FormData) => {
        if (!token || !uid) {
            setError('root', {
                type: 'client', message: 'The reset link is missing uid or token.',
            })
            return
        }
        try {
            await setPassword({
                uid,
                token,
                new_password: data.password,
                new_password2: data.confirmPassword,
            })
            navigate('/login')
            reset()
        } catch (error: unknown) {
            const backendErrors = isAxiosError(error) ? error.response?.data : undefined
            const passwordMessage = fieldMessage(backendErrors?.new_password)
            const tokenMessage = fieldMessage(backendErrors?.token)
            const uidMessage = fieldMessage(backendErrors?.uid)

            if (passwordMessage) {
                setError('password', {
                    type: 'server',
                    message: passwordMessage,
                })
            } else {
                setError('root', {
                    type: 'server',
                    message:
                        tokenMessage ||
                        uidMessage ||
                        fieldMessage(backendErrors?.detail) ||
                        fieldMessage(backendErrors?.message) ||
                        formatApiError(error) ||
                        'Unable to set password. Please try again.',
                })
            }
        }
    }

    return (
        <div className="flex w-full items-center justify-center bg-amber-50 text-black lg:w-auto lg:flex-1">
            <div className="flex w-full max-w-sm flex-col gap-4 sm:gap-5 lg:max-w-sm">
                <form onSubmit={handleSubmit(handleLogin)} className="flex flex-col gap-4 sm:gap-5">
                    {errors.root && <div className="text-red-500 text-sm">{errors.root.message}</div>}
                    <FormField label="Password" error={errors.password?.message}>
                        <Input type="password" className="w-full border border-gray-400" {...register('password')} />
                    </FormField>
                    <FormField label="Confirm Password" error={errors.confirmPassword?.message}>
                        <Input type="password" className="w-full border border-gray-400" {...register('confirmPassword')} />
                    </FormField>
                    <Button type="submit" className="w-full" variant="dark" size="hero" disabled={isSubmitting}>
                        Set Password
                    </Button>
                </form>
            </div>
        </div>
    )
}

export default NewPassword
