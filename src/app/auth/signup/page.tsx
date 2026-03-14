'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/ui/icons';
import Link from 'next/link';
import { toast } from 'sonner';
import { GraduationCap, ArrowLeft, ArrowRight, User, BookOpen, Lock, Target, Brain, Briefcase } from 'lucide-react';

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirm: '',
      // Academic Details
      academicStage: '',
      targetExam: '',
      appearingYear: '',
      targetRank: '',
      weakTopics: '',
    }
  });

  const watchedStage = watch('academicStage');
  const watchedExam = watch('targetExam');

  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const exams = ['JEE Main', 'JEE Advanced', 'NEET UG', 'BITSAT', 'MHT-CET', 'VITEEE', 'Multiple'];

  const onSubmit = async (data: any) => {
    if (data.password !== data.confirm) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      // Since 'signup' is not in AuthContext, we mockup a user and 'login'
      const newUser = {
        id: crypto.randomUUID(),
        email: data.email,
        full_name: `${data.firstName} ${data.lastName}`,
        class: data.academicStage,
        stream: data.targetExam,
        academicProfile: {
          stage: data.academicStage,
          exam: data.targetExam,
          year: data.appearingYear,
          rank: data.targetRank,
          weaknesses: data.weakTopics
        },
        role: 'student' as const
      };
      login(newUser);
      toast.success('Account created and personalized successfully! Welcome to Cognify.');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 2 && !watchedStage) {
      return toast.error("Please select your academic stage.");
    }
    setStep(step + 1);
  };
  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-slate-950 p-4">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400 blur-[120px]" />
      </div>

      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`z-10 w-full transition-all duration-500 ease-in-out ${step === 2 ? 'max-w-2xl' : 'max-w-md'}`}
      >
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none">
              <GraduationCap className="text-white w-7 h-7" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create Account</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Join thousands of students on Cognify</p>
        </div>

        <Card className="border-none shadow-xl shadow-slate-200 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl overflow-hidden relative">
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800">
            <motion.div
              className="h-full bg-blue-600"
              initial={{ width: '33.33%' }}
              animate={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              {step === 1 && <><User className="w-5 h-5 text-blue-600" /> Personal Info</>}
              {step === 2 && <><Target className="w-5 h-5 text-blue-600" /> Academic Profiling</>}
              {step === 3 && <><Lock className="w-5 h-5 text-blue-600" /> Secure Account</>}
            </CardTitle>
            <CardDescription>
              Step {step} of 3
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="John" {...register('firstName', { required: true })} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Doe" {...register('lastName', { required: true })} />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="john@example.com" {...register('email', { required: true })} />
                    </div>
                    <Button type="button" onClick={nextStep} className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2">
                      Continue to Academics <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Your Academic Stage</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { id: '11th', label: '11th Grade', icon: BookOpen },
                          { id: '12th', label: '12th Grade', icon: Target },
                          { id: 'dropper', label: 'Dropper / Repeater', icon: Brain },
                          { id: 'btech', label: 'B.Tech Student', icon: Briefcase },
                        ].map(stage => {
                          const isActive = watchedStage === stage.id;
                          const Icon = stage.icon;
                          return (
                            <button
                              key={stage.id} type="button"
                              onClick={() => setValue('academicStage', stage.id)}
                              className={`p-3 rounded-xl border-2 text-left transition-all ${isActive ? 'border-blue-600 bg-blue-50 dark:bg-blue-600/10 text-blue-700 dark:text-blue-400' : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'}`}
                            >
                              <div className="flex items-center gap-3">
                                <Icon size={18} className={isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400"} />
                                <span className="font-semibold text-sm">{stage.label}</span>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {watchedStage && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-5 border-t border-slate-100 dark:border-slate-800 pt-5">
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold">Primary Target Exam</Label>
                          <div className="flex flex-wrap gap-2">
                            {exams.map(exam => (
                              <button
                                key={exam} type="button"
                                onClick={() => setValue('targetExam', exam)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${watchedExam === exam
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                                  }`}
                              >
                                {exam}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Appearing Year</Label>
                            <select
                              {...register('appearingYear')}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none placeholder-slate-400"
                            >
                              <option value="">Select Year</option>
                              <option>2024</option>
                              <option>2025</option>
                              <option>2026</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Target Rank (Optional)</Label>
                            <Input placeholder="e.g. Under 5000" className="rounded-xl px-4 py-2.5 h-auto text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" {...register('targetRank')} />
                          </div>
                        </div>

                        {watchedStage === 'dropper' && (
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">What topics blocked your score last time?</Label>
                            <Input placeholder="e.g. Rotational Motion, Organic Chem..." className="rounded-xl px-4 py-2.5 h-auto text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" {...register('weakTopics')} />
                          </div>
                        )}
                      </motion.div>
                    )}

                    <div className="flex gap-4 pt-4">
                      <Button variant="outline" type="button" onClick={prevStep} className="flex-1">
                        Back
                      </Button>
                      <Button type="button" onClick={nextStep} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                        Next <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        {...register('password', {
                          required: 'Password is required',
                          minLength: { value: 8, message: 'Password must be at least 8 characters' },
                          pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                            message: 'Password must contain uppercase, lowercase, number and special char'
                          }
                        })}
                      />
                      {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message as string}</p>}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirm">Confirm Password</Label>
                      <Input
                        id="confirm"
                        type="password"
                        {...register('confirm', {
                          required: 'Please confirm your password',
                          validate: (val: string) => {
                            if (watch('password') != val) {
                              return "Your passwords do no match";
                            }
                          }
                        })}
                      />
                      {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm.message as string}</p>}
                    </div>
                    <div className="flex gap-4 mt-6">
                      <Button variant="outline" type="button" onClick={prevStep} className="flex-1">
                        Back
                      </Button>
                      <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                        {loading ? 'Finalizing Profile...' : 'Launch Cognify'}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-t border-slate-100 dark:border-slate-800 pt-6 mt-2">
            <div className="text-sm text-center text-slate-500">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-blue-600 font-semibold hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
