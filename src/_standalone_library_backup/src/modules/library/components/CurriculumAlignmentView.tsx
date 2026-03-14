'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileText,
  Video,
  Headphones,
  Layers,
  CheckCircle2,
  Circle,
  Target,
  Award,
  Sparkles,
  Globe,
  TrendingUp,
  Zap,
  TreeDeciduous,
  MapPin,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
export interface CurriculumNode {
  id: string
  name: string
  type: 'board' | 'class' | 'subject' | 'chapter' | 'topic'
  code?: string
  description?: string
  coverage: number // 0-100 percentage
  resourceCount: number
  completedCount: number
  children?: CurriculumNode[]
  resources?: CurriculumResource[]
  isExpanded?: boolean
  syllabusRef?: string // NCERT reference
  weightage?: number // Exam weightage
  status?: 'completed' | 'in_progress' | 'not_started'
}

export interface CurriculumResource {
  id: string
  title: string
  type: 'Notes' | 'Video' | 'Audio' | 'PDF' | 'Interactive' | 'Quiz'
  aligned: boolean
  syllabusRefs: string[]
}

export interface CurriculumAlignmentViewProps {
  curriculum: CurriculumNode
  onNodeClick?: (node: CurriculumNode) => void
  onResourceClick?: (resource: CurriculumResource) => void
  className?: string
}

// Board colors
const boardColors: Record<string, { bg: string; text: string; gradient: string }> = {
  NCERT: { bg: 'bg-blue-50', text: 'text-blue-700', gradient: 'from-blue-500 to-cyan-500' },
  CBSE: { bg: 'bg-green-50', text: 'text-green-700', gradient: 'from-green-500 to-emerald-500' },
  ICSE: { bg: 'bg-purple-50', text: 'text-purple-700', gradient: 'from-purple-500 to-violet-500' },
  'State Board': { bg: 'bg-orange-50', text: 'text-orange-700', gradient: 'from-orange-500 to-amber-500' },
}

// Type icons
const typeIcons: Record<string, React.ElementType> = {
  Notes: FileText,
  Video: Video,
  Audio: Headphones,
  PDF: FileText,
  Interactive: Layers,
  Quiz: Zap,
}

// Coverage color
const getCoverageColor = (coverage: number) => {
  if (coverage >= 80) return { text: 'text-green-600', bg: 'bg-green-500', badge: 'bg-green-100 text-green-700' }
  if (coverage >= 50) return { text: 'text-amber-600', bg: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700' }
  return { text: 'text-red-600', bg: 'bg-red-500', badge: 'bg-red-100 text-red-700' }
}

// Node Icon Component
function NodeIcon({ type, coverage }: { type: string; coverage: number }) {
  const iconClass = cn('h-4 w-4', getCoverageColor(coverage).text)
  
  switch (type) {
    case 'board':
      return <Globe className={iconClass} />
    case 'class':
      return <Award className={iconClass} />
    case 'subject':
      return <BookOpen className={iconClass} />
    case 'chapter':
      return <FileText className={iconClass} />
    case 'topic':
      return <Target className={iconClass} />
    default:
      return <Circle className={iconClass} />
  }
}

// Coverage Badge
function CoverageBadge({ coverage, size = 'md' }: { coverage: number; size?: 'sm' | 'md' }) {
  const colors = getCoverageColor(coverage)
  const sizeClass = size === 'sm' ? 'h-5 px-1.5 text-xs' : 'h-6 px-2 text-sm'
  
  return (
    <Badge
      variant="secondary"
      className={cn(sizeClass, 'font-medium border-0', colors.badge)}
    >
      {coverage}% covered
    </Badge>
  )
}

// Resource List Item
function ResourceItem({
  resource,
  onClick,
}: {
  resource: CurriculumResource
  onClick: () => void
}) {
  const TypeIcon = typeIcons[resource.type] || FileText
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.01, x: 4 }}
      onClick={onClick}
      className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-gray-100 hover:border-violet-200 hover:shadow-sm transition-all cursor-pointer"
    >
      <div className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center',
        resource.aligned ? 'bg-green-100' : 'bg-gray-100'
      )}>
        <TypeIcon className={cn('h-4 w-4', resource.aligned ? 'text-green-600' : 'text-gray-500')} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-gray-900 truncate">{resource.title}</div>
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <span>{resource.type}</span>
          {resource.aligned && (
            <span className="text-green-600 flex items-center gap-0.5">
              <CheckCircle2 className="h-3 w-3" />
              NCERT
            </span>
          )}
        </div>
      </div>
      
      {resource.syllabusRefs.length > 0 && (
        <Badge variant="secondary" className="text-xs bg-violet-50 text-violet-700 border-0">
          {resource.syllabusRefs[0]}
        </Badge>
      )}
    </motion.div>
  )
}

