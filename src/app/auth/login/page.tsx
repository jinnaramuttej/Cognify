'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { authenticateLocalAccount } from '@/lib/auth-storage'

type LoginForm = {
  email: string
  password: string
}

const ADMIN_EMAIL = 'cognify1111@gmail.com'
const ADMIN_PASSWORD = '123456'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const inputClassName =
    'mt-2 w-full rounded-md bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-outline transition focus:ring-2 focus:ring-primary'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    try {
      const isAdmin = data.email === ADMIN_EMAIL && data.password === ADMIN_PASSWORD

      if (isAdmin) {
        login({
          id: crypto.randomUUID(),
          email: data.email,
          role: 'admin',
          isAdmin: true,
          full_name: 'Admin',
        })
        toast.success('Welcome back, Admin.')
        router.push('/admin')
      } else {
        const matchedAccount = authenticateLocalAccount(data.email, data.password)
        if (!matchedAccount) {
          toast.error('Account not found. Please create an account first.')
          return
        }

        login(matchedAccount)
        toast.success('Welcome back to Cognify.')
        router.push('/dashboard')
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to sign in.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.02]"
        style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}
      />

      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-12 md:px-12">
        <section className="grid w-full gap-10 md:grid-cols-12 md:items-start">
          <div className="md:col-span-6 md:pt-8">
            <p className="text-[10px] uppercase tracking-[0.26em] text-primary-fixed-dim">Authentication</p>
            <h1
              className="mt-4 text-5xl font-semibold leading-[0.95] tracking-[-0.02em] text-primary md:text-6xl"
              style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
            >
              Welcome back.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-on-surface-variant">
              Enter your credentials to continue your study workflow inside Cognify.
            </p>
            <div className="mt-8 flex items-center gap-4 text-sm text-on-surface-variant">
              <Link href="/" className="underline decoration-primary-fixed-dim underline-offset-4 hover:text-primary-fixed-dim">
                Back to landing
              </Link>
              <span className="text-outline">/</span>
              <Link href="/auth/signup" className="underline decoration-primary-fixed-dim underline-offset-4 hover:text-primary-fixed-dim">
                Create account
              </Link>
            </div>
          </div>

          <div className="md:col-span-6">
            <div className="rounded-md bg-surface-container-high p-6 md:p-8">
              <h2 className="text-2xl text-primary md:text-3xl" style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}>
                Sign in
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-[0.2em] text-primary-fixed-dim">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...register('email', { required: 'Email is required' })}
                    className={inputClassName}
                  />
                  {errors.email && <p className="mt-2 text-xs text-error">{errors.email.message}</p>}
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-[0.2em] text-primary-fixed-dim">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    {...register('password', { required: 'Password is required' })}
                    className={inputClassName}
                  />
                  {errors.password && <p className="mt-2 text-xs text-error">{errors.password.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold tracking-wide text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
