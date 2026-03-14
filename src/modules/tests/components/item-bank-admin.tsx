'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Filter, Plus, Upload, Download, ChevronDown, ChevronUp, 
  MoreHorizontal, Edit, Trash2, Eye, AlertTriangle, CheckCircle, 
  Clock, FileText, BarChart3, TrendingUp, TrendingDown, X, Save,
  FileSpreadsheet, AlertCircle, Check, ChevronRight, Layers,
  BookOpen, Tag, User, Calendar, Hash, Target, Zap
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select'
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/modules/tests/utils'
import { FadeIn, StaggerContainer, StaggerItem } from './motion'

// Types
type ItemStatus = 'draft' | 'review' | 'staged' | 'live'
type Difficulty = 'easy' | 'medium' | 'hard'
type CognitiveLevel = 'recall' | 'understand' | 'apply' | 'analyze'

interface ItemStats {
  pValue: number
  discriminationIndex: number
  avgTimeSeconds: number
  skipRate: number
  usageCount: number
  qualityScore: number
}

interface ItemVersion {
  versionNumber: number
  changeSummary: string
  changedBy: string
  changeType: string
  createdAt: Date
}

interface ItemReview {
  reviewerId: string
  score: number
  accuracyScore: number
  clarityScore: number
  relevanceScore: number
  status: string
  comments: string
  createdAt: Date
}

interface ItemBankItem {
  id: string
  text: string
  subjectId: string
  subjectName: string
  chapterId: string
  chapterName: string
  difficulty: Difficulty
  itemStatus: ItemStatus
  cognitiveLevel: CognitiveLevel
  examType: string
  isPYQ: boolean
  pyqYear?: number
  pyqExam?: string
  createdBy: string
  authorName: string
  sourceRef?: string
  marks: number
  negativeMarks: number
  options: Array<{ id: string; label: string; text: string; isCorrect: boolean }>
  explanation: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  stats?: ItemStats
  versions?: ItemVersion[]
  reviews?: ItemReview[]
}