// Tree Node Component
function TreeNode({
  node,
  level = 0,
  onNodeClick,
  onResourceClick,
  expandedNodes,
  toggleNode,
}: {
  node: CurriculumNode
  level?: number
  onNodeClick?: (node: CurriculumNode) => void
  onResourceClick?: (resource: CurriculumResource) => void
  expandedNodes: Set<string>
  toggleNode: (id: string) => void
}) {
  const hasChildren = node.children && node.children.length > 0
  const hasResources = node.resources && node.resources.length > 0
  const isExpanded = expandedNodes.has(node.id)
  const colors = getCoverageColor(node.coverage)
  
  // Get node-specific styling
  const getNodeStyle = () => {
    const baseClasses = 'rounded-xl border transition-all'
    
    switch (node.type) {
      case 'board':
        return cn(baseClasses, 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-100')
      case 'class':
        return cn(baseClasses, 'bg-gradient-to-r from-purple-50 to-violet-50 border-purple-100')
      case 'subject':
        return cn(baseClasses, 'bg-white border-gray-100 hover:border-violet-200')
      case 'chapter':
        return cn(baseClasses, 'bg-gray-50 border-gray-100 hover:border-violet-200')
      default:
        return cn(baseClasses, 'bg-white border-gray-100')
    }
  }
  
  return (
    <div className="space-y-2">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={getNodeStyle()}
      >
        <Collapsible
          open={isExpanded}
          onOpenChange={() => hasChildren && toggleNode(node.id)}
        >
          <CollapsibleTrigger asChild>
            <div
              className={cn(
                'flex items-center gap-3 p-3 cursor-pointer select-none',
                level > 0 && 'ml-4'
              )}
              onClick={() => !hasChildren && onNodeClick?.(node)}
            >
              {/* Expand Icon */}
              {hasChildren && (
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </motion.div>
              )}
              
              {/* Node Icon */}
              <div className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center',
                'bg-gradient-to-br',
                boardColors.NCERT.gradient,
                'shadow-sm'
              )}>
                <NodeIcon type={node.type} coverage={node.coverage} />
              </div>
              
              {/* Node Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{node.name}</span>
                  {node.code && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs bg-gray-100 text-gray-600 border-0">
                      {node.code}
                    </Badge>
                  )}
                  {node.syllabusRef && (
                    <Badge className="h-5 px-1.5 text-xs bg-violet-500 text-white border-0">
                      {node.syllabusRef}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span>{node.resourceCount} resources</span>
                  {node.weightage && (
                    <span className="flex items-center gap-1 text-amber-600">
                      <TrendingUp className="h-3 w-3" />
                      {node.weightage}% weightage
                    </span>
                  )}
                </div>
              </div>
              
              {/* Coverage */}
              <div className="flex items-center gap-3">
                <CoverageBadge coverage={node.coverage} size="sm" />
                
                {/* Progress Ring */}
                <div className="relative w-10 h-10">
                  <svg className="w-10 h-10 transform -rotate-90">
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      className="fill-none stroke-gray-200"
                      strokeWidth="3"
                    />
                    <motion.circle
                      cx="20"
                      cy="20"
                      r="16"
                      className={cn('fill-none stroke-current', colors.text)}
                      strokeWidth="3"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: '0 100' }}
                      animate={{ strokeDasharray: `${node.coverage} ${100 - node.coverage}` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={cn('text-xs font-bold', colors.text)}>
                      {node.coverage}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleTrigger>
          
          {/* Children */}
          <AnimatePresence>
            {isExpanded && hasChildren && (
              <CollapsibleContent forceMount>
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pl-6 pr-3 pb-3 space-y-2">
                    {node.children!.map((child) => (
                      <TreeNode
                        key={child.id}
                        node={child}
                        level={level + 1}
                        onNodeClick={onNodeClick}
                        onResourceClick={onResourceClick}
                        expandedNodes={expandedNodes}
                        toggleNode={toggleNode}
                      />
                    ))}
                  </div>
                </motion.div>
              </CollapsibleContent>
            )}
          </AnimatePresence>
          
          {/* Resources */}
          <AnimatePresence>
            {isExpanded && hasResources && (
              <CollapsibleContent forceMount>
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pl-6 pr-3 pb-3 space-y-2">
                    {node.resources!.map((resource) => (
                      <ResourceItem
                        key={resource.id}
                        resource={resource}
                        onClick={() => onResourceClick?.(resource)}
                      />
                    ))}
                  </div>
                </motion.div>
              </CollapsibleContent>
            )}
          </AnimatePresence>
        </Collapsible>
      </motion.div>
    </div>
  )
}

