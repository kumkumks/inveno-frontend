import {Input} from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import sideimage from '@/assets/login-img.svg'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import api from '@/services/api'
import { LoginSchema } from './Schema/schema'
import { zodResolver } from '@hookform/resolvers/zod/dist/zod.js'
import { useForm } from 'react-hook-form'


const loginPage = () => {
   
const navigate = useNavigate();
type LoginForm = z.infer<typeof LoginSchema>;
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
        email: '',
        password: '',
    },
});
 
const handleLogin = async (data: LoginForm) => {
    try{
        const response = await api.post('/api/auth/login/', {
            email: data.email,
            password: data.password,
        });
        console.log('Login successful:', response.data);
        navigate('/dashboard');
        reset(); // Reset the form after successful login
    } catch (error:any) {
        console.error('Error during login:', error);
        const backendErrors = error.response?.data;

        const getMessage = (value: unknown) => {
            if (Array.isArray(value)) {
                return value.join(' ');
            }
            if (typeof value === 'string') {
                return value;
            }
            return undefined;
        };
        if (backendErrors) {
            for (const key in backendErrors) {
                const message = getMessage(backendErrors[key]);
                if (message) {
                    if (key === 'email' || key === 'password') {
                        setError(key, { type: 'server', message });
                    } else {
                        setError('root', { type: 'server', message });
                    }
                }
            }
        }
    }
}

  return (
     <div className="flex min-h-screen flex-col items-center justify-center bg-white p-5 sm:p-8 lg:flex-row lg:justify-between lg:p-11">
        {/* Image - Hidden on small screens */}
        <div className="hidden flex-col gap-4 lg:flex lg:w-1/2">
            <img src={sideimage} alt="login-img" className='h-auto w-full max-w-2xl' />
        </div>      
        
        {/* Form Section */}
        <form onSubmit={handleSubmit(handleLogin)}  className="flex w-full items-center justify-center text-black lg:w-auto lg:flex-1">
           <div>
            <div className="flex w-full max-w-sm flex-col gap-4 sm:gap-5 lg:max-w-sm">
              <h5 className="text-base font-semibold sm:text-lg">Inveno</h5>
              <h1 className="text-2xl font-semibold sm:text-3xl">Hello, Welcome back</h1>
              
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Email</label>
                                <Input
                                    type="email"
                                    className="w-full border border-gray-400 rounded-sm"
                                    {...register('email')}
                                />
                {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
              </div>
               
               {errors.root && <div className="text-red-500 text-sm">{errors.root.message}</div>}

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Password</label>
                                <Input
                                    type="password"
                                    className="w-full border border-gray-400 rounded-sm"
                                    {...register('password')}
                                />
                {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
              </div>
              
              <Button type="submit" className="w-full" variant="dark" size="hero">
                Sign in
              </Button>
            </div>
        </div>
        </form>
      </div>
  )
}

export default loginPage