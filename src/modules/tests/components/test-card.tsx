'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, FileQuestion, BookOpen, Play, Eye, Calendar, User, ArrowRight } from 'lucide-react'
import type { Test } from '../types'
import { getStatusBg, getDifficultyBg, getSubjectBg, formatDate, cn } from '../utils'
import { useRouter } from 'next/navigation'

interface TestCardProps {
  test: Test
  variant?: 'default' | 'compact'
  index?: number
}

export function TestCard({ test, variant = 'default', index = 0 }: TestCardProps) {
  const router = useRouter()
  
  const handleStart = () => {
    router.push(`/tests/${test.id}`)
  }

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        whileHover={{ y: -2 }}
        className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200"
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1 text-sm">{test.name}</h3>
          <Badge 
            variant="secondary"
            className={cn("text-[10px] px-2 py-0.5 border", getStatusBg(test.status))}
          >
            {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {test.grade}
          </span>
          <span className="flex items-center gap-1">
            <FileQuestion className="h-3 w-3" />
            {test.questionCount} Qs
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {test.timeLimit}m
          </span>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-200"
    >
      {/* Top accent bar */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: index * 0.05 + 0.1, duration: 0.4 }}
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 origin-left"
      />
      
      <CardHeader className="pb-3 pt-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold text-gray-900 line-clamp-2 leading-tight">
              {test.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              {test.subjectId && (
                <Badge 
                  variant="secondary"
                  className={cn("text-xs font-medium border", getSubjectBg(test.subjectId))}
                >
                  Subject
                </Badge>
              )}
              <Badge 
                variant="secondary"
                className={cn("text-xs font-medium border", getDifficultyBg(test.difficulty))}
              >
                {test.difficulty.charAt(0).toUpperCase() + test.difficulty.slice(1)}
              </Badge>
              <Badge 
                variant="secondary"
                className={cn("text-xs font-medium border", getStatusBg(test.status))}
              >
                {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="space-y-2 text-sm text-gray-600">
          {test.description && (
            <p className="text-gray-500 text-xs line-clamp-2">{test.description}</p>
          )}
          
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-gray-400" />
              <span>{test.targetExam || test.grade}</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <FileQuestion className="h-4 w-4 text-gray-400" />
              {test.questionCount} Questions
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-gray-400" />
              {test.timeLimit} Minutes
            </span>
          </div>
          
          {test.endsAt && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar className="h-3.5 w-3.5" />
              Deadline: {formatDate(test.endsAt)}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 pb-4">
        {test.status === 'active' ? (
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full"
          >
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200"
              onClick={handleStart}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Test
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
        ) : test.status === 'upcoming' ? (
          <Button 
            variant="outline" 
            className="w-full border-gray-200 text-gray-500 hover:bg-gray-50"
            disabled
          >
            <Eye className="h-4 w-4 mr-2" />
            Upcoming
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="w-full border-gray-200 text-gray-500 hover:bg-gray-50"
            disabled
          >
            Closed
          </Button>
        )}
      </CardFooter>
    </motion.div>
  )
}
