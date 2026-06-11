import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

export const LoginPage = () => {
  const { login } = useAuth()
  const [apiError, setApiError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setApiError('')
    try {
      await login(data.email, data.password)
    } catch {
      setApiError('Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — brand panel */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-burgundy px-12">
        <div className="text-center">
          <h1 className="font-display text-6xl font-semibold text-cream tracking-tight mb-4">
            Quotify
          </h1>
          <p className="text-cream/70 text-sm tracking-[0.2em] uppercase font-sans">
            Create · Quote · Close
          </p>
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex flex-col items-center justify-center bg-cream px-8 py-12 min-h-screen">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="lg:hidden text-center mb-10">
            <h1 className="font-display text-4xl font-semibold text-burgundy">Quotify</h1>
            <p className="text-burgundy/60 text-xs tracking-[0.15em] uppercase mt-2 font-sans">
              Create · Quote · Close
            </p>
          </div>

          <h2 className="font-display text-3xl font-medium text-burgundy text-center mb-10">
            Welcome!
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div>
              <label className="block text-xs font-medium text-burgundy/70 mb-2 font-sans">
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className="w-full bg-transparent border-0 border-b border-burgundy/40 text-burgundy text-sm py-2 placeholder:text-burgundy/35 focus:outline-none focus:border-burgundy transition-colors font-sans"
              />
              {errors.email && <p className="text-red-600 text-xs mt-1.5 font-sans">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-burgundy/70 mb-2 font-sans">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="w-full bg-transparent border-0 border-b border-burgundy/40 text-burgundy text-sm py-2 pr-8 placeholder:text-burgundy/35 focus:outline-none focus:border-burgundy transition-colors font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-burgundy/40 hover:text-burgundy transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-600 text-xs mt-1.5 font-sans">{errors.password.message}</p>}
            </div>

            {apiError && (
              <p className="text-red-600 text-sm text-center font-sans">{apiError}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-burgundy hover:bg-burgundy-light disabled:opacity-60 text-cream font-display text-base py-3 transition-colors duration-150"
            >
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <p className="text-burgundy/45 text-xs text-center mt-8 font-sans">
            Demo: admin@example.com / password123
          </p>
        </div>
      </div>
    </div>
  )
}
