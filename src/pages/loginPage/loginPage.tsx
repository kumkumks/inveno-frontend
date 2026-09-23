import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import sideimage from '@/assets/login-img.svg'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '@/components/auth-provider'
import { LoginSchema } from './Schema/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { isAxiosError } from 'axios'
import { formatApiError } from '@/lib/errors'

type LoginForm = z.infer<typeof LoginSchema>

type LocationState = {
  from?: {
    pathname?: string
    search?: string
    hash?: string
  }
}

const getMessage = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === 'string').join(' ') || undefined
  }
  if (typeof value === 'string') {
    return value
  }
  return undefined
}

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, me, isLoading } = useAuth()
  const from = (location.state as LocationState | null)?.from
  const redirectTo = from?.pathname
    ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
    : '/dashboard'

  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const handleLogin = async (data: LoginForm) => {
    try {
      await signIn(data.email, data.password)
      reset()
      navigate(redirectTo, { replace: true })
    } catch (error: unknown) {
      const backendErrors = isAxiosError(error) ? error.response?.data : undefined

      let hasFieldError = false
      if (backendErrors && typeof backendErrors === 'object') {
        for (const key of ['email', 'password'] as const) {
          const message = getMessage((backendErrors as Record<string, unknown>)[key])
          if (message) {
            setError(key, { type: 'server', message })
            hasFieldError = true
          }
        }
      }

      if (!hasFieldError) {
        setError('root', {
          type: 'server',
          message: formatApiError(error) || 'Unable to sign in. Please try again.',
        })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-gray-600">
        Checking your session…
      </div>
    )
  }

  if (me) {
    return <Navigate to={redirectTo} replace />
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-5 sm:p-8 lg:flex-row lg:justify-between lg:p-11">
      <div className="hidden flex-col gap-4 lg:flex lg:w-1/2">
        <img src={sideimage} alt="login-img" className="h-auto w-full max-w-2xl" />
      </div>

      <form onSubmit={handleSubmit(handleLogin)} className="flex w-full items-center justify-center text-black lg:w-auto lg:flex-1">
        <div>
          <div className="flex w-full max-w-sm flex-col gap-4 sm:gap-5 lg:max-w-sm">
            <h5 className="text-base font-semibold sm:text-lg">Inveno</h5>
            <h1 className="text-2xl font-semibold sm:text-3xl">Hello, Welcome back</h1>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                className="w-full rounded-sm border border-gray-400"
                disabled={isSubmitting}
                {...register('email')}
              />
              {errors.email && <span className="text-sm text-red-500">{errors.email.message}</span>}
            </div>

            {errors.root && <div className="text-sm text-red-500">{errors.root.message}</div>}

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                className="w-full rounded-sm border border-gray-400"
                disabled={isSubmitting}
                {...register('password')}
              />
              {errors.password && <span className="text-sm text-red-500">{errors.password.message}</span>}
            </div>

            <Button type="submit" className="w-full" variant="dark" size="hero" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default LoginPage
