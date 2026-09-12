import { useSearchParams } from 'react-router-dom';
import api from '@/services/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { newPasswordSchema } from './Schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

type FormData = z.infer<typeof newPasswordSchema>;

const NewPassword = () => {

    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const uid = searchParams.get('uid');

    const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(newPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    const handleLogin = async (data: FormData) => {
        if (!token || !uid) {
            setError('root', {
                type: 'client', message: 'The reset link is missing uid or token.',
            });
            return;
        }
        try {
            const response = await api.post('/api/auth/password/set/', {
                uid: uid,
                token: token,
                new_password: data.password,
                new_password2: data.confirmPassword,
            });
            console.log('Password set successful:', response.data);
            console.log(response);
            reset(); // Reset the form after successful submission
        } catch (error: any) {
            const backendErrors = error.response?.data;

            console.log('Backend status:', error.response?.status);
            console.log('Backend response:', backendErrors);

            const getMessage = (value: unknown) => {
                if (Array.isArray(value)) {
                    return value.join(' ');
                }

                if (typeof value === 'string') {
                    return value;
                }

                return undefined;
            };

            const passwordMessage = getMessage(backendErrors?.new_password);
            const tokenMessage = getMessage(backendErrors?.token);
            const uidMessage = getMessage(backendErrors?.uid);

            if (passwordMessage) {
                setError('password', {
                    type: 'server',
                    message: passwordMessage,
                });
            } else {
                setError('root', {
                    type: 'server',
                    message:
                        tokenMessage ||
                        uidMessage ||
                        getMessage(backendErrors?.detail) ||
                        getMessage(backendErrors?.message) ||
                        'Unable to set password. Please try again.',
                });
            }
        }
    }
    return (
        <div className="flex w-full items-center justify-center bg-amber-50 text-black lg:w-auto lg:flex-1">
            <div className="flex w-full max-w-sm flex-col gap-4 sm:gap-5 lg:max-w-sm">
                <form onSubmit={handleSubmit(handleLogin)} className="flex flex-col gap-4 sm:gap-5">
                    {errors.root && <div className="text-red-500 text-sm">{errors.root.message}</div>}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium">Password</label>
                        <Input type="password" className="w-full border border-gray-400"  {...register('password')} />
                        {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium">Confirm Password</label>
                        <Input type="password" className="w-full border border-gray-400"  {...register('confirmPassword')} />
                        {errors.confirmPassword && <span className="text-red-500 text-sm">{errors.confirmPassword.message}</span>}
                    </div>
                    <Button type="submit" className="w-full" variant="dark" size="hero" disabled={isSubmitting}>
                        Sign in
                    </Button>
                </form>
            </div>
        </div>
    )

}
export default NewPassword