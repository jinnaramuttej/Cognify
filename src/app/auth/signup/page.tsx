'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { createLocalAccount } from '@/lib/auth-storage'

type SignupForm = {
  fullName: string
  email: string
  targetExam: string
  password: string
  terms: boolean
}

export default function SignupPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const inputClassName =
    'w-full rounded-md border border-[#49473f] bg-[#353534] px-4 py-3.5 text-[#e5e2e1] placeholder:text-[#959087] outline-none transition-all focus:border-[#ccc6b9] focus:ring-0'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>()

  const onSubmit = async (data: SignupForm) => {
    setLoading(true)
    try {
      const nameParts = data.fullName.trim().split(/\s+/)
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || 'Student'

      const newUser = createLocalAccount({
        firstName,
        lastName,
        email: data.email,
        password: data.password,
      })

      login(newUser)

      toast.success('Account created successfully.')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full overflow-hidden bg-[#131313] text-[#e5e2e1]">
      <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between p-6 md:pointer-events-auto">
        <div className="flex items-center">
          <span className="text-2xl font-semibold tracking-tight text-[#e8e2d4]" style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}>
            Cognify
          </span>
        </div>
      </div>

      <main className="flex min-h-screen w-full overflow-hidden">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#131313] p-16 md:flex md:min-h-screen md:w-1/2">
          <div className="absolute inset-0 z-0">
            <img
              className="h-full w-full object-cover object-center opacity-70"
              alt="Moody dark library interior"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsE_drQeRnBf4ts_C1LhRNJQ6jtAwBcc65Gh4m8nAcM5OIzDCmdJY-gxsAq5mkduIvpXONJQ8poo7fWyOhfvGauMdoYrx8-5y6UH33JX53DvUfZUpFFaJF6zYG2KL67Q-SwQ4qqNpfTFpr4wSYpk2HyMVUC4S6KZd4rceg6jLFP59AinjscT5HTLRfObCnyrlWCRjBaTBMKVJXSpHoqAx7bZ_hTgcw0_ocXs07NYh8iIJjeERwxnoQeRN62lrHHDg6BdFCo-LJCncZ"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#131313]/55 via-[#131313]/20 to-transparent" />
            <div className="absolute inset-0 bg-[#0e0e0e]/30" />
          </div>

          <div />

          <div className="relative z-10 max-w-md">
            <h1 className="text-5xl italic leading-[1.1] text-[#e5e2e1] lg:text-6xl" style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}>
              Precision is the path to excellence.
            </h1>
            <p className="mt-6 text-lg font-light leading-relaxed text-[#cbc6bc]">
              Join the elite tier of scholars leveraging neural-patterned study modules and real-time cognitive analytics.
            </p>
          </div>

          <div className="relative z-10 flex gap-12">
            <div>
              <p className="text-2xl font-medium text-[#ccc6b9]" style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}>
                12.4k
              </p>
              <p className="mt-1 text-xs uppercase tracking-widest text-[#b9b8b7]">Active Scholars</p>
            </div>
            <div>
              <p className="text-2xl font-medium text-[#ccc6b9]" style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}>
                98%
              </p>
              <p className="mt-1 text-xs uppercase tracking-widest text-[#b9b8b7]">Success Rate</p>
            </div>
          </div>
        </section>

        <section className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-[#131313] px-8 pt-24 md:w-1/2 md:pt-16 lg:px-24">
          <div className="w-full max-w-md space-y-7 py-6">
            <div className="space-y-2">
              <h2 className="text-4xl font-medium text-[#e5e2e1]" style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}>
                Create your account
              </h2>
              <p className="font-light text-[#cbc6bc]">Begin your journey toward intellectual mastery.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="fullName" className="ml-1 block text-xs font-medium uppercase tracking-widest text-[#b9b8b7]">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Julian Thorne"
                  {...register('fullName', { required: 'Full name is required' })}
                  className={inputClassName}
                />
                {errors.fullName && <p className="text-xs text-error">{errors.fullName.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="ml-1 block text-xs font-medium uppercase tracking-widest text-[#b9b8b7]">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="julian@academy.edu"
                  {...register('email', { required: 'Email is required' })}
                  className={inputClassName}
                />
                {errors.email && <p className="text-xs text-error">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="targetExam" className="ml-1 block text-xs font-medium uppercase tracking-widest text-[#b9b8b7]">
                  Target Exam
                </label>
                <div className="relative">
                  <select
                    id="targetExam"
                    {...register('targetExam', { required: 'Please select a target exam' })}
                    className={`${inputClassName} appearance-none pr-11`}
                    defaultValue=""
                  >
                    <option disabled value="">
                      Select your objective
                    </option>
                    <option value="mcat">MCAT - Medical College Admission</option>
                    <option value="lsat">LSAT - Law School Admission</option>
                    <option value="gre">GRE - Graduate Record Examination</option>
                    <option value="bar">The Bar Exam</option>
                    <option value="custom">Independent Research</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                    <span className="material-symbols-outlined text-[#959087]">expand_more</span>
                  </div>
                </div>
                {errors.targetExam && <p className="text-xs text-error">{errors.targetExam.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="ml-1 block text-xs font-medium uppercase tracking-widest text-[#b9b8b7]">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 8, message: 'Password must be at least 8 characters' },
                    })}
                    className={`${inputClassName} pr-11`}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-4 flex items-center text-[#959087] transition-colors hover:text-[#cbc6bc]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="mt-2 flex gap-1.5 px-1">
                  <div className="h-1 flex-1 rounded-full bg-[#ccc6b9]/40" />
                  <div className="h-1 flex-1 rounded-full bg-[#ccc6b9]/40" />
                  <div className="h-1 flex-1 rounded-full bg-[#ccc6b9]/20" />
                  <div className="h-1 flex-1 rounded-full bg-[#ccc6b9]/10" />
                </div>
                <p className="mt-1 text-[10px] uppercase tracking-tighter text-[#b9b8b7]">Strength: Moderate</p>
                {errors.password && <p className="text-xs text-error">{errors.password.message}</p>}
              </div>

              <div className="flex items-start gap-3 px-1">
                <div className="flex h-5 items-center">
                  <input
                    id="terms"
                    type="checkbox"
                    {...register('terms', { required: 'Please accept terms to continue' })}
                    className="h-4 w-4 rounded border-[#49473f] bg-[#353534] text-[#e8e2d4] focus:ring-[#ccc6b9]"
                  />
                </div>
                <label htmlFor="terms" className="text-xs leading-relaxed text-[#cbc6bc]">
                  I agree to the <span className="underline decoration-[#ccc6b9]/30 underline-offset-4 text-[#ccc6b9]">Terms of Service</span> and{' '}
                  <span className="underline decoration-[#ccc6b9]/30 underline-offset-4 text-[#ccc6b9]">Privacy Protocol</span>.
                </label>
              </div>
              {errors.terms && <p className="text-xs text-error">{errors.terms.message}</p>}

              <button
                type="submit"
                disabled={loading}
                className="group mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-[#e8e2d4] py-4 font-semibold text-[#1e1b13] transition-all hover:bg-[#ccc6b9] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>{loading ? 'Creating account...' : 'Create Account'}</span>
                <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">arrow_forward</span>
              </button>
            </form>

            <div className="pt-6 text-center">
              <p className="text-sm text-[#cbc6bc]">
                Already a member?
                <Link href="/auth/login" className="ml-1 font-medium text-[#ccc6b9] transition-colors hover:text-[#e8e2d4]">
                  Log in here
                </Link>
              </p>
            </div>
          </div>

          <div className="absolute bottom-8">
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#959087]/30">Cognify © {new Date().getFullYear()}</p>
          </div>
        </section>
      </main>
    </div>
  )
}