// Demo curriculum data
function generateDemoCurriculum(): CurriculumNode {
  return {
    id: 'ncert',
    name: 'NCERT Curriculum',
    type: 'board',
    code: 'NCERT',
    coverage: 72,
    resourceCount: 256,
    completedCount: 185,
    children: [
      {
        id: 'class-12',
        name: 'Class 12',
        type: 'class',
        code: '12',
        coverage: 78,
        resourceCount: 156,
        completedCount: 122,
        children: [
          {
            id: 'physics-12',
            name: 'Physics',
            type: 'subject',
            code: 'PHY',
            coverage: 85,
            resourceCount: 45,
            completedCount: 38,
            children: [
              {
                id: 'electrostatics',
                name: 'Electrostatics',
                type: 'chapter',
                syllabusRef: 'Ch 1',
                weightage: 15,
                coverage: 90,
                resourceCount: 12,
                completedCount: 11,
                resources: [
                  { id: 'r1', title: 'Coulomb\'s Law - Complete Notes', type: 'Notes', aligned: true, syllabusRefs: ['1.1'] },
                  { id: 'r2', title: 'Electric Field Lines Visualization', type: 'Video', aligned: true, syllabusRefs: ['1.2'] },
                  { id: 'r3', title: 'Gauss\'s Theorem Problems', type: 'Quiz', aligned: true, syllabusRefs: ['1.3'] },
                ],
              },
              {
                id: 'current-electricity',
                name: 'Current Electricity',
                type: 'chapter',
                syllabusRef: 'Ch 2',
                weightage: 12,
                coverage: 75,
                resourceCount: 10,
                completedCount: 7,
                resources: [
                  { id: 'r4', title: 'Ohm\'s Law and Resistance', type: 'Notes', aligned: true, syllabusRefs: ['2.1'] },
                  { id: 'r5', title: 'Kirchhoff\'s Laws Video Lecture', type: 'Video', aligned: true, syllabusRefs: ['2.2'] },
                ],
              },
              {
                id: 'magnetism',
                name: 'Moving Charges & Magnetism',
                type: 'chapter',
                syllabusRef: 'Ch 4',
                weightage: 10,
                coverage: 60,
                resourceCount: 8,
                completedCount: 5,
              },
            ],
          },
          {
            id: 'chemistry-12',
            name: 'Chemistry',
            type: 'subject',
            code: 'CHEM',
            coverage: 70,
            resourceCount: 48,
            completedCount: 34,
            children: [
              {
                id: 'solutions',
                name: 'Solutions',
                type: 'chapter',
                syllabusRef: 'Ch 1',
                weightage: 8,
                coverage: 80,
                resourceCount: 10,
                completedCount: 8,
              },
              {
                id: 'electrochemistry',
                name: 'Electrochemistry',
                type: 'chapter',
                syllabusRef: 'Ch 2',
                weightage: 10,
                coverage: 65,
                resourceCount: 12,
                completedCount: 8,
              },
              {
                id: 'organic-chem',
                name: 'Organic Chemistry',
                type: 'chapter',
                syllabusRef: 'Ch 8-12',
                weightage: 18,
                coverage: 55,
                resourceCount: 18,
                completedCount: 10,
              },
            ],
          },
          {
            id: 'mathematics-12',
            name: 'Mathematics',
            type: 'subject',
            code: 'MATH',
            coverage: 82,
            resourceCount: 52,
            completedCount: 43,
            children: [
              {
                id: 'relations-functions',
                name: 'Relations & Functions',
                type: 'chapter',
                syllabusRef: 'Ch 1',
                weightage: 8,
                coverage: 95,
                resourceCount: 10,
                completedCount: 10,
              },
              {
                id: 'calculus',
                name: 'Calculus',
                type: 'chapter',
                syllabusRef: 'Ch 5-9',
                weightage: 35,
                coverage: 78,
                resourceCount: 25,
                completedCount: 20,
              },
            ],
          },
        ],
      },
      {
        id: 'class-11',
        name: 'Class 11',
        type: 'class',
        code: '11',
        coverage: 65,
        resourceCount: 100,
        completedCount: 65,
        children: [
          {
            id: 'physics-11',
            name: 'Physics',
            type: 'subject',
            coverage: 70,
            resourceCount: 35,
            completedCount: 25,
          },
          {
            id: 'chemistry-11',
            name: 'Chemistry',
            type: 'subject',
            coverage: 60,
            resourceCount: 32,
            completedCount: 20,
          },
        ],
      },
    ],
  }
}

