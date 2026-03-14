'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import { Loader2, CheckCircle2, Timer, ChevronRight, ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Question {
    q: string
    a: string[]
    correct: number
}

interface Assessment {
    id: string
    title: string
    subject: string
    duration_minutes: number
    questions: any // jsonb
}

export default function TestPlayer({ assessment, userId }: { assessment: Assessment; userId: string }) {
    const router = useRouter()
    const supabase = createClient()

    const questions = (assessment.questions as Question[]) || []
    const totalQuestions = questions.length
    const durationSeconds = assessment.duration_minutes * 60

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<number, number>>({})
    const [timeLeft, setTimeLeft] = useState(durationSeconds)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isCompleted, setIsCompleted] = useState(false)
    const [score, setScore] = useState(0)

    // Timer Logic
    useEffect(() => {
        if (isCompleted) return

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    handleSubmit(true) // Auto submit
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [isCompleted])

    // Format time
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    const handleOptionSelect = (value: string) => {
        setAnswers((prev) => ({
            ...prev,
            [currentQuestionIndex]: parseInt(value),
        }))
    }

    const calculateScore = () => {
        let correctCount = 0
        questions.forEach((q, idx) => {
            if (answers[idx] === q.correct) {
                correctCount++
            }
        })
        return correctCount
    }

    const handleSubmit = useCallback(async (autoSubmit = false) => {
        if (isSubmitting || isCompleted) return
        setIsSubmitting(true)

        const finalScore = calculateScore()
        setScore(finalScore)

        try {
            const { error } = await supabase.from('user_assessments').insert({
                user_id: userId,
                assessment_id: assessment.id,
                score: finalScore,
                status: 'completed',
                completed_at: new Date().toISOString(),
            })

            if (error) throw error

            setIsCompleted(true)
            if (autoSubmit) {
                toast.warning("Time's up! Assessment submitted automatically.")
            } else {
                toast.success('Assessment submitted successfully!')
            }
        } catch (error) {
            console.error('Error submitting assessment:', error)
            toast.error('Failed to submit assessment. Please try again.')
            setIsSubmitting(false)
        }
    }, [answers, assessment.id, userId, isSubmitting, isCompleted, questions])

    if (isCompleted) {
        const percentage = Math.round((score / totalQuestions) * 100)
        return (
            <Card className="w-full max-w-2xl mx-auto mt-10 text-center">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4">
                        <CheckCircle2 className="w-12 h-12 text-primary" />
                    </div>
                    <CardTitle className="text-3xl">Assessment Completed!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center">
                        <p className="text-muted-foreground mb-2">Your Score</p>
                        <div className="text-5xl font-bold text-primary">
                            {score} <span className="text-2xl text-muted-foreground">/ {totalQuestions}</span>
                        </div>
                        <p className="mt-2 text-sm font-medium text-muted-foreground">{percentage}% Accuracy</p>
                    </div>
                    <Progress value={percentage} className="h-3" />
                </CardContent>
                <CardFooter className="flex justify-center gap-4">
                    <Button variant="outline" onClick={() => router.push('/tests')}>
                        Back to Tests
                    </Button>
                    <Button onClick={() => router.push('/dashboard')}>
                        Go to Dashboard
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    const currentQ = questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100

    return (
        <div className="space-y-6">
            {/* Header / Timer */}
            <div className="flex items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
                <div className="flex items-center gap-4">
                    <h2 className="font-semibold text-lg">{assessment.title}</h2>
                    <span className="text-muted-foreground text-sm hidden sm:inline-block">| {assessment.subject}</span>
                </div>
                <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft < 60 ? 'text-destructive animate-pulse' : 'text-primary'}`}>
                    <Timer className="w-5 h-5" />
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                    <span>{Math.round(progress)}% Completed</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            {/* Question Card */}
            <Card className="min-h-[400px] flex flex-col">
                <CardHeader>
                    <CardTitle className="text-xl leading-relaxed">
                        {currentQ?.q}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                    <RadioGroup
                        value={answers[currentQuestionIndex]?.toString()}
                        onValueChange={handleOptionSelect}
                        className="space-y-3"
                    >
                        <AnimatePresence mode="wait">
                            {currentQ?.a.map((option, idx) => (
                                <motion.div
                                    key={`${currentQuestionIndex}-${idx}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <div className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors hover:bg-accent ${answers[currentQuestionIndex] === idx ? 'border-primary bg-accent/50' : ''}`}>
                                        <RadioGroupItem value={idx.toString()} id={`opt-${idx}`} />
                                        <Label htmlFor={`opt-${idx}`} className="flex-1 cursor-pointer font-normal text-base">
                                            {option}
                                        </Label>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </RadioGroup>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-6">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                    </Button>

                    {currentQuestionIndex === totalQuestions - 1 ? (
                        <Button
                            onClick={() => handleSubmit(false)}
                            disabled={isSubmitting}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                            Submit Assessment
                        </Button>
                    ) : (
                        <Button
                            onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                        >
                            Next <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}