// Sample data
const SAMPLE_ITEMS: ItemBankItem[] = [
  {
    id: 'item-1',
    text: 'A particle moves in a straight line with constant acceleration. If it covers distances of 10m and 20m in consecutive seconds, what is its initial velocity?',
    subjectId: 'phy',
    subjectName: 'Physics',
    chapterId: 'mech-1',
    chapterName: 'Mechanics',
    difficulty: 'medium',
    itemStatus: 'live',
    cognitiveLevel: 'apply',
    examType: 'JEE Main',
    isPYQ: true,
    pyqYear: 2022,
    pyqExam: 'JEE Main',
    createdBy: 'user-1',
    authorName: 'Dr. Sharma',
    sourceRef: 'JEE Main 2022 - Shift 1',
    marks: 4,
    negativeMarks: 1,
    options: [
      { id: 'A', label: 'A', text: '5 m/s', isCorrect: true },
      { id: 'B', label: 'B', text: '10 m/s', isCorrect: false },
      { id: 'C', label: 'C', text: '15 m/s', isCorrect: false },
      { id: 'D', label: 'D', text: '20 m/s', isCorrect: false },
    ],
    explanation: 'Using kinematic equations...',
    tags: ['kinematics', 'motion', 'acceleration'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-20'),
    stats: {
      pValue: 0.62,
      discriminationIndex: 0.45,
      avgTimeSeconds: 85,
      skipRate: 0.08,
      usageCount: 1250,
      qualityScore: 0.78
    }
  },
  {
    id: 'item-2',
    text: 'Which of the following compounds will give a positive iodoform test?',
    subjectId: 'che',
    subjectName: 'Chemistry',
    chapterId: 'org-2',
    chapterName: 'Organic Chemistry',
    difficulty: 'hard',
    itemStatus: 'review',
    cognitiveLevel: 'analyze',
    examType: 'NEET',
    isPYQ: false,
    createdBy: 'user-2',
    authorName: 'Prof. Gupta',
    marks: 4,
    negativeMarks: 1,
    options: [
      { id: 'A', label: 'A', text: 'Ethanol', isCorrect: true },
      { id: 'B', label: 'B', text: 'Methanol', isCorrect: false },
      { id: 'C', label: 'C', text: 'Propan-2-ol', isCorrect: true },
      { id: 'D', label: 'D', text: 'Phenol', isCorrect: false },
    ],
    explanation: 'Iodoform test is positive for compounds with CH3CO- group or oxidizable to it...',
    tags: ['organic', 'tests', 'alcohols'],
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-15'),
    stats: {
      pValue: 0.35,
      discriminationIndex: 0.52,
      avgTimeSeconds: 95,
      skipRate: 0.15,
      usageCount: 420,
      qualityScore: 0.65
    },
    reviews: [
      {
        reviewerId: 'reviewer-1',
        score: 4,
        accuracyScore: 4,
        clarityScore: 5,
        relevanceScore: 4,
        status: 'approved',
        comments: 'Good question but option C makes it tricky. Consider clarifying.',
        createdAt: new Date('2024-02-12')
      }
    ]
  },
  {
    id: 'item-3',
    text: 'The genetic material in most organisms is DNA. Which of the following statements about DNA is incorrect?',
    subjectId: 'bio',
    subjectName: 'Biology',
    chapterId: 'mol-bio',
    chapterName: 'Molecular Biology',
    difficulty: 'easy',
    itemStatus: 'staged',
    cognitiveLevel: 'understand',
    examType: 'NEET',
    isPYQ: true,
    pyqYear: 2021,
    pyqExam: 'NEET',
    createdBy: 'user-3',
    authorName: 'Dr. Patel',
    sourceRef: 'NCERT Class 12',
    marks: 4,
    negativeMarks: 1,
    options: [
      { id: 'A', label: 'A', text: 'DNA is double stranded', isCorrect: false },
      { id: 'B', label: 'B', text: 'DNA contains thymine', isCorrect: false },
      { id: 'C', label: 'C', text: 'DNA is found only in nucleus', isCorrect: true },
      { id: 'D', label: 'D', text: 'DNA replicates semi-conservatively', isCorrect: false },
    ],
    explanation: 'DNA is also found in mitochondria and chloroplasts...',
    tags: ['DNA', 'genetics', 'cell-biology'],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-25'),
    stats: {
      pValue: 0.75,
      discriminationIndex: 0.38,
      avgTimeSeconds: 45,
      skipRate: 0.03,
      usageCount: 890,
      qualityScore: 0.82
    }
  },
  {
    id: 'item-4',
    text: 'Find the value of ∫₀^π sin²x dx / (1 + 2^cos x)',
    subjectId: 'mat',
    subjectName: 'Mathematics',
    chapterId: 'int-1',
    chapterName: 'Integration',
    difficulty: 'hard',
    itemStatus: 'draft',
    cognitiveLevel: 'apply',
    examType: 'JEE Advanced',
    isPYQ: false,
    createdBy: 'user-4',
    authorName: 'Mr. Kumar',
    marks: 4,
    negativeMarks: 0,
    options: [
      { id: 'A', label: 'A', text: 'π/2', isCorrect: true },
      { id: 'B', label: 'B', text: 'π/4', isCorrect: false },
      { id: 'C', label: 'C', text: 'π', isCorrect: false },
      { id: 'D', label: 'D', text: '0', isCorrect: false },
    ],
    explanation: 'Using the property ∫₀^a f(x) dx = ∫₀^a f(a-x) dx...',
    tags: ['integration', 'definite', 'properties'],
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
    stats: {
      pValue: 0,
      discriminationIndex: 0,
      avgTimeSeconds: 0,
      skipRate: 0,
      usageCount: 0,
      qualityScore: 0
    }
  },
  {
    id: 'item-5',
    text: 'Two blocks of masses 2kg and 4kg are connected by a massless string passing over a frictionless pulley. Find the acceleration of the system.',
    subjectId: 'phy',
    subjectName: 'Physics',
    chapterId: 'laws-1',
    chapterName: 'Laws of Motion',
    difficulty: 'medium',
    itemStatus: 'live',
    cognitiveLevel: 'apply',
    examType: 'JEE Main',
    isPYQ: true,
    pyqYear: 2023,
    pyqExam: 'JEE Main',
    createdBy: 'user-1',
    authorName: 'Dr. Sharma',
    sourceRef: 'JEE Main 2023 - Shift 2',
    marks: 4,
    negativeMarks: 1,
    options: [
      { id: 'A', label: 'A', text: 'g/3', isCorrect: true },
      { id: 'B', label: 'B', text: 'g/2', isCorrect: false },
      { id: 'C', label: 'C', text: '2g/3', isCorrect: false },
      { id: 'D', label: 'D', text: 'g', isCorrect: false },
    ],
    explanation: 'Using Newton\'s second law for both blocks...',
    tags: ['newton-laws', 'pulley', 'dynamics'],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-15'),
    stats: {
      pValue: 0.58,
      discriminationIndex: 0.62,
      avgTimeSeconds: 72,
      skipRate: 0.05,
      usageCount: 2100,
      qualityScore: 0.85
    },
    versions: [
      {
        versionNumber: 1,
        changeSummary: 'Initial creation',
        changedBy: 'user-1',
        changeType: 'create',
        createdAt: new Date('2024-02-01')
      },
      {
        versionNumber: 2,
        changeSummary: 'Fixed typo in option B',
        changedBy: 'user-1',
        changeType: 'correction',
        createdAt: new Date('2024-03-15')
      }
    ]
  },
]

const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Biology']
const STATUSES: ItemStatus[] = ['draft', 'review', 'staged', 'live']
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

// Status Badge Component
function StatusBadge({ status }: { status: ItemStatus }) {
  const config = {
    draft: { bg: 'bg-gray-100', text: 'text-gray-700', icon: <FileText className="h-3 w-3" /> },
    review: { bg: 'bg-amber-100', text: 'text-amber-700', icon: <Clock className="h-3 w-3" /> },
    staged: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <Target className="h-3 w-3" /> },
    live: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: <CheckCircle className="h-3 w-3" /> },
  }
  
  const { bg, text, icon } = config[status]
  
  return (
    <Badge variant="secondary" className={cn('gap-1 font-medium', bg, text)}>
      {icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

// Difficulty Dot Component
function DifficultyDot({ difficulty }: { difficulty: Difficulty }) {
  const config = {
    easy: { color: 'bg-emerald-500', label: 'Easy' },
    medium: { color: 'bg-amber-500', label: 'Medium' },
    hard: { color: 'bg-red-500', label: 'Hard' },
  }
  
  const { color, label } = config[difficulty]
  
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn('w-2.5 h-2.5 rounded-full', color)} />
      <span className="text-xs text-gray-600">{label}</span>
    </div>
  )
}

