'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  Brain,
  Lightbulb,
  Target,
  BookOpen,
  Clock,
  MessageSquare,
  Copy,
  Check,
  Volume2,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
export interface SummaryPoint {
  id: string
  text: string
  type: 'key_concept' | 'definition' | 'formula' | 'example' | 'important'
}

export interface ConceptExplanation {
  concept: string
  explanation: string
  relatedConcepts: string[]
}

interface AISummaryWidgetProps {
  resourceId: string
  title: string
  summaryPoints?: SummaryPoint[]
  keyTakeaways?: string[]
  conceptExplanations?: ConceptExplanation[]
  estimatedReadTime?: number
  onAskQuestion?: (question: string) => void
  onRegenerate?: () => void
  isLoading?: boolean
  className?: string
}

const pointTypeConfig = {
  key_concept: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Brain, label: 'Key Concept' },
  definition: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: BookOpen, label: 'Definition' },
  formula: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Target, label: 'Formula' },
  example: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Lightbulb, label: 'Example' },
  important: { color: 'bg-red-100 text-red-700 border-red-200', icon: FileText, label: 'Important' },
}

export function AISummaryWidget({
  resourceId,
  title,
  summaryPoints = [],
  keyTakeaways = [],
  conceptExplanations = [],
  estimatedReadTime = 5,
  onAskQuestion,
  onRegenerate,
  isLoading = false,
  className,
}: AISummaryWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showConceptModal, setShowConceptModal] = useState<ConceptExplanation | null>(null)
  const [copied, setCopied] = useState(false)
  const [question, setQuestion] = useState('')
  
  // Mock data for demo
  const mockSummary: SummaryPoint[] = summaryPoints.length > 0 ? summaryPoints : [
    { id: '1', text: 'Coulomb\'s Law describes the electrostatic force between charged particles', type: 'key_concept' },
    { id: '2', text: 'F = k(q₁q₂)/r² where k = 8.99 × 10⁹ N·m²/C²', type: 'formula' },
    { id: '3', text: 'Force is directly proportional to product of charges and inversely to square of distance', type: 'definition' },
    { id: '4', text: 'Example: Two protons 1nm apart experience ~2.3 × 10⁻²⁸ N repulsion', type: 'example' },
    { id: '5', text: 'Vector nature: Force acts along the line connecting charges', type: 'important' },
  ]
  
  const mockTakeaways: string[] = keyTakeaways.length > 0 ? keyTakeaways : [
    'Memorize the value of Coulomb\'s constant k',
    'Remember: like charges repel, opposite charges attract',
    'Force direction is along the line joining charges',
    'Compare with gravitational force formula',
  ]
  
  const mockConcepts: ConceptExplanation[] = conceptExplanations.length > 0 ? conceptExplanations : [
    {
      concept: 'Electric Field',
      explanation: 'The electric field is the force per unit charge at a point in space, created by surrounding charges.',
      relatedConcepts: ['Electric Potential', 'Gauss\'s Law'],
    },
    {
      concept: 'Superposition Principle',
      explanation: 'The total force on a charge is the vector sum of individual forces from all other charges.',
      relatedConcepts: ['Vector Addition', 'Electric Field Lines'],
    },
  ]
  
  // Copy summary
  const handleCopy = () => {
    const text = mockSummary.map(p => `• ${p.text}`).join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <>
      <Card className={cn('overflow-hidden', className)}>
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold">AI Summary</h3>
              <p className="text-xs text-white/70">Key points extracted by AI</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </button>
        
        {/* Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {/* Loading State */}
              {isLoading ? (
                <div className="p-6 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent mx-auto mb-3"
                  />
                  <p className="text-sm text-gray-500">AI is analyzing the content...</p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {/* Summary Points */}
                  <div className="space-y-2">
                    {mockSummary.map((point, index) => {
                      const config = pointTypeConfig[point.type]
                      const Icon = config.icon
                      
                      return (
                        <motion.div
                          key={point.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-start gap-2"
                        >
                          <Badge className={cn('mt-0.5 gap-1 text-xs', config.color)}>
                            <Icon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                          <p className="text-sm text-gray-700 flex-1">{point.text}</p>
                        </motion.div>
                      )
                    })}
                  </div>
                  
                  {/* Key Takeaways */}
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <h4 className="font-medium text-sm text-blue-900 mb-2 flex items-center gap-1.5">
                      <Lightbulb className="h-4 w-4" />
                      Key Takeaways
                    </h4>
                    <ul className="space-y-1">
                      {mockTakeaways.map((takeaway, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + index * 0.05 }}
                          className="text-sm text-blue-700 flex items-start gap-2"
                        >
                          <span className="text-blue-400 mt-1">•</span>
                          {takeaway}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Quick Concepts */}
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Quick Concepts</h4>
                    <div className="flex flex-wrap gap-2">
                      {mockConcepts.map((concept) => (
                        <button
                          key={concept.concept}
                          onClick={() => setShowConceptModal(concept)}
                          className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                        >
                          {concept.concept}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      className="flex-1"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 mr-1 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4 mr-1" />
                      )}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Volume2 className="h-4 w-4 mr-1" />
                      Listen
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onRegenerate}
                      className="flex-1"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Regenerate
                    </Button>
                  </div>
                  
                  {/* Ask Question */}
                  <div className="relative">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask AI about this content..."
                      className="w-full pl-4 pr-12 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        if (question.trim()) {
                          onAskQuestion?.(question)
                          setQuestion('')
                        }
                      }}
                      className="absolute right-1 top-1 bottom-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                    >
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
      
      {/* Concept Explanation Modal */}
      <AnimatePresence>
        {showConceptModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowConceptModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
            >
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {showConceptModal.concept}
                </h3>
                <p className="text-gray-600 mb-4">{showConceptModal.explanation}</p>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Related Concepts</h4>
                  <div className="flex flex-wrap gap-2">
                    {showConceptModal.relatedConcepts.map((concept) => (
                      <Badge key={concept} variant="secondary">
                        {concept}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowConceptModal(null)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      onAskQuestion?.(`Explain more about ${showConceptModal.concept}`)
                      setShowConceptModal(null)
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500"
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Ask AI More
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AISummaryWidget
