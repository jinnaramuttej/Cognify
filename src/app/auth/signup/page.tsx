'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'

type SignupForm = {
  firstName: string
  lastName: string
  email: string
  password: string
  confirm: string
}

export default function SignupPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupForm>()

  const onSubmit = async (data: SignupForm) => {
    if (data.password !== data.confirm) {
      toast.error('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      login({
        id: crypto.randomUUID(),
        email: data.email,
        full_name: `${data.firstName} ${data.lastName}`,
        role: 'student',
      })

      toast.success('Account created successfully.')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create account.')
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
            <p className="text-[10px] uppercase tracking-[0.26em] text-primary-fixed-dim">Registration</p>
            <h1
              className="mt-4 text-5xl font-semibold leading-[0.95] tracking-[-0.02em] text-primary md:text-6xl"
              style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
            >
              Create your Cognify account.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-on-surface-variant">
              Start with a focused profile and enter your first adaptive study session.
            </p>
            <div className="mt-8 flex items-center gap-4 text-sm text-on-surface-variant">
              <Link href="/" className="underline decoration-primary-fixed-dim underline-offset-4 hover:text-primary-fixed-dim">
                Back to landing
              </Link>
              <span className="text-outline">/</span>
              <Link href="/auth/login" className="underline decoration-primary-fixed-dim underline-offset-4 hover:text-primary-fixed-dim">
                Sign in
              </Link>
            </div>
          </div>

          <div className="md:col-span-6">
            <div className="rounded-md bg-surface-container-high p-6 md:p-8">
              <h2 className="text-2xl text-primary md:text-3xl" style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}>
                Register
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-xs font-semibold uppercase tracking-[0.2em] text-primary-fixed-dim">
                      First name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      {...register('firstName', { required: 'First name is required' })}
                      className="mt-2 w-full rounded-md bg-surface-container-highest px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-transparent transition focus:ring-outline"
                    />
                    {errors.firstName && <p className="mt-2 text-xs text-error">{errors.firstName.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-xs font-semibold uppercase tracking-[0.2em] text-primary-fixed-dim">
                      Last name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      {...register('lastName', { required: 'Last name is required' })}
                      className="mt-2 w-full rounded-md bg-surface-container-highest px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-transparent transition focus:ring-outline"
                    />
                    {errors.lastName && <p className="mt-2 text-xs text-error">{errors.lastName.message}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-[0.2em] text-primary-fixed-dim">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...register('email', { required: 'Email is required' })}
                    className="mt-2 w-full rounded-md bg-surface-container-highest px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-transparent transition focus:ring-outline"
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
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 8, message: 'Password must be at least 8 characters' },
                    })}
                    className="mt-2 w-full rounded-md bg-surface-container-highest px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-transparent transition focus:ring-outline"
                  />
                  {errors.password && <p className="mt-2 text-xs text-error">{errors.password.message}</p>}
                </div>

                <div>
                  <label htmlFor="confirm" className="block text-xs font-semibold uppercase tracking-[0.2em] text-primary-fixed-dim">
                    Confirm password
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    {...register('confirm', {
                      required: 'Please confirm your password',
                      validate: (value) => value === watch('password') || 'Passwords do not match',
                    })}
                    className="mt-2 w-full rounded-md bg-surface-container-highest px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-transparent transition focus:ring-outline"
                  />
                  {errors.confirm && <p className="mt-2 text-xs text-error">{errors.confirm.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold tracking-wide text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
