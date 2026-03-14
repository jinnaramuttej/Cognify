'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, RotateCcw, ArrowRight, BookOpen } from 'lucide-react';

export default function PracticeQuizzesPage() {
  const [currentQuiz, setCurrentQuiz] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600);
  const [quizComplete, setQuizComplete] = useState(false);

  const quizzes = [
    {
      id: 1,
      title: 'Physics - Mechanics',
      subject: 'Physics',
      questions: [
        {
          question: 'A force of 10N acts on a mass of 5kg. What is the acceleration?',
          options: ['2 m/s²', '5 m/s²', '10 m/s²', '50 m/s²'],
          correct: 0,
        },
        {
          question: 'What is the SI unit of momentum?',
          options: ['kg m/s', 'kg m/s²', 'N s', 'Both a and c'],
          correct: 3,
        },
        {
          question: 'If velocity is constant, what can you say about acceleration?',
          options: ['It is zero', 'It is positive', 'It is negative', 'It is constant'],
          correct: 0,
        },
      ],
    },
    {
      id: 2,
      title: 'Mathematics - Calculus',
      subject: 'Mathematics',
      questions: [
        {
          question: 'What is the derivative of x²?',
          options: ['x', '2x', 'x²', '2'],
          correct: 1,
        },
        {
          question: '∫2x dx equals?',
          options: ['x² + C', '2x² + C', 'x + C', '2 + C'],
          correct: 0,
        },
        {
          question: 'What is the limit of sin(x)/x as x approaches 0?',
          options: ['0', '1', '∞', 'Undefined'],
          correct: 1,
        },
      ],
    },
  ];

  const handleQuizStart = (quizId: number) => {
    setCurrentQuiz(quizId);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizComplete(false);
    setTimeLeft(600);
  };

  const handleAnswer = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(String(answerIndex));
  };

  const handleNext = () => {
    const quiz = quizzes.find((q) => q.id === currentQuiz);
    if (!quiz) return;

    const isCorrect = parseInt(selectedAnswer || '0') === quiz.questions[currentQuestion].correct;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setShowResult(true);

    setTimeout(() => {
      if (currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setQuizComplete(true);
      }
    }, 1500);
  };

  const handleReset = () => {
    setCurrentQuiz(null);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizComplete(false);
  };

  // ── Quiz Selection Screen ──
  if (!currentQuiz) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <BookOpen size={32} className="text-primary" />
            Practice Tests
          </h1>
          <p className="text-muted-foreground mt-1">
            Test your knowledge with interactive quizzes and get instant feedback
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quizzes.map((quiz) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-card border hover:border-primary/50 hover:shadow-lg transition-all h-full">
                <CardContent className="p-6 space-y-4">
                  <Badge variant="secondary">{quiz.subject}</Badge>
                  <h3 className="text-xl font-bold text-foreground">{quiz.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {quiz.questions.length} questions • 10 minutes
                  </p>
                  <Button
                    onClick={() => handleQuizStart(quiz.id)}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    Start Quiz
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  const quiz = quizzes.find((q) => q.id === currentQuiz);
  if (!quiz) return null;

  const question = quiz.questions[currentQuestion];

  // ── Quiz Complete Screen ──
  if (quizComplete) {
    const percentage = (score / quiz.questions.length) * 100;
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Card className="bg-card border">
          <CardContent className="pt-8 pb-8 px-6 text-center space-y-6">
            <CheckCircle className="w-20 h-20 text-primary mx-auto" />
            <h2 className="text-3xl font-bold text-foreground">Quiz Complete!</h2>
            <div className="text-6xl font-bold text-primary">
              {score}/{quiz.questions.length}
            </div>
            <p className="text-muted-foreground">
              You scored {percentage.toFixed(0)}%
            </p>
            <Progress value={percentage} />
            <div className="flex gap-4">
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex-1"
              >
                <RotateCcw size={20} className="mr-2" />
                Try Another
              </Button>
              <Button
                onClick={() => handleQuizStart(currentQuiz)}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Retry Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Active Quiz Screen ──
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{quiz.title}</h2>
          <p className="text-muted-foreground text-sm">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </p>
        </div>
        <div className="flex items-center gap-2 text-primary font-mono">
          <Clock size={20} />
          <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
        </div>
      </div>

      <Progress value={((currentQuestion + 1) / quiz.questions.length) * 100} />

      <Card className="bg-card border">
        <CardContent className="pt-8 pb-8 px-6 space-y-6">
          <h3 className="text-xl text-foreground font-medium">{question.question}</h3>
          <div className="space-y-3">
            {question.options.map((option, index) => {
              let className = 'w-full text-left p-4 rounded-lg border-2 transition-all ';
              if (showResult) {
                if (index === question.correct) {
                  className += 'border-green-500 bg-green-500/10 text-foreground';
                } else if (selectedAnswer === String(index) && index !== question.correct) {
                  className += 'border-red-500 bg-red-500/10 text-foreground';
                } else {
                  className += 'border-border bg-muted/20 text-muted-foreground';
                }
              } else if (selectedAnswer === String(index)) {
                className += 'border-primary bg-primary/10 text-foreground';
              } else {
                className += 'border-border hover:border-primary/50 text-foreground';
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={showResult}
                  className={className}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {showResult && index === question.correct && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {showResult &&
                      selectedAnswer === String(index) &&
                      index !== question.correct && (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button onClick={handleReset} variant="outline">
          Exit Quiz
        </Button>
        <Button
          onClick={handleNext}
          disabled={!selectedAnswer}
          className="bg-primary hover:bg-primary/90"
        >
          {currentQuestion < quiz.questions.length - 1 ? (
            <>
              Next <ArrowRight size={20} className="ml-2" />
            </>
          ) : (
            'Finish Quiz'
          )}
        </Button>
      </div>
    </div>
  );
}
