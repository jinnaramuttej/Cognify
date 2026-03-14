'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  X, 
  Send, 
  Minimize2,
  Maximize2,
  BookOpen,
  Target,
  Lightbulb,
  HelpCircle,
  MessageCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/modules/tests/utils'
import { FadeIn } from './motion'
import type { AIAssistMessage } from '@/modules/tests/types'

// ============================================
// FLOATING AI ASSIST BUTTON
// ============================================

interface FloatingAIAssistProps {
  onOpenChange?: (open: boolean) => void
}

export function FloatingAIAssist({ onOpenChange }: FloatingAIAssistProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<AIAssistMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your AI study assistant. I can help you with:\n\n• Explaining concepts\n• Solving problems\n• Study tips & strategies\n• Test recommendations\n\nHow can I help you today?",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
    }
  }, [isOpen, isMinimized])

  // Handle send message
  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMessage: AIAssistMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1500))

    const responses = [
      "Great question! Based on your recent test performance, I'd recommend focusing on Integration techniques. The key insight is that integration by parts follows the LIATE rule - choose u based on what comes first: Logarithmic, Inverse trig, Algebraic, Trigonometric, Exponential.",
      "I've analyzed your study patterns. You're most productive between 6-9 PM with an average of 45 minutes of focused study. Consider scheduling your hardest topics during this window.",
      "Looking at your mistake patterns, 35% of errors are from calculation mistakes. Try the 'two-pass' method: solve quickly first, then verify your answer with a different approach.",
      "For Thermodynamics, the key is understanding the sign conventions. Remember: Q positive = heat absorbed, W positive = work done BY system. Draw PV diagrams for every problem!",
      "Based on similar students who improved by 20%+, the most effective strategy was daily 15-minute concept reviews. Would you like me to set up a review schedule?"
    ]

    const aiMessage: AIAssistMessage = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date()
    }

    setMessages(prev => [...prev, aiMessage])
    setIsTyping(false)
  }

  // Quick actions
  const quickActions = [
    { icon: <BookOpen className="h-4 w-4" />, label: 'Explain a concept' },
    { icon: <Target className="h-4 w-4" />, label: 'Practice problem' },
    { icon: <Lightbulb className="h-4 w-4" />, label: 'Study tip' },
    { icon: <HelpCircle className="h-4 w-4" />, label: 'Help with topic' }
  ]

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    onOpenChange?.(open)
  }

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => handleOpenChange(true)}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-shadow"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Sparkles className="h-6 w-6" />
            </motion.div>
            {/* Pulse effect */}
            <motion.div
              className="absolute inset-0 rounded-full bg-purple-500"
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={cn(
              "fixed z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden",
              isMinimized 
                ? "bottom-6 right-6 w-72 h-14" 
                : "bottom-6 right-6 w-96 h-[500px]"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-white/20">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">AI Study Assistant</h3>
                  {!isMinimized && (
                    <p className="text-xs text-purple-200">Always ready to help</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/10"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/10"
                  onClick={() => handleOpenChange(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Chat Content */}
            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="h-[340px] overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex",
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] p-3 rounded-2xl text-sm",
                          message.role === 'user'
                            ? 'bg-purple-600 text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-800 rounded-bl-md'
                        )}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex items-center gap-2 mb-2 text-purple-600">
                            <Sparkles className="h-3 w-3" />
                            <span className="text-xs font-medium">AI</span>
                          </div>
                        )}
                        <p className="whitespace-pre-line">{message.content}</p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Typing indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-md">
                        <div className="flex items-center gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 rounded-full bg-purple-400"
                              animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                              transition={{ delay: i * 0.15, duration: 0.6, repeat: Infinity }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                {messages.length === 1 && (
                  <div className="px-4 pb-2">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {quickActions.map((action) => (
                        <button
                          key={action.label}
                          onClick={() => setInputValue(action.label)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-xs text-gray-600 hover:bg-purple-100 hover:text-purple-600 transition-colors whitespace-nowrap"
                        >
                          {action.icon}
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ask me anything..."
                      className="flex-1 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                    />
                    <Button
                      size="icon"
                      onClick={handleSend}
                      disabled={!inputValue.trim() || isTyping}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ============================================
// AI RESOURCE SUMMARIZER MODAL
// ============================================

interface ResourceSummarizerProps {
  resourceType: 'chapter' | 'question' | 'test'
  resourceId: string
  title: string
  onClose: () => void
}

export function ResourceSummarizer({ resourceType, resourceId, title, onClose }: ResourceSummarizerProps) {
  const [isLoading, setIsLoading] = useState(true)

  // Simulated summary data
  const summaryData = {
    summary: "This chapter covers the fundamental principles of thermodynamics, focusing on the laws governing energy transfer and transformation in physical systems. Key topics include work, heat, internal energy, and entropy.",
    keyPoints: [
      "First Law: Energy is conserved; ΔU = Q - W",
      "Work done by gas: W = ∫PdV",
      "For isothermal process: PV = constant",
      "Entropy always increases in isolated systems",
      "Heat engines convert thermal energy to mechanical work"
    ],
    concepts: ["Thermodynamics", "Heat Transfer", "Entropy", "Ideal Gas Law", "Carnot Cycle"],
    difficulty: "medium" as const,
    readingTime: 12
  }

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">AI Summary</h3>
              <p className="text-sm text-purple-200">{title}</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-white/80 hover:text-white hover:bg-white/10"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="h-8 w-8 text-purple-500" />
              </motion.div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary */}
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Overview
                </h4>
                <p className="text-gray-700 leading-relaxed">{summaryData.summary}</p>
              </div>

              {/* Key Points */}
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Key Takeaways
                </h4>
                <ul className="space-y-2">
                  {summaryData.keyPoints.map((point, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-2"
                    >
                      <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-medium">
                        {idx + 1}
                      </div>
                      <span className="text-gray-700">{point}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Concepts */}
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Related Concepts
                </h4>
                <div className="flex flex-wrap gap-2">
                  {summaryData.concepts.map((concept) => (
                    <span
                      key={concept}
                      className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-sm border border-purple-100"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <BookOpen className="h-4 w-4" />
                  <span>{summaryData.readingTime} min read</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Target className="h-4 w-4" />
                  <span className="capitalize">{summaryData.difficulty}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            Start Learning
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