// P-Value Indicator
function PValueIndicator({ pValue }: { pValue: number }) {
  const getColor = (p: number) => {
    if (p < 0.3) return 'text-red-600 bg-red-50'
    if (p < 0.7) return 'text-emerald-600 bg-emerald-50'
    return 'text-amber-600 bg-amber-50'
  }
  
  const getLabel = (p: number) => {
    if (p < 0.3) return 'Hard'
    if (p < 0.7) return 'Optimal'
    return 'Easy'
  }
  
  return (
    <div className={cn('px-2 py-0.5 rounded text-xs font-medium', getColor(pValue))}>
      {pValue.toFixed(2)} ({getLabel(pValue)})
    </div>
  )
}

// Discrimination Indicator
function DiscriminationIndicator({ value }: { value: number }) {
  const getColor = (v: number) => {
    if (v >= 0.4) return 'text-emerald-600'
    if (v >= 0.2) return 'text-amber-600'
    return 'text-red-600'
  }
  
  return (
    <div className={cn('flex items-center gap-1 text-sm font-medium', getColor(value))}>
      {value >= 0.4 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
      {value.toFixed(2)}
    </div>
  )
}

// Item Stats Row (Expandable)
function ItemStatsRow({ item }: { item: ItemBankItem }) {
  const stats = item.stats
  
  if (!stats || stats.usageCount === 0) {
    return (
      <div className="p-4 bg-gray-50 text-center text-sm text-gray-500">
        No usage data available yet
      </div>
    )
  }
  
  return (
    <div className="p-4 bg-gray-50 border-t border-gray-100">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* P-Value */}
        <div className="space-y-1">
          <div className="text-xs text-gray-500 uppercase tracking-wider">P-Value</div>
          <PValueIndicator pValue={stats.pValue} />
          <div className="text-xs text-gray-400">Proportion correct</div>
        </div>
        
        {/* Discrimination */}
        <div className="space-y-1">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Discrimination</div>
          <DiscriminationIndicator value={stats.discriminationIndex} />
          <div className="text-xs text-gray-400">Point-biserial</div>
        </div>
        
        {/* Avg Time */}
        <div className="space-y-1">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Avg Time</div>
          <div className="text-sm font-medium text-gray-700">{Math.round(stats.avgTimeSeconds)}s</div>
          <div className="text-xs text-gray-400">Per question</div>
        </div>
        
        {/* Skip Rate */}
        <div className="space-y-1">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Skip Rate</div>
          <div className="text-sm font-medium text-gray-700">{(stats.skipRate * 100).toFixed(1)}%</div>
          <Progress value={stats.skipRate * 100} className="h-1.5 mt-1" />
        </div>
        
        {/* Usage */}
        <div className="space-y-1">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Usage</div>
          <div className="text-sm font-medium text-gray-700">{stats.usageCount.toLocaleString()}</div>
          <div className="text-xs text-gray-400">Times attempted</div>
        </div>
        
        {/* Quality Score */}
        <div className="space-y-1">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Quality</div>
          <div className="flex items-center gap-2">
            <Progress value={stats.qualityScore * 100} className="h-1.5 flex-1" />
            <span className="text-sm font-medium text-gray-700">{(stats.qualityScore * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>
      
      {/* Reviews */}
      {item.reviews && item.reviews.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Reviews</div>
          {item.reviews.map((review, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-gray-700">{review.score}/5</span>
                <CheckCircle className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">{review.comments}</p>
                <div className="flex gap-4 mt-1 text-xs text-gray-400">
                  <span>Accuracy: {review.accuracyScore}/5</span>
                  <span>Clarity: {review.clarityScore}/5</span>
                  <span>Relevance: {review.relevanceScore}/5</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Version History */}
      {item.versions && item.versions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Version History</div>
          <div className="flex gap-2">
            {item.versions.map((version, idx) => (
              <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs">
                <Hash className="h-3 w-3 text-gray-400" />
                <span className="font-medium">v{version.versionNumber}</span>
                <span className="text-gray-400">-</span>
                <span className="text-gray-600">{version.changeSummary}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Edit Modal
function EditItemModal({ 
  item, 
  isOpen, 
  onClose, 
  onSave 
}: { 
  item: ItemBankItem | null
  isOpen: boolean
  onClose: () => void
  onSave: (item: ItemBankItem) => void
}) {
  const [editedItem, setEditedItem] = useState<ItemBankItem | null>(null)
  
  // Update editedItem when item prop changes
  useState(() => {
    if (item) {
      setEditedItem({ ...item })
    }
  })
  
  if (!item || !editedItem) return null
  
  const handleSave = () => {
    onSave(editedItem)
    onClose()
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-blue-600" />
            Edit Item
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Edit Form */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Question Text</label>
              <Textarea 
                value={editedItem.text}
                onChange={(e) => setEditedItem({ ...editedItem, text: e.target.value })}
                rows={4}
                className="mt-1"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Subject</label>
                <Select value={editedItem.subjectName} onValueChange={(v) => setEditedItem({ ...editedItem, subjectName: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Difficulty</label>
                <Select value={editedItem.difficulty} onValueChange={(v: Difficulty) => setEditedItem({ ...editedItem, difficulty: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select value={editedItem.itemStatus} onValueChange={(v: ItemStatus) => setEditedItem({ ...editedItem, itemStatus: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Cognitive Level</label>
                <Select value={editedItem.cognitiveLevel} onValueChange={(v: CognitiveLevel) => setEditedItem({ ...editedItem, cognitiveLevel: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recall">Recall</SelectItem>
                    <SelectItem value="understand">Understand</SelectItem>
                    <SelectItem value="apply">Apply</SelectItem>
                    <SelectItem value="analyze">Analyze</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Marks</label>
                <Input 
                  type="number" 
                  value={editedItem.marks} 
                  onChange={(e) => setEditedItem({ ...editedItem, marks: parseFloat(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Negative Marks</label>
                <Input 
                  type="number" 
                  value={editedItem.negativeMarks} 
                  onChange={(e) => setEditedItem({ ...editedItem, negativeMarks: parseFloat(e.target.value) })}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Source Reference</label>
              <Input 
                value={editedItem.sourceRef || ''} 
                onChange={(e) => setEditedItem({ ...editedItem, sourceRef: e.target.value })}
                className="mt-1"
                placeholder="e.g., NCERT Class 12, JEE Main 2023"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Explanation</label>
              <Textarea 
                value={editedItem.explanation}
                onChange={(e) => setEditedItem({ ...editedItem, explanation: e.target.value })}
                rows={3}
                className="mt-1"
              />
            </div>
            
            {/* Options Editor */}
            <div>
              <label className="text-sm font-medium text-gray-700">Options</label>
              <div className="mt-2 space-y-2">
                {editedItem.options.map((opt, idx) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <span className={cn(
                      'w-8 h-8 flex items-center justify-center rounded-lg font-medium text-sm',
                      opt.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    )}>
                      {opt.label}
                    </span>
                    <Input 
                      value={opt.text}
                      onChange={(e) => {
                        const newOptions = [...editedItem.options]
                        newOptions[idx] = { ...opt, text: e.target.value }
                        setEditedItem({ ...editedItem, options: newOptions })
                      }}
                      className="flex-1"
                    />
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        const newOptions = editedItem.options.map((o, i) => ({
                          ...o,
                          isCorrect: i === idx
                        }))
                        setEditedItem({ ...editedItem, options: newOptions })
                      }}
                      className={cn(opt.isCorrect && 'text-emerald-600')}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Live Preview */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Live Preview
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DifficultyDot difficulty={editedItem.difficulty} />
                  <StatusBadge status={editedItem.itemStatus} />
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{editedItem.marks} marks</span>
                  <span>•</span>
                  <span>-{editedItem.negativeMarks} negative</span>
                </div>
              </div>
              
              {/* Question */}
              <div className="text-gray-800 leading-relaxed">
                {editedItem.text}
              </div>
              
              {/* Options */}
              <div className="space-y-2">
                {editedItem.options.map((opt) => (
                  <div 
                    key={opt.id}
                    className={cn(
                      'p-3 rounded-lg border-2 text-sm',
                      opt.isCorrect 
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800' 
                        : 'border-gray-200 bg-gray-50 text-gray-700'
                    )}
                  >
                    <span className="font-medium mr-2">{opt.label}.</span>
                    {opt.text}
                    {opt.isCorrect && <CheckCircle className="inline-block h-4 w-4 ml-2 text-emerald-600" />}
                  </div>
                ))}
              </div>
              
              {/* Explanation Preview */}
              <div className="pt-3 border-t border-gray-100">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Explanation</div>
                <p className="text-sm text-gray-600">{editedItem.explanation}</p>
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {editedItem.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// CSV Import Modal
function CSVImportModal({ 
  isOpen, 
  onClose, 
  onImport 
}: { 
  isOpen: boolean
  onClose: () => void
  onImport: (data: any[]) => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<any[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [warnings, setWarnings] = useState<string[]>([])
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      // Simulate CSV parsing
      setPreview([
        { question: 'What is the SI unit of force?', subject: 'Physics', chapter: 'Mechanics', difficulty: 'easy', option_a: 'Newton', option_b: 'Joule', option_c: 'Watt', option_d: 'Pascal', correct: 'A' },
        { question: 'Which compound is aromatic?', subject: 'Chemistry', chapter: 'Organic', difficulty: 'medium', option_a: 'Cyclohexane', option_b: 'Benzene', option_c: 'Cyclopentane', option_d: 'Hexane', correct: 'B' },
      ])
      setWarnings(['Row 2: Missing "tags" field - will be empty'])
    }
  }
  
  const handleImport = () => {
    onImport(preview)
    onClose()
    setFile(null)
    setPreview([])
    setErrors([])
    setWarnings([])
  }
  
  const templateColumns = [
    { name: 'question', required: true, description: 'Question text' },
    { name: 'subject', required: true, description: 'Physics, Chemistry, Mathematics, Biology' },
    { name: 'chapter', required: true, description: 'Chapter name' },
    { name: 'difficulty', required: true, description: 'easy, medium, hard' },
    { name: 'option_a', required: true, description: 'Option A text' },
    { name: 'option_b', required: true, description: 'Option B text' },
    { name: 'option_c', required: true, description: 'Option C text' },
    { name: 'option_d', required: true, description: 'Option D text' },
    { name: 'correct', required: true, description: 'Correct option (A/B/C/D)' },
    { name: 'explanation', required: false, description: 'Explanation text' },
    { name: 'marks', required: false, description: 'Default: 4' },
    { name: 'negative_marks', required: false, description: 'Default: 1' },
    { name: 'tags', required: false, description: 'Comma-separated tags' },
    { name: 'source_ref', required: false, description: 'Source reference' },
    { name: 'is_pyq', required: false, description: 'true/false' },
    { name: 'pyq_year', required: false, description: 'Year if PYQ' },
    { name: 'pyq_exam', required: false, description: 'JEE Main, NEET, etc.' },
  ]
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            Import Items from CSV
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Template Download */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-start gap-3">
              <FileSpreadsheet className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">CSV Template</h4>
                <p className="text-sm text-gray-600 mt-1">Download the template to ensure correct format</p>
                <Button size="sm" variant="outline" className="mt-2">
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </div>
          </div>
          
          {/* Column Reference */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Column Reference</h4>
            <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2 text-sm">
                {templateColumns.map((col) => (
                  <div key={col.name} className="flex items-center gap-2">
                    <code className={cn(
                      'px-2 py-0.5 rounded text-xs',
                      col.required ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-700'
                    )}>
                      {col.name}
                    </code>
                    <span className="text-gray-500 text-xs">{col.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload CSV File</label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-blue-300 transition-colors">
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-gray-400 mt-1">CSV files only, max 10MB</p>
              </label>
            </div>
          </div>
          
          {/* Validation Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
                <AlertCircle className="h-4 w-4" />
                Validation Errors
              </div>
              <ul className="text-sm text-red-600 space-y-1">
                {errors.map((err, idx) => (
                  <li key={idx}>• {err}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
              <div className="flex items-center gap-2 text-amber-700 font-medium mb-2">
                <AlertTriangle className="h-4 w-4" />
                Warnings
              </div>
              <ul className="text-sm text-amber-600 space-y-1">
                {warnings.map((warn, idx) => (
                  <li key={idx}>• {warn}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Preview ({preview.length} items)</h4>
              <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Question</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Subject</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Difficulty</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Correct</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="border-t border-gray-100">
                        <td className="px-3 py-2 text-gray-600 truncate max-w-xs">{row.question}</td>
                        <td className="px-3 py-2 text-gray-600">{row.subject}</td>
                        <td className="px-3 py-2 text-gray-600">{row.difficulty}</td>
                        <td className="px-3 py-2 text-gray-600">{row.correct}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.length > 5 && (
                  <div className="px-3 py-2 bg-gray-100 text-sm text-gray-500">
                    ... and {preview.length - 5} more items
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleImport} 
            disabled={preview.length === 0 || errors.length > 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import {preview.length > 0 ? `(${preview.length} items)` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Coverage Heatmap
function CoverageHeatmap() {
  const subjects = [
    { 
      name: 'Physics', 
      chapters: [
        { name: 'Mechanics', total: 85, required: 50, gap: 0 },
        { name: 'Thermodynamics', total: 45, required: 50, gap: 5 },
        { name: 'Waves', total: 62, required: 50, gap: 0 },
        { name: 'Optics', total: 38, required: 50, gap: 12 },
        { name: 'Electromagnetism', total: 72, required: 50, gap: 0 },
        { name: 'Modern Physics', total: 28, required: 50, gap: 22 },
      ]
    },
    { 
      name: 'Chemistry', 
      chapters: [
        { name: 'Physical Chemistry', total: 55, required: 50, gap: 0 },
        { name: 'Organic Chemistry', total: 42, required: 50, gap: 8 },
        { name: 'Inorganic Chemistry', total: 58, required: 50, gap: 0 },
      ]
    },
    { 
      name: 'Mathematics', 
      chapters: [
        { name: 'Algebra', total: 68, required: 50, gap: 0 },
        { name: 'Calculus', total: 92, required: 50, gap: 0 },
        { name: 'Coordinate Geometry', total: 45, required: 50, gap: 5 },
        { name: 'Trigonometry', total: 35, required: 50, gap: 15 },
        { name: 'Statistics', total: 20, required: 50, gap: 30 },
      ]
    },
    { 
      name: 'Biology', 
      chapters: [
        { name: 'Botany', total: 78, required: 50, gap: 0 },
        { name: 'Zoology', total: 65, required: 50, gap: 0 },
        { name: 'Genetics', total: 48, required: 50, gap: 2 },
        { name: 'Ecology', total: 32, required: 50, gap: 18 },
      ]
    },
  ]
  
  const getColor = (gap: number) => {
    if (gap === 0) return 'bg-emerald-500'
    if (gap <= 10) return 'bg-amber-500'
    if (gap <= 20) return 'bg-orange-500'
    return 'bg-red-500'
  }
  
  const getOpacity = (total: number, required: number) => {
    const ratio = total / required
    if (ratio >= 1.5) return 'opacity-100'
    if (ratio >= 1) return 'opacity-80'
    if (ratio >= 0.7) return 'opacity-60'
    return 'opacity-40'
  }
  
  return (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <CardHeader className="border-b border-gray-100 pb-3">
        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Layers className="h-4 w-4 text-blue-600" />
          Item Coverage Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {subjects.map((subject) => (
            <div key={subject.name}>
              <div className="text-sm font-medium text-gray-700 mb-2">{subject.name}</div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {subject.chapters.map((chapter) => (
                  <motion.div
                    key={chapter.name}
                    whileHover={{ scale: 1.05 }}
                    className={cn(
                      'p-2 rounded-lg text-center cursor-pointer transition-all',
                      getColor(chapter.gap),
                      getOpacity(chapter.total, chapter.required)
                    )}
                  >
                    <div className="text-xs font-medium text-white truncate">{chapter.name}</div>
                    <div className="text-lg font-bold text-white">{chapter.total}</div>
                    {chapter.gap > 0 && (
                      <div className="text-xs text-white/80">-{chapter.gap} needed</div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">Legend:</div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-emerald-500" />
            <span className="text-xs text-gray-600">Sufficient</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-amber-500" />
            <span className="text-xs text-gray-600">Low (1-10)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-orange-500" />
            <span className="text-xs text-gray-600">Medium (11-20)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-red-500" />
            <span className="text-xs text-gray-600">Critical (20+)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Main Component
export function ItemBankAdmin() {
  const [items, setItems] = useState<ItemBankItem[]>(SAMPLE_ITEMS)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [subjectFilter, setSubjectFilter] = useState<string>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<keyof ItemBankItem>('updatedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [editingItem, setEditingItem] = useState<ItemBankItem | null>(null)
  const [showCSVImport, setShowCSVImport] = useState(false)
  
  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    let result = [...items]
    
    // Apply filters
    if (searchQuery) {
      result = result.filter(item => 
        item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.chapterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(item => item.itemStatus === statusFilter)
    }
    
    if (subjectFilter !== 'all') {
      result = result.filter(item => item.subjectName === subjectFilter)
    }
    
    if (difficultyFilter !== 'all') {
      result = result.filter(item => item.difficulty === difficultyFilter)
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let aVal = a[sortField]
      let bVal = b[sortField]
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }
      
      if (aVal! < bVal!) return sortOrder === 'asc' ? -1 : 1
      if (aVal! > bVal!) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
    
    return result
  }, [items, searchQuery, statusFilter, subjectFilter, difficultyFilter, sortField, sortOrder])
  
  // Stats
  const stats = useMemo(() => {
    const total = items.length
    const live = items.filter(i => i.itemStatus === 'live').length
    const review = items.filter(i => i.itemStatus === 'review').length
    const flagged = items.filter(i => i.stats && i.stats.qualityScore < 0.5).length
    const avgPValue = items.reduce((sum, i) => sum + (i.stats?.pValue || 0), 0) / items.filter(i => i.stats?.pValue).length || 0
    const avgDiscrimination = items.reduce((sum, i) => sum + (i.stats?.discriminationIndex || 0), 0) / items.filter(i => i.stats?.discriminationIndex).length || 0
    
    return { total, live, review, flagged, avgPValue, avgDiscrimination }
  }, [items])
  
  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }
  
  const handleSort = (field: keyof ItemBankItem) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }
  
  const handleSaveItem = (item: ItemBankItem) => {
    setItems(prev => prev.map(i => i.id === item.id ? item : i))
  }
  
  const handleCSVImport = (data: any[]) => {
    // Simulate import
    const newItems: ItemBankItem[] = data.map((row, idx) => ({
      id: `imported-${idx}`,
      text: row.question,
      subjectId: row.subject.toLowerCase().slice(0, 3),
      subjectName: row.subject,
      chapterId: row.chapter.toLowerCase().replace(/\s/g, '-'),
      chapterName: row.chapter,
      difficulty: row.difficulty,
      itemStatus: 'draft' as ItemStatus,
      cognitiveLevel: 'apply' as CognitiveLevel,
      examType: 'JEE Main',
      isPYQ: false,
      createdBy: 'import',
      authorName: 'CSV Import',
      marks: row.marks || 4,
      negativeMarks: row.negative_marks || 1,
      options: [
        { id: 'A', label: 'A', text: row.option_a, isCorrect: row.correct === 'A' },
        { id: 'B', label: 'B', text: row.option_b, isCorrect: row.correct === 'B' },
        { id: 'C', label: 'C', text: row.option_c, isCorrect: row.correct === 'C' },
        { id: 'D', label: 'D', text: row.option_d, isCorrect: row.correct === 'D' },
      ],
      explanation: row.explanation || '',
      tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()) : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
    
    setItems(prev => [...prev, ...newItems])
  }
  
  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider">Total Items</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider">Live</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">{stats.live}</div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider">In Review</div>
            <div className="text-2xl font-bold text-amber-600 mt-1">{stats.review}</div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider">Flagged</div>
            <div className="text-2xl font-bold text-red-600 mt-1">{stats.flagged}</div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider">Avg P-Value</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{stats.avgPValue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider">Avg Discrimination</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{stats.avgDiscrimination.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Coverage Heatmap */}
      <CoverageHeatmap />
      
      {/* Main Table Card */}
      <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              Item Bank
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowCSVImport(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
              </Button>
              <Button 
                variant="outline" 
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {DIFFICULTIES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8"></th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('text')}
                      className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                    >
                      Question
                      {sortField === 'text' && (
                        sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('subjectName')}
                      className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                    >
                      Subject
                      {sortField === 'subjectName' && (
                        sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('difficulty')}
                      className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                    >
                      Difficulty
                      {sortField === 'difficulty' && (
                        sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('itemStatus')}
                      className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                    >
                      Status
                      {sortField === 'itemStatus' && (
                        sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('examType')}
                      className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                    >
                      Exam Type
                      {sortField === 'examType' && (
                        sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('authorName')}
                      className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                    >
                      Author
                      {sortField === 'authorName' && (
                        sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('updatedAt')}
                      className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                    >
                      Updated
                      {sortField === 'updatedAt' && (
                        sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map((item) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => toggleRow(item.id)}
                  >
                    <td className="px-4 py-3">
                      <motion.div
                        animate={{ rotate: expandedRows.has(item.id) ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </motion.div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-md">
                        <div className="text-sm text-gray-900 line-clamp-2">{item.text}</div>
                        <div className="flex items-center gap-2 mt-1">
                          {item.isPYQ && (
                            <Badge variant="outline" className="text-xs border-purple-200 text-purple-700">
                              PYQ {item.pyqYear}
                            </Badge>
                          )}
                          {item.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{item.subjectName}</div>
                      <div className="text-xs text-gray-500">{item.chapterName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <DifficultyDot difficulty={item.difficulty} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.itemStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-700">{item.examType}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-700">{item.authorName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-500">
                        {item.updatedAt.toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditingItem(item)}
                        >
                          <Edit className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4 text-gray-500" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredItems.length === 0 && (
            <div className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No items found</h3>
              <p className="text-gray-500 mt-1">Try adjusting your filters or search query</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Edit Modal */}
      <EditItemModal 
        item={editingItem}
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveItem}
      />
      
      {/* CSV Import Modal */}
      <CSVImportModal 
        isOpen={showCSVImport}
        onClose={() => setShowCSVImport(false)}
        onImport={handleCSVImport}
      />
    </div>
  )
}
