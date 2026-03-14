'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Sparkles,
  X,
  Send,
  BookOpen,
  Brain,
  Lightbulb,
  FileText,
  MessageSquare,
  RotateCcw,
  Volume2,
  Pin,
  Minimize2,
  Maximize2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FloatingAIAssistProps {
  onQuickAction?: (action: string) => void
  onSendMessage?: (message: string) => void
  currentContext?: {
    resourceId?: string
    subject?: string
    chapter?: string
  }
  className?: string
}

const quickActions = [
  { id: 'summarize', label: 'Summarize', icon: FileText },
  { id: 'explain', label: 'Explain', icon: Lightbulb },
  { id: 'quiz', label: 'Generate Quiz', icon: Brain },
  { id: 'flashcards', label: 'Make Flashcards', icon: BookOpen },
]

export function FloatingAIAssist({
  onQuickAction,
  onSendMessage,
  currentContext,
  className,
}: FloatingAIAssistProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [message, setMessage] = useState('')
  const [isPinned, setIsPinned] = useState(false)
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    {
      role: 'assistant',
      content: `Hi! I'm Cogni, your AI study assistant. How can I help you today?`,
    },
  ])
  
  const handleSend = useCallback(() => {
    if (!message.trim()) return
    
    setMessages(prev => [...prev, { role: 'user', content: message }])
    onSendMessage?.(message)
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I'll help you with "${message}". Let me analyze the content and provide the best explanation...`,
      }])
    }, 500)
    
    setMessage('')
  }, [message, onSendMessage])
  
  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed z-50 shadow-lg transition-all duration-300',
          'rounded-full',
          isOpen
            ? 'w-10 h-10 bg-gray-100 hover:bg-gray-200 right-6 bottom-6'
            : 'w-14 h-14 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 right-6 bottom-6',
          'flex items-center justify-center',
          className,
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="h-5 w-5 text-gray-600" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="relative"
            >
              <Sparkles className="h-6 w-6 text-white" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-white/20"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
      
      {/* AI Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed z-40 right-6 bottom-20',
              isExpanded
                ? 'left-6 bottom-20 h-[calc(100vh-8rem)]'
                : 'w-[380px] h-[500px]',
            )}
          >
            <Card className="h-full overflow-hidden shadow-2xl border-gray-200 flex flex-col">
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
                  >
                    <Sparkles className="h-5 w-5" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold">Cogni AI</h3>
                    <p className="text-xs text-white/70">Your study assistant</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsPinned(!isPinned)}
                    className={cn(
                      'h-8 w-8 text-white/70 hover:text-white hover:bg-white/10',
                      isPinned && 'bg-white/20 text-white',
                    )}
                  >
                    <Pin className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                  >
                    {isExpanded ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'flex',
                      msg.role === 'user' ? 'justify-end' : 'justify-start',
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[80%] p-3 rounded-2xl',
                        msg.role === 'user'
                          ? 'bg-blue-500 text-white rounded-br-md'
                          : 'bg-gray-100 text-gray-800 rounded-bl-md',
                      )}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Quick Actions */}
              <div className="px-4 pb-2">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {quickActions.map((action) => (
                    <Button
                      key={action.id}
                      variant="outline"
                      size="sm"
                      onClick={() => onQuickAction?.(action.id)}
                      className="flex-shrink-0 rounded-full px-3"
                    >
                      <action.icon className="h-3.5 w-3.5 mr-1.5" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Input */}
              <div className="p-4 border-t border-gray-100">
                <div className="relative">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask anything about your studies..."
                    className="pr-12"
                  />
                  <div className="absolute right-1 top-1 bottom-1 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-gray-400 hover:text-gray-600"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      onClick={handleSend}
                      disabled={!message.trim()}
                      className="h-7 w-7 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default FloatingAIAssist