// Summary Card Component
function SummaryCard({ curriculum }: { curriculum: CurriculumNode }) {
  return (
    <Card className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
          <TreeDeciduous className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Curriculum Coverage</h3>
          <p className="text-sm text-gray-500">NCERT alignment overview</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-violet-600">{curriculum.coverage}%</div>
          <div className="text-xs text-gray-500">Overall</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{curriculum.completedCount}</div>
          <div className="text-xs text-gray-500">Completed</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-amber-600">{curriculum.resourceCount - curriculum.completedCount}</div>
          <div className="text-xs text-gray-500">Remaining</div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Overall Progress</span>
          <span className="font-medium text-violet-600">{curriculum.coverage}%</span>
        </div>
        <Progress value={curriculum.coverage} className="h-2" />
      </div>
    </Card>
  )
}

export function CurriculumAlignmentView({
  curriculum: providedCurriculum,
  onNodeClick,
  onResourceClick,
  className,
}: CurriculumAlignmentViewProps) {
  const curriculum = providedCurriculum || generateDemoCurriculum()
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['ncert', 'class-12']))
  const [searchQuery, setSearchQuery] = useState('')
  
  const toggleNode = useCallback((id: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])
  
  const expandAll = useCallback(() => {
    const getAllIds = (node: CurriculumNode): string[] => {
      const ids = [node.id]
      if (node.children) {
        node.children.forEach(child => {
          ids.push(...getAllIds(child))
        })
      }
      return ids
    }
    setExpandedNodes(new Set(getAllIds(curriculum)))
  }, [curriculum])
  
  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set(['ncert']))
  }, [])
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Curriculum Alignment</h2>
            <p className="text-sm text-gray-500">NCERT syllabus coverage map</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={expandAll}
            className="border-gray-200 hover:border-violet-300"
          >
            Expand All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={collapseAll}
            className="border-gray-200 hover:border-violet-300"
          >
            Collapse
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Summary Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <SummaryCard curriculum={curriculum} />
          
          {/* Board Badges */}
          <Card className="p-4 border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Aligned Boards</h4>
            <div className="space-y-2">
              {Object.entries(boardColors).slice(0, 3).map(([board, colors]) => (
                <div
                  key={board}
                  className="flex items-center gap-2 p-2 rounded-lg bg-gray-50"
                >
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br', colors.gradient)}>
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{board}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
        
        {/* Curriculum Tree */}
        <div className="lg:col-span-3">
          <Card className="border-gray-100 rounded-2xl overflow-hidden">
            <ScrollArea className="h-[600px] p-4">
              <TreeNode
                node={curriculum}
                onNodeClick={onNodeClick}
                onResourceClick={onResourceClick}
                expandedNodes={expandedNodes}
                toggleNode={toggleNode}
              />
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CurriculumAlignmentView
